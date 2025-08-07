"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useNotification } from "@/lib/notification-context"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ImageUpload } from "@/components/image-upload"

interface DisputeFormProps {
  listingId: string
  vendorId: string
  onSubmit?: () => void
}

export function DisputeForm({ listingId, vendorId, onSubmit }: DisputeFormProps) {
  const { user } = useAuth()
  const { showNotification } = useNotification()
  const [reason, setReason] = useState("")
  const [evidence, setEvidence] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/disputes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId,
          vendorId,
          reason,
          evidence,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to submit dispute")
      }

        showNotification("Dispute submitted successfully", "success")
      setReason("")
      setEvidence([])
      onSubmit?.()
    } catch (error) {
      console.error("Error submitting dispute:", error)
        showNotification("Failed to submit dispute", "error")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submit Dispute</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-2">Reason for Dispute</label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Describe the issue in detail..."
              className="min-h-[100px]"
              required
            />
          </div>
          <div>
            <label className="block mb-2">Evidence (Optional)</label>
            <ImageUpload images={evidence} setImages={setEvidence} maxImages={5} />
            <p className="text-sm text-gray-400 mt-1">Upload screenshots or other evidence to support your case</p>
          </div>
          <Button type="submit" disabled={isSubmitting || !reason.trim()} className="w-full">
            {isSubmitting ? "Submitting..." : "Submit Dispute"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

