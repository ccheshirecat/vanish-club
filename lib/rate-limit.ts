import { NextRequest, NextResponse } from "next/server"
import { Redis } from "@upstash/redis"

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
})

export async function rateLimit(
  req: NextRequest,
  limit = 10,
  window = 60, // seconds
) {
  const ip = req.ip || req.headers.get("x-forwarded-for") || "anonymous"
  const key = `rate-limit:${ip}`

  const count = await redis.incr(key)

  if (count === 1) {
    await redis.expire(key, window)
  }

  if (count > limit) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 })
  }

  return null
}

