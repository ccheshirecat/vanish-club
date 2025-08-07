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
      orderBy: { createdAt: "desc" },
      take: 50,
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
            avatar: true,
            publicKey: true
          }
        }
      }
    })

    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      start(controller) {
        const send = (data: any) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
        }

        // Send initial messages
        send({ type: 'initial', messages })

        // Keep connection alive
        const interval = setInterval(() => {
          send({ type: 'ping' })
        }, 30000)

        // Cleanup on close
        req.signal.addEventListener('abort', () => {
          clearInterval(interval)
          controller.close()
        })
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error) {
    console.error("Error in SSE:", error)
    return NextResponse.json({ error: "SSE connection failed" }, { status: 500 })
  }
}


