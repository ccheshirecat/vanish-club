"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useNotification } from "@/lib/notification-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ProtectedRoute } from "@/components/protected-route"
import Link from "next/link"

interface DashboardStats {
  totalUsers: number
  totalVendors: number
  totalListings: number
}


export default function AdminDashboard() {
  const { user } = useAuth()
  const { showNotification } = useNotification()
  const [stats, setStats] = useState<DashboardStats | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/admin/dashboard-stats")
        if (response.ok) {
          const data = await response.json()
          setStats(data)
        } else {
          throw new Error("Failed to fetch dashboard stats")
        }
      } catch (error) {
        console.error("Error fetching dashboard stats:", error)
        showNotification("Failed to load dashboard stats", "error")
      }
    }

    fetchStats()
  }, [showNotification])

  return (
    <ProtectedRoute requireAdmin>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-100 mb-6">Admin Dashboard</h1>
        {stats ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Total Users</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{stats.totalUsers}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Total Vendors</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{stats.totalVendors}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Total Listings</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{stats.totalListings}</p>
              </CardContent>
            </Card>


          </div>
        ) : (
          <p className="text-center text-gray-400">Loading dashboard stats...</p>
        )}
        <div className="mt-8 space-y-4">
          <Link href="/admin/users" className="block">
            <Card>
              <CardHeader>
                <CardTitle>Manage Users</CardTitle>
              </CardHeader>
              <CardContent>
                <p>View, edit, and manage user accounts, including vendor and admin status.</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/admin/listings" className="block">
            <Card>
              <CardHeader>
                <CardTitle>Manage Listings</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Review, approve, or remove listings from the marketplace.</p>
              </CardContent>
            </Card>
          </Link>


        </div>
      </div>
    </ProtectedRoute>
  )
}

