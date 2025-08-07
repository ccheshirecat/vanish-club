"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, LineChart } from "@/components/ui/charts"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import {
  Select,
  SelectGroup,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
} from "@/components/ui/select"
import { ProtectedRoute } from "@/components/protected-route"

interface AnalyticsData {
  newUsers: number[]
  newListings: number[]
  activeChats: number[]
  disputes: number[]
  categories: {
    name: string
    count: number
  }[]
  revenue: {
    date: string
    amount: number
  }[]
}

export default function AdminAnalytics() {
  const [dateRange, setDateRange] = useState<[Date, Date]>([
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    new Date(),
  ])
  const [metrics, setMetrics] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch(
          `/api/admin/analytics?start=${dateRange[0].toISOString()}&end=${dateRange[1].toISOString()}`,
        )
        if (response.ok) {
          const data = await response.json()
          setMetrics(data)
        }
      } catch (error) {
        console.error("Error fetching analytics:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnalytics()
  }, [dateRange])

  return (
    <ProtectedRoute requireAdmin>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-100">Platform Analytics</h1>
          <DateRangePicker value={dateRange} onChange={setDateRange} />
        </div>

        {isLoading ? (
          <div className="text-center">Loading analytics...</div>
        ) : metrics ? (
          <div className="space-y-6">
            {/* Growth Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>New Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <LineChart data={metrics.newUsers} labels={dateRange.map((d) => d.toLocaleDateString())} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>New Listings</CardTitle>
                </CardHeader>
                <CardContent>
                  <LineChart data={metrics.newListings} labels={dateRange.map((d) => d.toLocaleDateString())} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Active Chats</CardTitle>
                </CardHeader>
                <CardContent>
                  <LineChart data={metrics.activeChats} labels={dateRange.map((d) => d.toLocaleDateString())} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Disputes</CardTitle>
                </CardHeader>
                <CardContent>
                  <LineChart data={metrics.disputes} labels={dateRange.map((d) => d.toLocaleDateString())} />
                </CardContent>
              </Card>
            </div>

            {/* Category Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Category Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <BarChart
                  data={metrics.categories.map((c) => c.count)}
                  labels={metrics.categories.map((c) => c.name)}
                />
              </CardContent>
            </Card>

            {/* Revenue Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <LineChart data={metrics.revenue.map((r) => r.amount)} labels={metrics.revenue.map((r) => r.date)} />
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="text-center">No data available</div>
        )}
      </div>
    </ProtectedRoute>
  )
}

