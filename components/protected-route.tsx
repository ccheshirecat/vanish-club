"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import type React from "react"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

interface ProtectedRouteProps {
  children: React.ReactNode
  requireVendor?: boolean
  requireAdmin?: boolean
}

export function ProtectedRoute({ children, requireVendor = false, requireAdmin = false }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/")
    } else if (!isLoading && requireVendor && !user?.isVendor) {
      router.push("/become-vendor")
    } else if (!isLoading && requireAdmin && !user?.isAdmin) {
      router.push("/")
    }
  }, [user, isLoading, requireVendor, requireAdmin, router])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner fullPage />
      </div>
    )
  }

  if (!user || (requireVendor && !user.isVendor) || (requireAdmin && !user.isAdmin)) {
    return null
  }

  return <>{children}</>
}

