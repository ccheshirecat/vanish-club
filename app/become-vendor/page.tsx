"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth-context"

export default function BecomeVendorPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuth()

  const handleBecomeVendor = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to become a vendor.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/user/become-vendor", {
        method: "POST",
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "You are now a vendor!",
        })
        router.push("/vendor/dashboard")
      } else {
        throw new Error("Failed to become a vendor")
      }
    } catch (error) {
      console.error("Error becoming a vendor:", error)
      toast({
        title: "Error",
        description: "Failed to become a vendor. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Become a Vendor</h1>
      {user ? (
        <>
          <p className="mb-4">
            As a vendor, you'll be able to create listings and sell your products or services on our platform.
          </p>
          <Button onClick={handleBecomeVendor} disabled={isLoading}>
            {isLoading ? "Processing..." : "Become a Vendor"}
          </Button>
        </>
      ) : (
        <p>You must be logged in to become a vendor. Please log in and try again.</p>
      )}
    </div>
  )
}

