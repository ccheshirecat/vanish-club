import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function POST(req: NextRequest, { params }: { params: { userId: string } }) {
  const adminUser = await auth(req)

  if (!adminUser || !adminUser.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: params.userId },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const updatedUser = await prisma.user.update({
      where: { id: params.userId },
      data: { isVendor: !user.isVendor },
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error("Error toggling vendor status:", error)
    return NextResponse.json({ error: "Failed to toggle vendor status" }, { status: 500 })
  }
}

