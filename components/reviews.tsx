"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useNotification } from "@/lib/notification-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Star } from "lucide-react"

interface Review {
  id: string
  rating: number
  comment: string
  createdAt: string
  reviewer: {
    username: string
    displayName: string
    avatar: string
  }
}

interface ReviewsProps {
  vendorId?: string
  listingId?: string
}

export function Reviews({ vendorId, listingId }: ReviewsProps) {
  const { user } = useAuth()
  const { showNotification } = useNotification()
  const [reviews, setReviews] = useState<Review[]>([])
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchReviews()
  }, [])

  const fetchReviews = async () => {
    try {
      const response = await fetch(`/api/reviews?${vendorId ? `vendorId=${vendorId}` : `listingId=${listingId}`}`)
      if (response.ok) {
        const data = await response.json()
        setReviews(data)
      } else {
        throw new Error("Failed to fetch reviews")
      }
    } catch (error) {
      console.error("Error fetching reviews:", error)
        showNotification("Failed to load reviews", "error")
    }
  }

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vendorId, listingId, rating, comment }),
      })

      if (response.ok) {
        showNotification("Review submitted successfully", "success")
        setRating(0)
        setComment("")
        fetchReviews()
      } else {
        throw new Error("Failed to submit review")
      }
    } catch (error) {
      console.error("Error submitting review:", error)
        showNotification("Failed to submit review", "error")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          {reviews.map((review) => (
            <div key={review.id} className="mb-4 p-4 bg-gray-800 rounded-lg">
              <div className="flex items-center mb-2">
                <img
                  src={review.reviewer.avatar || "/placeholder.svg"}
                  alt={review.reviewer.displayName}
                  className="w-8 h-8 rounded-full mr-2"
                />
                <span className="font-semibold">{review.reviewer.displayName}</span>
              </div>
              <div className="flex items-center mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < review.rating ? "text-yellow-400" : "text-gray-400"}`}
                    fill={i < review.rating ? "currentColor" : "none"}
                  />
                ))}
              </div>
              <p className="text-gray-300">{review.comment}</p>
              <p className="text-sm text-gray-400 mt-2">{new Date(review.createdAt).toLocaleDateString()}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {user && (
        <Card>
          <CardHeader>
            <CardTitle>Leave a Review</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="block mb-2">Rating</label>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-6 h-6 cursor-pointer ${i < rating ? "text-yellow-400" : "text-gray-400"}`}
                      fill={i < rating ? "currentColor" : "none"}
                      onClick={() => setRating(i + 1)}
                    />
                  ))}
                </div>
              </div>
              <div>
                <label htmlFor="comment" className="block mb-2">
                  Comment
                </label>
                <Textarea
                  id="comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="bg-gray-900 border-gray-800 text-gray-100"
                  rows={4}
                />
              </div>
              <Button type="submit" disabled={isSubmitting || rating === 0 || comment.trim() === ""}>
                {isSubmitting ? "Submitting..." : "Submit Review"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

