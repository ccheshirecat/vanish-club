import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function POST(req: NextRequest) {
  const user = await auth(req)

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { isVendor: true },
    })

    return NextResponse.json({ message: "User is now a vendor", user: updatedUser })
  } catch (error) {
    console.error("Error updating user to vendor:", error)
    return NextResponse.json({ error: "Failed to update user to vendor" }, { status: 500 })
  }
}

