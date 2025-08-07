import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET(req: NextRequest) {
  const user = await auth(req)

  if (!user || !user.isVendor) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const [totalListings, totalMessages] = await Promise.all([
      prisma.listing.count({
        where: { userId: user.id },
      }),
      prisma.message.count({
        where: {
          OR: [
            { senderId: user.id },
            { receiverId: user.id },
          ],
        },
      }),
    ])

    return NextResponse.json({
      totalListings,
      totalMessages,
    })
  } catch (error) {
    console.error("Error fetching vendor stats:", error)
    return NextResponse.json({ error: "Failed to fetch vendor stats" }, { status: 500 })
  }
}


