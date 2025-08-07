"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { ProtectedRoute } from "@/components/protected-route"

import { useToast } from "@/components/ui/use-toast"
import type { Listing } from "@/lib/types"

export default function EditListing({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [listing, setListing] = useState<Listing | null>(null)

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const response = await fetch(`/api/vendor/listings/${params.id}`)
        if (response.ok) {
          const data = await response.json()
          setListing(data)
        } else {
          throw new Error("Failed to fetch listing")
        }
      } catch (error) {
        console.error("Error fetching listing:", error)
        toast({
          title: "Error",
          description: "Failed to fetch listing. Please try again.",
          variant: "destructive",
        })
      }
    }

    fetchListing()
  }, [params.id, toast])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!listing) return

    try {
      const response = await fetch(`/api/vendor/listings/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(listing),
      })

      if (response.ok) {
        toast({
          title: "Listing updated",
          description: "Your listing has been updated successfully.",
        })
        router.push("/vendor/dashboard")
      } else {
        throw new Error("Failed to update listing")
      }
    } catch (error) {
      console.error("Error updating listing:", error)
      toast({
        title: "Error",
        description: "Failed to update listing. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (!listing) {
    return <div>Loading...</div>
  }

  return (
    <ProtectedRoute requireVendor>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-100 mb-8">Edit Listing</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={listing.title}
              onChange={(e) => setListing({ ...listing, title: e.target.value })}
              className="bg-gray-900 border-gray-800"
              required
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={listing.description}
              onChange={(e) => setListing({ ...listing, description: e.target.value })}
              className="bg-gray-900 border-gray-800"
              required
            />
          </div>
          <div>
            <Label htmlFor="category">Category</Label>
            <Select
              value={listing.category}
              onValueChange={(value) => setListing({ ...listing, category: value })}
              required
            >
              <SelectTrigger className="bg-gray-900 border-gray-800">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="digital-services">Digital Services</SelectItem>
                <SelectItem value="creative-works">Creative Works</SelectItem>
                <SelectItem value="consulting">Consulting</SelectItem>
              </SelectContent>
            </Select>
          </div>
            <div className="space-y-4">
              <div>
              <Label htmlFor="minPrice">Minimum Price</Label>
              <Input
                id="minPrice"
                type="number"
                value={listing.minPrice || ''}
                onChange={(e) => setListing({ ...listing, minPrice: e.target.value ? Number(e.target.value) : null })}
                className="bg-gray-900 border-gray-800"
              />
              </div>
              <div>
              <Label htmlFor="maxPrice">Maximum Price</Label>
              <Input
                id="maxPrice"
                type="number"
                value={listing.maxPrice || ''}
                onChange={(e) => setListing({ ...listing, maxPrice: e.target.value ? Number(e.target.value) : null })}
                className="bg-gray-900 border-gray-800"
              />
              </div>
              <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="contactPrice"
                checked={listing.contactPrice}
                onChange={(e) => setListing({ ...listing, contactPrice: e.target.checked })}
                className="bg-gray-900 border-gray-800"
              />
              <Label htmlFor="contactPrice">Contact for Price</Label>
              </div>
            </div>

            <Button type="submit" className="bg-purple-600 hover:bg-purple-700">

            Update Listing
          </Button>
        </form>
      </div>
    </ProtectedRoute>
  )
}

