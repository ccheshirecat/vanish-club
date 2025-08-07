import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { generateKeyPair } from "@/lib/encryption/keys"

export async function GET(
	req: NextRequest,
	{ params }: { params: { userId: string } }
) {
	const user = await auth(req)
	if (!user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
	}

	try {
		// Get or generate user's public key
		let userKeys = await prisma.user.findUnique({
			where: { id: params.userId },
			select: { publicKey: true }
		})

		if (!userKeys?.publicKey) {
			// Generate new key pair if none exists
			const { publicKey } = generateKeyPair()
			userKeys = await prisma.user.update({
				where: { id: params.userId },
				data: { publicKey },
				select: { publicKey: true }
			})
		}

		return NextResponse.json({ publicKey: userKeys.publicKey })
	} catch (error) {
		console.error("Error fetching public key:", error)
		return NextResponse.json(
			{ error: "Failed to fetch public key" },
			{ status: 500 }
		)
	}
}