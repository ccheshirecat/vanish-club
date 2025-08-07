import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { SignJWT } from "jose"
import { getJwtSecretKey } from "@/lib/auth/jwt"
import bcrypt from "bcryptjs"
import { cookies } from "next/headers"


export async function POST(req: NextRequest) {
	try {
		const { email, password, username, displayName } = await req.json()

		if (!email || !password || !username) {
			return NextResponse.json(
				{ error: "Missing required fields" },
				{ status: 400 }
			)
		}

		// Check if user already exists
		const existingUser = await prisma.user.findFirst({
			where: {
				OR: [
					{ email },
					{ username }
				]
			}
		})

		if (existingUser) {
			return NextResponse.json(
				{ error: existingUser.email === email ? "Email already exists" : "Username already exists" },
				{ status: 400 }
			)
		}

		// Hash password
		const hashedPassword = await bcrypt.hash(password, 10)

		// Create new user
		const user = await prisma.user.create({
			data: {
				email,
				username,
				displayName: displayName || username,
				hashedPassword: hashedPassword,
			},
			select: {
				id: true,
				email: true,
				username: true,
				displayName: true,
				isVendor: true,
				isAdmin: true,
			},
		})

		// Generate JWT token
		const secretKey = await getJwtSecretKey()
		const token = await new SignJWT({ userId: user.id })

			.setProtectedHeader({ alg: "HS256" })
			.setExpirationTime("24h")
			.sign(secretKey)

		// Set cookie
		cookies().set('token', token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			expires: new Date(Date.now() + 24 * 60 * 60 * 1000)
		})

		return NextResponse.json({ user })

	} catch (error) {
		console.error("Registration error:", error)
		return NextResponse.json(
			{ error: error instanceof Error ? error.message : "Registration failed" },
			{ status: 500 }
		)
	}
}