"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useNotification } from "@/lib/notification-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ProtectedRoute } from "@/components/protected-route"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { ImageUpload } from "@/components/image-upload"

export default function ProfilePage() {
  const { user, setUser } = useAuth()
  const { showNotification } = useNotification()
  const [displayName, setDisplayName] = useState("")
  const [bio, setBio] = useState("")
  const [avatar, setAvatar] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName)
      setBio(user.bio || "")
      setAvatar(user.avatar || null)
    }
  }, [user])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("/api/user/update-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName, bio, avatar }),
      })

      if (response.ok) {
        const updatedUser = await response.json()
        setUser(updatedUser)
        showNotification("Profile updated successfully", "success")
      } else {
        throw new Error("Failed to update profile")
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      showNotification("Failed to update profile", "error")
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) {
    return <LoadingSpinner />
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-100">User Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="flex items-center space-x-4">
                <img
                  src={avatar || "/placeholder.svg"}
                  alt={displayName}
                  className="w-24 h-24 rounded-full object-cover"
                />
                <div>
                  <Label htmlFor="avatar">Profile Picture</Label>
                  <ImageUpload
                    images={avatar ? [avatar] : []}
                    setImages={(images) => setAvatar(images[0] || null)}
                    maxImages={1}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="bg-gray-900 border-gray-800 text-gray-100"
                />
              </div>
              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="bg-gray-900 border-gray-800 text-gray-100"
                  rows={4}
                />
              </div>
              <div>
                <Label>Username</Label>
                <Input value={user.username} disabled className="bg-gray-900 border-gray-800 text-gray-400" />
              </div>
              <div>
                <Label>Email</Label>
                <Input value={user.email || "Not set"} disabled className="bg-gray-900 border-gray-800 text-gray-400" />
              </div>
              <Button type="submit" disabled={isLoading} className="w-full bg-purple-600 hover:bg-purple-700">
                {isLoading ? "Updating..." : "Update Profile"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  )
}

