import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { SignJWT } from "jose"
import { getJwtSecretKey } from "@/lib/auth/jwt"
import bcrypt from "bcryptjs"
import { cookies } from "next/headers"

type UserWithPassword = {
	id: string
	email: string
	username: string
	displayName: string
	isVendor: boolean
	isAdmin: boolean
	password: string | null
}

export async function POST(req: NextRequest) {
	try {
		const { email, password } = await req.json()

		const user = await prisma.user.findUnique({
			where: { email }
		}) as UserWithPassword | null

		if (!user?.password) {
			return NextResponse.json(
				{ error: "Invalid credentials" },
				{ status: 401 }
			)
		}

		const isValidPassword = await bcrypt.compare(password, user.password)
		if (!isValidPassword) {
			return NextResponse.json(
				{ error: "Invalid credentials" },
				{ status: 401 }
			)
		}

		// Only return safe user data
		const userResponse = {
			id: user.id,
			email: user.email,
			username: user.username,
			displayName: user.displayName,
			isVendor: user.isVendor,
			isAdmin: user.isAdmin
		}

		const secretKey = await getJwtSecretKey()
		const token = await new SignJWT({ userId: user.id })
			.setProtectedHeader({ alg: "HS256" })
			.setExpirationTime("24h")
			.sign(secretKey)

		cookies().set('token', token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			expires: new Date(Date.now() + 24 * 60 * 60 * 1000)
		})

		return NextResponse.json({ user: userResponse })
	} catch (error) {
		console.error("Login error:", error)
		return NextResponse.json(
			{ error: "Authentication failed" },
			{ status: 500 }
		)
	}
}


