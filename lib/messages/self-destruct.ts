import { prisma } from "@/lib/prisma"
import { generateAESKey, encryptAES, encryptKey } from "@/lib/encryption/keys"

export async function createSelfDestructingMessage(
  receiverId: string,
  content: string,
  senderId: string,
  expiresIn: number, // Time in seconds
) {
  // Get recipient's public key
  const recipient = await prisma.user.findUnique({
    where: { id: receiverId },
    select: { publicKey: true }
  })

  if (!recipient?.publicKey) {
    throw new Error("Recipient has no public key")
  }

  // Generate AES key and IV for message encryption
  const { key, iv } = generateAESKey()
  
  // Encrypt message content with AES
  const encryptedContent = encryptAES(content, key, iv)
  
  // Encrypt AES key with recipient's public key
  const encryptedKey = encryptKey(key, recipient.publicKey)

  const expiresAt = new Date(Date.now() + expiresIn * 1000)

  const message = await prisma.message.create({
    data: {
      receiverId,
      senderId,
      content: encryptedContent,
      encryptedKey,
      iv: iv.toString('base64'),
      expiresAt,
    },
  })

  // Schedule deletion
  setTimeout(async () => {
    await prisma.message.delete({
      where: { id: message.id },
    })
  }, expiresIn * 1000)

  return message
}

export async function cleanupExpiredMessages() {
  await prisma.message.deleteMany({
    where: {
      expiresAt: {
        lt: new Date(),
      },
    },
  })
}

