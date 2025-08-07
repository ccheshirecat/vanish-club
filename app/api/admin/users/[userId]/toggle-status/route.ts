import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function POST(req: NextRequest, { params }: { params: { userId: string } }) {
  const adminUser = await auth(req)

  if (!adminUser || !adminUser.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { isVendor, isAdmin } = await req.json()

    const updatedUser = await prisma.user.update({
      where: { id: params.userId },
      data: {
        ...(isVendor !== undefined && { isVendor }),
        ...(isAdmin !== undefined && { isAdmin }),
      },
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error("Error updating user status:", error)
    return NextResponse.json({ error: "Failed to update user status" }, { status: 500 })
  }
}

