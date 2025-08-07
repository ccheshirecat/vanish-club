import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET(req: NextRequest, { params }: { params: { conversationId: string } }) {
  const user = await auth(req)

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { AND: [{ senderId: user.id }, { receiverId: params.conversationId }] },
          { AND: [{ senderId: params.conversationId }, { receiverId: user.id }] }
        ]
      },
      orderBy: { createdAt: "asc" },
      include: {
        sender: true,
        receiver: true
      }
    })

    return NextResponse.json(messages)
  } catch (error) {
    console.error("Error fetching messages:", error)
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 })
  }
}

export async function POST(req: NextRequest, { params }: { params: { conversationId: string } }) {
  const user = await auth(req)

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { content, encryptedKey, iv, type = "INQUIRY", expiresAt } = await req.json()

    const message = await prisma.message.create({
      data: {
      content,
      encryptedKey,
      iv,
      type,
      senderId: user.id,
      receiverId: params.conversationId,
      expiresAt: expiresAt ? new Date(expiresAt) : null
      },
      include: {
      sender: true,
      receiver: true
      }
    })

    return NextResponse.json(message)
  } catch (error) {
    console.error("Error sending message:", error)
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
  }
}


