"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useNotification } from "@/lib/notification-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ProtectedRoute } from "@/components/protected-route"
import { Send } from "lucide-react"

interface Message {
  id: string
  senderId: string
  receiverId: string
  content: string
  createdAt: string
}

interface Conversation {
  id: string
  participantId: string
  participantName: string
  lastMessage: string
  lastMessageDate: string
}

export default function MessagesPage() {
  const { user } = useAuth()
  const { showNotification } = useNotification()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await fetch("/api/messages/conversations")
        if (response.ok) {
          const data = await response.json()
          setConversations(data)
        } else {
          throw new Error("Failed to fetch conversations")
        }
      } catch (error) {
        console.error("Error fetching conversations:", error)
        showNotification("Failed to load conversations", "error")
      } finally {
        setIsLoading(false)
      }
    }

    fetchConversations()
  }, [showNotification])

  useEffect(() => {
    if (selectedConversation) {
      const fetchMessages = async () => {
        try {
          const response = await fetch(`/api/messages/${selectedConversation}`)
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
    }
  }, [selectedConversation, showNotification])

  const handleSendMessage = async () => {
    if (!selectedConversation || !newMessage.trim()) return

    try {
      const response = await fetch(`/api/messages/${selectedConversation}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: newMessage }),
      })

      if (response.ok) {
        const sentMessage = await response.json()
        setMessages([...messages, sentMessage])
        setNewMessage("")
      } else {
        throw new Error("Failed to send message")
      }
    } catch (error) {
      console.error("Error sending message:", error)
      showNotification("Failed to send message", "error")
    }
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-100 mb-6">Messages</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-1 bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-100">Conversations</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p className="text-center text-gray-400">Loading conversations...</p>
              ) : (
                <ul className="space-y-2">
                  {conversations.map((conversation) => (
                    <li
                      key={conversation.id}
                      className={`p-2 rounded-md cursor-pointer ${
                        selectedConversation === conversation.id ? "bg-purple-600" : "hover:bg-gray-700"
                      }`}
                      onClick={() => setSelectedConversation(conversation.id)}
                    >
                      <p className="font-semibold text-gray-100">{conversation.participantName}</p>
                      <p className="text-sm text-gray-400 truncate">{conversation.lastMessage}</p>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
          <Card className="md:col-span-2 bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-100">
                {selectedConversation
                  ? conversations.find((c) => c.id === selectedConversation)?.participantName
                  : "Select a conversation"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedConversation ? (
                <>
                  <div className="h-96 overflow-y-auto mb-4 space-y-2">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`p-2 rounded-md ${
                          message.senderId === user?.id ? "bg-purple-600 ml-auto" : "bg-gray-700"
                        } max-w-[70%]`}
                      >
                        <p className="text-gray-100">{message.content}</p>
                        <p className="text-xs text-gray-400 text-right">
                          {new Date(message.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="bg-gray-900 border-gray-800 text-gray-100"
                      onKeyPress={(e) => {
                        if (e.key === "Enter" && newMessage.trim()) {
                          handleSendMessage()
                        }
                      }}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </>
              ) : (
                <p className="text-center text-gray-400">Select a conversation to start messaging</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}

