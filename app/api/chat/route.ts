import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { generateKeyPair } from "@/lib/encryption/keys"

export async function POST(req: NextRequest) {
  const user = await auth(req)
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { receiverId } = await req.json()

    // Ensure both users have public keys
    const [sender, receiver] = await Promise.all([
      prisma.user.findUnique({
        where: { id: user.id },
        select: { publicKey: true }
      }),
      prisma.user.findUnique({
        where: { id: receiverId },
        select: { publicKey: true }
      })
    ])

    // Generate keys if not present
    if (!sender?.publicKey) {
      const { publicKey } = generateKeyPair()
      await prisma.user.update({
        where: { id: user.id },
        data: { publicKey }
      })
    }

    if (!receiver?.publicKey) {
      const { publicKey } = generateKeyPair()
      await prisma.user.update({
        where: { id: receiverId },
        data: { publicKey }
      })
    }

    return NextResponse.json({ chatId: receiverId })
  } catch (error) {
    console.error("Error creating chat:", error)
    return NextResponse.json({ error: "Failed to create chat" }, { status: 500 })
  }
}


