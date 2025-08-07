"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ImageUpload } from "@/components/image-upload"
import { ProtectedRoute } from "@/components/protected-route"
import { useNotification } from "@/lib/notification-context"

export default function NewListing() {
  const router = useRouter()
  const { showNotification } = useNotification()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [minPrice, setMinPrice] = useState<number | null>(null)
  const [maxPrice, setMaxPrice] = useState<number | null>(null)
  const [contactPrice, setContactPrice] = useState(false)
  const [images, setImages] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    if (!title || !description || !category) {
      showNotification("Please fill in all required fields", "error")
      setIsSubmitting(false)
      return
    }


    try {
      const response = await fetch("/api/vendor/listings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          category,
            minPrice,
            maxPrice,
            contactPrice,
          images,
        }),
      })

      if (response.ok) {
        showNotification("Listing created successfully", "success")
        router.push("/vendor/dashboard")
      } else {
        throw new Error("Failed to create listing")
      }
    } catch (error) {
      console.error("Error creating listing:", error)
        showNotification("Failed to create listing", "error")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <ProtectedRoute requireVendor>
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-100">Create New Listing</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter listing title"
                  className="bg-gray-900 border-gray-800"
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your listing"
                  className="bg-gray-900 border-gray-800"
                  required
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={setCategory} required>
                  <SelectTrigger className="bg-gray-900 border-gray-800">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="digital-services">Digital Services</SelectItem>
                    <SelectItem value="creative-works">Creative Works</SelectItem>
                    <SelectItem value="consulting">Consulting</SelectItem>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="writing-translation">Writing & Translation</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
                <div className="space-y-4">
                <div>
                  <Label htmlFor="min-price">Minimum Price</Label>
                  <Input
                  id="min-price"
                  type="number"
                  value={minPrice || ""}
                  onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : null)}
                  className="bg-gray-900 border-gray-800"
                  />
                </div>
                <div>
                  <Label htmlFor="max-price">Maximum Price</Label>
                  <Input
                  id="max-price"
                  type="number"
                  value={maxPrice || ""}
                  onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : null)}
                  className="bg-gray-900 border-gray-800"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                  type="checkbox"
                  id="contact-price"
                  checked={contactPrice}
                  onChange={(e) => setContactPrice(e.target.checked)}
                  className="bg-gray-900 border-gray-800"
                  />
                  <Label htmlFor="contact-price">Contact for Price</Label>
                </div>
                </div>

              <div>
                <Label>Images</Label>
                <ImageUpload images={images} setImages={setImages} />
              </div>
              <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Listing"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  )
}

