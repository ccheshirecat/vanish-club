import { createCipheriv, createDecipheriv, randomBytes } from "crypto"

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || ""
const ALGORITHM = "aes-256-cbc"
const IV_LENGTH = 16

export async function encrypt(text: string): Promise<string> {
  const iv = randomBytes(IV_LENGTH)
  const key = Buffer.from(ENCRYPTION_KEY, "hex")
  const cipher = createCipheriv(ALGORITHM, key, iv)
  let encrypted = cipher.update(text, "utf8", "hex")
  encrypted += cipher.final("hex")
  return `${iv.toString("hex")}:${encrypted}`
}

export async function decrypt(encrypted: string): Promise<string> {
  const [ivHex, encryptedText] = encrypted.split(":")
  const iv = Buffer.from(ivHex, "hex")
  const key = Buffer.from(ENCRYPTION_KEY, "hex")
  const decipher = createDecipheriv(ALGORITHM, key, iv)
  let decrypted = decipher.update(encryptedText, "hex", "utf8")
  decrypted += decipher.final("utf8")
  return decrypted
}


