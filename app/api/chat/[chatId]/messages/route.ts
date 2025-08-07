import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET(req: NextRequest, { params }: { params: { chatId: string } }) {
  const user = await auth(req)
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const messages = await prisma.message.findMany({
        where: {
        AND: [
          {
          OR: [
            { AND: [{ senderId: user.id }, { receiverId: params.chatId }] },
            { AND: [{ senderId: params.chatId }, { receiverId: user.id }] }
          ]
          },
          {
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: new Date() } }
          ]
          }
        ]
        },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        content: true,
        encryptedKey: true,
        iv: true,
        type: true,
        createdAt: true,
        expiresAt: true,
        senderId: true,
        sender: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true
          }
        }
      }
    })

    // Messages are already encrypted, just return them
    return NextResponse.json(messages)
  } catch (error) {
    console.error("Error fetching messages:", error)
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 })
  }
}

export async function POST(req: NextRequest, { params }: { params: { chatId: string } }) {
  const user = await auth(req)
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { content, encryptedKey, iv, expiresAt, type = "INQUIRY" } = await req.json()

    const message = await prisma.message.create({
      data: {
        content,
        encryptedKey,
        iv,
        type,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        sender: { connect: { id: user.id } },
        receiver: { connect: { id: params.chatId } }
      }
    })

    return NextResponse.json(message)
  } catch (error) {
    console.error("Error creating message:", error)
    return NextResponse.json({ error: "Failed to create message" }, { status: 500 })
  }
}

