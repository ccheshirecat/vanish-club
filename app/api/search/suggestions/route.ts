import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const term = searchParams.get("term")

  if (!term) {
    return NextResponse.json([])
  }

  try {
    const suggestions = await prisma.listing.findMany({
      where: {
        OR: [
          { title: { contains: term, mode: "insensitive" } },
          { description: { contains: term, mode: "insensitive" } },
        ],
      },
      select: { title: true },
      take: 5,
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(suggestions.map((s) => s.title))
  } catch (error) {
    console.error("Error fetching suggestions:", error)
    return NextResponse.json({ error: "Failed to fetch suggestions" }, { status: 500 })
  }
}

