import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { Prisma } from "@prisma/client"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const category = searchParams.get("category")
  const page = Number.parseInt(searchParams.get("page") || "1")
  const limit = Number.parseInt(searchParams.get("limit") || "20")
  const search = searchParams.get("search")

  const where: Prisma.ListingWhereInput = {
    ...(category && { category }),
    ...(search && {
      OR: [
        {
          title: {
            contains: search,
            mode: Prisma.QueryMode.insensitive
          }
        },
        {
          description: {
            contains: search,
            mode: Prisma.QueryMode.insensitive
          }
        }
      ]
    })
  }

  const listings = await prisma.listing.findMany({
    where,
    include: {
      user: {
        select: {
          username: true,
          displayName: true,
          avatar: true,
        },
      },
    },
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { createdAt: "desc" },
  })

  const total = await prisma.listing.count({ where })

  return NextResponse.json({
    listings,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  })
}

export async function POST(req: NextRequest) {
  const user = await auth(req)
  if (!user?.isVendor) {
    return NextResponse.json({ error: "Unauthorized - Vendor access required" }, { status: 401 })
  }

  try {
    const data = await req.json()
    const listing = await prisma.listing.create({
      data: {
        ...data,
        userId: user.id,
      },
    })

    return NextResponse.json(listing)
  } catch (error) {
    console.error("Error creating listing:", error)
    return NextResponse.json({ error: "Failed to create listing" }, { status: 500 })
  }
}

