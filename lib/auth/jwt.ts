import { jwtVerify, SignJWT } from 'jose'

export async function getJwtSecretKey(): Promise<Uint8Array> {
	const secret = process.env.JWT_SECRET_KEY
	if (!secret || secret.length < 32) {
		console.error('JWT_SECRET_KEY is not set or is too short')
		throw new Error("Invalid JWT_SECRET_KEY configuration")
	}
	const encoder = new TextEncoder()
	return encoder.encode(secret)
}

export async function generateToken(payload: any): Promise<string> {
	try {
		const secretKey = await getJwtSecretKey()
		return await new SignJWT(payload)
			.setProtectedHeader({ alg: "HS256" })
			.setExpirationTime("24h")
			.sign(secretKey)
	} catch (error) {
		console.error('Error generating JWT:', error)
		throw new Error("Failed to generate authentication token")
	}
}

export async function verifyJwtToken(token: string) {
	try {
		const secretKey = await getJwtSecretKey()
		const { payload } = await jwtVerify(token, secretKey)
		return payload
	} catch (error) {
		console.error('Error verifying JWT:', error)
		return null
	}
}