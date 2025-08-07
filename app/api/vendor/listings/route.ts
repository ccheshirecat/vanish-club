import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function POST(req: NextRequest) {
  try {
    const user = await auth(req)
    if (!user || !user.isVendor) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { title, description, minPrice, maxPrice, contactPrice, category } = await req.json()

    const listing = await prisma.listing.create({
      data: {
      title,
      description,
      minPrice: minPrice ? parseFloat(minPrice) : null,
      maxPrice: maxPrice ? parseFloat(maxPrice) : null,
      contactPrice: contactPrice || false,
      category,
      userId: user.id,
      },
    })

    return NextResponse.json(listing)
  } catch (error) {
    console.error("Error creating listing:", error)
    return NextResponse.json({ error: "Failed to create listing" }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await auth(req)
    if (!user || !user.isVendor) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const listings = await prisma.listing.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(listings)
  } catch (error) {
    console.error("Error fetching listings:", error)
    return NextResponse.json({ error: "Failed to fetch listings" }, { status: 500 })
  }
}

