import { generateKeyPairSync, publicEncrypt, privateDecrypt, createCipheriv, createDecipheriv, randomBytes } from "crypto"

// Generate RSA key pair for asymmetric encryption
export function generateKeyPair() {
  const { publicKey, privateKey } = generateKeyPairSync("rsa", {
    modulusLength: 4096,
    publicKeyEncoding: {
      type: "spki",
      format: "pem",
    },
    privateKeyEncoding: {
      type: "pkcs8",
      format: "pem",
      cipher: "aes-256-cbc",
      passphrase: process.env.ENCRYPTION_SECRET || "default-secret"
    },
  })
  return { publicKey, privateKey }
}

// Generate AES key for symmetric encryption
export function generateAESKey(): { key: Buffer; iv: Buffer } {
  const key = randomBytes(32)
  const iv = randomBytes(16)
  return { key, iv }
}

// Encrypt message with AES
export function encryptAES(text: string, key: Buffer, iv: Buffer): string {
  const cipher = createCipheriv("aes-256-gcm", key, iv)
  let encrypted = cipher.update(text, "utf8", "base64")
  encrypted += cipher.final("base64")
  const authTag = cipher.getAuthTag()
  return JSON.stringify({
    content: encrypted,
    iv: iv.toString("base64"),
    authTag: authTag.toString("base64")
  })
}

// Decrypt message with AES
export function decryptAES(encryptedData: string, key: Buffer): string {
  const { content, iv, authTag } = JSON.parse(encryptedData)
  const decipher = createDecipheriv("aes-256-gcm", key, Buffer.from(iv, "base64"))
  decipher.setAuthTag(Buffer.from(authTag, "base64"))
  let decrypted = decipher.update(content, "base64", "utf8")
  decrypted += decipher.final("utf8")
  return decrypted
}

// Encrypt AES key with RSA public key
export function encryptKey(aesKey: Buffer, publicKey: string): string {
  const encrypted = publicEncrypt(publicKey, aesKey)
  return encrypted.toString("base64")
}

// Decrypt AES key with RSA private key
export function decryptKey(encryptedKey: string, privateKey: string): Buffer {
  const decrypted = privateDecrypt(
    {
      key: privateKey,
      passphrase: process.env.ENCRYPTION_SECRET || "default-secret"
    },
    Buffer.from(encryptedKey, "base64")
  )
  return decrypted
}

// Create self-destructing message
export function createSelfDestructingMessage(content: string, ttlMinutes: number = 60): {
  content: string;
  expiresAt: Date;
} {
  const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000)
  return {
    content,
    expiresAt
  }
}

