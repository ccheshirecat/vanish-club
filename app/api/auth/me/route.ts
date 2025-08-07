export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET(req: NextRequest) {
	try {
		console.log("Checking auth...");
		const user = await auth(req);
		console.log("Auth result:", user);
		
		if (!user) {
			console.log("No user found");
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);
		}

		// User data is already safe from auth()
		console.log("Returning user data");
		return NextResponse.json({ user });
	} catch (error) {
		console.error("Auth check error:", error);
		return NextResponse.json(
			{ error: "Authentication failed" },
			{ status: 500 }
		);
	}
}
