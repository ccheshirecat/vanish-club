"use client"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/lib/auth-context"
import { useNotification } from "@/lib/notification-context"
import type { Message } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Send } from "lucide-react"

export function Chat({ chatId, listingId }: { chatId: string; listingId: string }) {
  const { user } = useAuth()
  const { showNotification } = useNotification()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch(`/api/chat/${chatId}/messages`)
        if (response.ok) {
          const data = await response.json()
          setMessages(data)
        } else {
          throw new Error("Failed to fetch messages")
        }
      } catch (error) {
        console.error("Error fetching messages:", error)
        showNotification("Failed to load messages", "error")
      }
    }

    fetchMessages()

    const eventSource = new EventSource(`/api/chat/${chatId}/sse`)

    eventSource.onmessage = (event) => {
      const message = JSON.parse(event.data)
      setMessages((prevMessages) => [...prevMessages, message])
    }

    eventSource.onerror = (error) => {
      console.error("SSE error:", error)
      eventSource.close()
    }

    return () => {
      eventSource.close()
    }
  }, [chatId, showNotification])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  const sendMessage = async () => {
    if (!newMessage.trim()) return

    try {
      const response = await fetch(`/api/chat/${chatId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: newMessage,
        }),
      })


      if (!response.ok) {
        throw new Error("Failed to send message")
      }

      setNewMessage("")
    } catch (error) {
      console.error("Error sending message:", error)
        showNotification("Failed to send message", "error")
    }
  }

  return (
    <Card className="flex flex-col h-[400px] bg-gray-900/50 border-gray-800">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.senderId === user?.id ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[70%] px-4 py-2 rounded-lg ${
                message.senderId === user?.id ? "bg-purple-600 text-white" : "bg-gray-800 text-gray-100"
              }`}
            >
              {message.content}

            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-gray-800">
        <div className="flex space-x-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="bg-gray-800 border-gray-700"
            onKeyPress={(e) => {
              if (e.key === "Enter" && newMessage.trim()) {
                sendMessage()
              }
            }}
          />
          <Button
            onClick={sendMessage}
            disabled={!newMessage.trim()}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  )
}

