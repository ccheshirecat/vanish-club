import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sign } from "jsonwebtoken"
import { z } from "zod"

const JWT_SECRET = process.env.JWT_SECRET!

const createVendorSchema = z.object({
  username: z.string().min(3).max(20),
  displayName: z.string().min(3).max(50),
  email: z.string().email(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { username, displayName, email } = createVendorSchema.parse(body)

    const existingUser = await prisma.user.findFirst({ 
      where: { 
        OR: [
          { username },
          { email }
        ]
      } 
    })
    if (existingUser) {
      return NextResponse.json({ 
        error: existingUser.username === username ? "Username already exists" : "Email already exists" 
      }, { status: 400 })
    }

    const user = await prisma.user.create({
      data: {
        username,
        displayName,
        email,
        isVendor: true,
      },
    })

    const token = sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" })

    const response = NextResponse.json({ user, token })
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Error creating debug vendor:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: "Failed to create debug vendor" }, { status: 500 })
  }
}

