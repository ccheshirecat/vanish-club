import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const query = searchParams.get("q")
  const category = searchParams.get("category")
  const page = Number(searchParams.get("page")) || 1
  const limit = 10

  if (!query) {
    return NextResponse.json({ error: "Search query is required" }, { status: 400 })
  }

  const where: Prisma.ListingWhereInput = {
    ...(category && { category }),
    OR: [
      {
        title: {
          contains: query,
          mode: Prisma.QueryMode.insensitive
        }
      },
      {
        description: {
          contains: query,
          mode: Prisma.QueryMode.insensitive
        }
      }
    ]
  }

  try {
    const [results, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatar: true,
            },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.listing.count({ where }),
    ])

    return NextResponse.json({
      results,
      total,
      pages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error("Error searching listings:", error)
    return NextResponse.json({ error: "Failed to search listings" }, { status: 500 })
  }
}


