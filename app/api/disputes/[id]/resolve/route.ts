import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function POST(
	req: NextRequest,
	{ params }: { params: { id: string } }
) {
	const user = await auth(req)
	if (!user?.isAdmin) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
	}

	try {
		const { resolveFor } = await req.json()
		const dispute = await prisma.dispute.findUnique({
			where: { id: params.id },
			include: {
				vendor: true,
				user: true,
			},
		})

		if (!dispute) {
			return NextResponse.json({ error: "Dispute not found" }, { status: 404 })
		}

		if (dispute.status !== "OPEN") {
			return NextResponse.json(
				{ error: "Dispute is already resolved" },
				{ status: 400 }
			)
		}

		// Update dispute status
		const updatedDispute = await prisma.dispute.update({
			where: { id: params.id },
			data: {
				status: "RESOLVED"
			},
		})




		// Update vendor reputation based on resolution
		if (resolveFor === "USER") {
			await prisma.user.update({
				where: { id: dispute.vendorId },
				data: {
					reputation: {
						decrement: 0.1,
					},
				},
			})
		}

		return NextResponse.json(updatedDispute)
	} catch (error) {
		console.error("Error resolving dispute:", error)
		return NextResponse.json(
			{ error: "Failed to resolve dispute" },
			{ status: 500 }
		)
	}
}