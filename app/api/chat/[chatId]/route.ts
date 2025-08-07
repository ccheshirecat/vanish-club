import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function POST(req: NextRequest, { params }: { params: { chatId: string } }) {
  const user = await auth(req)

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { content, encryptedKey, iv, type, expiresAt } = await req.json()

    const message = await prisma.message.create({
      data: {
      content,
      encryptedKey,
      iv,
      type: type || "INQUIRY",
      senderId: user.id,
      receiverId: params.chatId,
      expiresAt: expiresAt ? new Date(expiresAt) : null
      },
    })

    return NextResponse.json(message)
  } catch (error) {
    console.error("Error sending message:", error)
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
  }
}