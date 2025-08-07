import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET(req: NextRequest) {
  const user = await auth(req)

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Get all messages where user is either sender or receiver
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: user.id },
          { receiverId: user.id }
        ]
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
          }
        },
        receiver: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Group messages by conversation partner
    const conversations = messages.reduce((acc, message) => {
      const partnerId = message.senderId === user.id ? message.receiverId : message.senderId
      const partner = message.senderId === user.id ? message.receiver : message.sender
      
      if (!acc[partnerId]) {
        acc[partnerId] = {
          partner,
          lastMessage: message,
          updatedAt: message.createdAt
        }
      }
      return acc
    }, {} as Record<string, any>)

    // Convert to array and sort by last message date
    const sortedConversations = Object.values(conversations).sort(
      (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
    )

    return NextResponse.json(sortedConversations)
  } catch (error) {
    console.error("Error fetching conversations:", error)
    return NextResponse.json({ error: "Failed to fetch conversations" }, { status: 500 })
  }
}


