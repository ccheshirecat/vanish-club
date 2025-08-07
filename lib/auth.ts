import { NextRequest } from "next/server"
import { JWTPayload } from "jose"
import { verifyJwtToken } from "./auth/jwt"
import { prisma } from "./prisma"
import { cookies } from 'next/headers'

interface CustomJWTPayload extends JWTPayload {
  userId: string
}

export async function auth(req?: NextRequest) {
  let token: string | undefined;
  
  if (req) {
    // API Route usage
    token = req.cookies.get("token")?.value;
  } else {
    // Server Component usage
    try {
      token = cookies().get("token")?.value;
    } catch (error) {
      console.error("Error accessing cookies:", error);
      return null;
    }
  }

  if (!token) {
    return null;
  }

  try {
    const payload = await verifyJwtToken(token) as CustomJWTPayload | null

    if (!payload?.userId) {
      return null
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },

        select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        isVendor: true,
        isAdmin: true,
        },
    })

    return user
  } catch (error) {
    console.error("Auth error:", error)
    return null
  }
}

export function useAuth() {
  // This is a client-side hook
  // Implement your client-side auth logic here
  // For example, you might want to use SWR or React Query to fetch the user data
  return {
    user: null, // Replace with actual user data
    loading: false,
    error: null,
  }
}

