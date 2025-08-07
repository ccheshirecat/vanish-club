import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createHash, createHmac } from "crypto"
import { SignJWT } from "jose"
import { getJwtSecretKey } from "@/lib/auth/jwt"

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!

function checkTelegramAuthorization(data: Record<string, string>) {
  const { hash, ...checkData } = data
  const dataCheckString = Object.keys(checkData)
    .sort()
    .map(key => `${key}=${checkData[key]}`)
    .join('\n')
  
  const secretKey = createHash('sha256')
    .update(TELEGRAM_BOT_TOKEN)
    .digest()
  
  const hmac = createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex')
  
  return hmac === hash
}

function validateInitData(initData: string): boolean {
  try {
    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get('hash');
    urlParams.delete('hash');
    
    const dataCheckString = Array.from(urlParams.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    const secretKey = createHash('sha256')
      .update(TELEGRAM_BOT_TOKEN)
      .digest();
    
    const hmac = createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    return hmac === hash;
  } catch (error) {
    console.error('Error validating init data:', error);
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    
    // Check if this is mini app data (has initData) or regular login widget data
    const isMinApp = typeof data.hash === 'string' && data.hash.includes('user=');
    
    if (isMinApp) {
      if (!validateInitData(data.hash)) {
        return NextResponse.json({ error: "Invalid mini app authorization" }, { status: 401 })
      }
    } else {
      if (!checkTelegramAuthorization(data)) {
        return NextResponse.json({ error: "Invalid authorization" }, { status: 401 })
      }
    }

    // Find or create user
    const user = await prisma.user.upsert({
      where: { telegramId: data.id.toString() },
      update: {
        username: data.username || `user_${data.id}`,
        displayName: `${data.first_name} ${data.last_name || ''}`.trim(),
        avatar: data.photo_url,
      },
      create: {
        telegramId: data.id.toString(),
        username: data.username || `user_${data.id}`,
        displayName: `${data.first_name} ${data.last_name || ''}`.trim(),
        avatar: data.photo_url,
        email: `${data.id}@telegram.user`,
      },
    })

    const secretKey = await getJwtSecretKey()
    const token = await new SignJWT({ userId: user.id })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("24h")
      .sign(secretKey)

    return NextResponse.json({ token, user })
  } catch (error) {
    console.error("Telegram auth error:", error)
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 })
  }
}

