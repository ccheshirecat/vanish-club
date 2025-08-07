import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function POST(req: NextRequest) {
  const user = await auth(req)
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { listingId, vendorId, reason, evidence } = await req.json()

    const dispute = await prisma.dispute.create({
      data: {
        listingId,
        vendorId,
        userId: user.id,
        reason,
        evidence,
        status: "OPEN",
      },
    })

    return NextResponse.json(dispute)
  } catch (error) {
    console.error("Error creating dispute:", error)
    return NextResponse.json({ error: "Failed to create dispute" }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const user = await auth(req)
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const disputes = await prisma.dispute.findMany({

      where: {
        OR: [
          { userId: user.id },
          { vendorId: user.id },
          { status: "OPEN", AND: { user: { isAdmin: true } } }
        ],
      }, 
      include: {
        user: {
          select: {
            username: true,
            displayName: true,
          },
        },
        vendor: {
          select: {
            username: true,
            displayName: true,
          },
        },
        listing: {
          select: {
            title: true,
          },
        },
      },
    })

    return NextResponse.json(disputes)
  } catch (error) {
    console.error("Error fetching disputes:", error)
    return NextResponse.json({ error: "Failed to fetch disputes" }, { status: 500 })
  }
}

