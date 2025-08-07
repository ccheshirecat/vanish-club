import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await auth(req)

  if (!user || !user.isVendor) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const listing = await prisma.listing.findFirst({
      where: { 
        id: params.id,
        userId: user.id
      },
    })

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 })
    }

    return NextResponse.json(listing)
  } catch (error) {
    console.error("Error fetching listing:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await auth(req)

  if (!user || !user.isVendor) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const data = await req.json()
    const listing = await prisma.listing.updateMany({
      where: { 
        id: params.id,
        userId: user.id
      },
      data,
    })

    if (listing.count === 0) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Listing updated successfully" })
  } catch (error) {
    console.error("Error updating listing:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await auth(req)

  if (!user || !user.isVendor) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const result = await prisma.listing.deleteMany({
      where: { 
        id: params.id,
        userId: user.id
      },
    })

    if (result.count === 0) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Listing deleted successfully" })
  } catch (error) {
    console.error("Error deleting listing:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

