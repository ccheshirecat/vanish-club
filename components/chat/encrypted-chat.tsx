"use client"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/lib/auth-context"
import { useNotification } from "@/lib/notification-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { Send, Clock, Lock } from "lucide-react"
import { 
  generateAESKey, 
  encryptAES, 
  decryptAES, 
  encryptKey, 
  decryptKey,
  createSelfDestructingMessage 
} from "@/lib/encryption/keys"
import type { Message } from "@/lib/types"


interface EncryptedChatProps {
  chatId: string
  recipientPublicKey: string
  myPrivateKey: string
}

export function EncryptedChat({ chatId, recipientPublicKey, myPrivateKey }: EncryptedChatProps) {
  const { user } = useAuth()
  const { showNotification } = useNotification()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [selfDestructTime, setSelfDestructTime] = useState<number | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [isEncrypting, setIsEncrypting] = useState(false)

  const encryptMessageForSending = async (text: string) => {
    const { key, iv } = generateAESKey()
    const encryptedContent = encryptAES(text, key, iv)
    const encryptedKey = encryptKey(key, recipientPublicKey)
    
    return {
      content: encryptedContent,
      encryptedKey,
      iv: iv.toString('base64')
    }
  }

  const decryptReceivedMessage = async (message: any) => {
    try {
      const aesKey = decryptKey(message.encryptedKey, myPrivateKey)
      const decryptedContent = decryptAES(message.content, aesKey)
      return decryptedContent
    } catch (error) {
      console.error('Failed to decrypt message:', error)
      return 'Failed to decrypt message'
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim()) return
    setIsEncrypting(true)
    
    try {
      const { content, encryptedKey, iv } = await encryptMessageForSending(newMessage)
      
      let messageData: any = {
        content,
        encryptedKey,
        iv
      }

      if (selfDestructTime) {
        const { expiresAt } = createSelfDestructingMessage(newMessage, selfDestructTime)
        messageData.expiresAt = expiresAt
      }

      const response = await fetch(`/api/chat/${chatId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(messageData),
      })

      if (!response.ok) throw new Error("Failed to send message")
      
      setNewMessage("")
      setSelfDestructTime(null)
    } catch (error) {
      console.error("Error sending message:", error)
      showNotification("Failed to send message", "error")
    } finally {
      setIsEncrypting(false)
    }
  }

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch(`/api/chat/${chatId}/messages`)
        if (response.ok) {
          const encryptedMessages = await response.json()
          const decryptedMessages = await Promise.all(
            encryptedMessages.map(async (msg: any) => ({
              ...msg,
              content: await decryptReceivedMessage(msg)
            }))
          )
          setMessages(decryptedMessages)
        }
      } catch (error) {
        console.error("Error fetching messages:", error)
        showNotification("Failed to load messages", "error")
      }
    }

    fetchMessages()

    const eventSource = new EventSource(`/api/chat/${chatId}/sse`)
    eventSource.onmessage = async (event) => {
      const encryptedMessage = JSON.parse(event.data)
      const decryptedContent = await decryptReceivedMessage(encryptedMessage)
      setMessages(prev => [...prev, { ...encryptedMessage, content: decryptedContent }])
    }

    return () => eventSource.close()
  }, [chatId, myPrivateKey, showNotification])

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
              <div className="flex items-center gap-2 mb-1">
                <Lock className="h-3 w-3 text-gray-300" />
                {message.expiresAt && <Clock className="h-3 w-3 text-gray-300" />}
              </div>
              {message.content}
              {message.expiresAt && (
                <div className="text-xs text-gray-300 mt-1">
                  Expires: {new Date(message.expiresAt).toLocaleTimeString()}
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-gray-800">
        <div className="flex flex-col space-y-2">
          <div className="flex items-center space-x-2">
            <Select
              value={selfDestructTime?.toString() || ""}
              onValueChange={(value) => setSelfDestructTime(Number(value))}
            >
              <option value="">No self-destruct</option>
              <option value="300">5 minutes</option>
              <option value="3600">1 hour</option>
              <option value="86400">24 hours</option>
            </Select>
          </div>
          <div className="flex space-x-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="bg-gray-800 border-gray-700"
              onKeyPress={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  sendMessage()
                }
              }}
            />
            <Button
              onClick={sendMessage}
              disabled={!newMessage.trim() || isEncrypting}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}

