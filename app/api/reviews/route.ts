import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function POST(req: NextRequest) {
  const user = await auth(req)

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { vendorId, listingId, rating, comment } = await req.json()

    const review = await prisma.review.create({
      data: {
        vendorId,
        listingId,
        userId: user.id,
        rating,
        comment,
      },
    })

    return NextResponse.json(review)
  } catch (error) {
    console.error("Error creating review:", error)
    return NextResponse.json({ error: "Failed to create review" }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const vendorId = searchParams.get("vendorId")
  const listingId = searchParams.get("listingId")

  if (!vendorId && !listingId) {
    return NextResponse.json({ error: "Either vendorId or listingId is required" }, { status: 400 })
  }

  try {
    const reviews = await prisma.review.findMany({
      where: {
        ...(vendorId && { vendorId }),
        ...(listingId && { listingId }),
      },
      include: {
        user: {
          select: {
            username: true,
            displayName: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(reviews)
  } catch (error) {
    console.error("Error fetching reviews:", error)
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 })
  }
}

