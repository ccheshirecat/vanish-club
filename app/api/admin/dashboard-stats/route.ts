import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET(req: NextRequest) {
  const user = await auth(req)

  if (!user || !user.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const [totalUsers, totalVendors, totalListings] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isVendor: true } }),
      prisma.listing.count()
    ])

    return NextResponse.json({
      totalUsers,
      totalVendors,
      totalListings
    })
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return NextResponse.json({ error: "Failed to fetch dashboard stats" }, { status: 500 })
  }
}
