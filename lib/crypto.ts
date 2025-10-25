import crypto from "crypto"

const DEFAULT_SECRET = process.env.COOKIE_SECRET || process.env.NEXT_PUBLIC_COOKIE_SECRET || "dev-insecure-secret-change-me"

function getKey(): Buffer {
  // Derive a 32-byte key from the secret using PBKDF2
  return crypto.pbkdf2Sync(DEFAULT_SECRET, "copyparty-cookie-salt", 100000, 32, "sha256")
}

export function encrypt(value: string): string {
  const key = getKey()
  const iv = crypto.randomBytes(12) // AES-GCM standard IV length
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv)
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()])
  const tag = cipher.getAuthTag()
  const payload = Buffer.concat([iv, tag, encrypted])
  return payload.toString("base64")
}

export function decrypt(payloadB64: string): string | null {
  try {
    const key = getKey()
    const payload = Buffer.from(payloadB64, "base64")
    const iv = payload.subarray(0, 12)
    const tag = payload.subarray(12, 28)
    const data = payload.subarray(28)
    const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv)
    decipher.setAuthTag(tag)
    const decrypted = Buffer.concat([decipher.update(data), decipher.final()])
    return decrypted.toString("utf8")
  } catch {
    return null
  }
}

export function generateCookieExpiration(hours: number): Date {
  const d = new Date()
  d.setHours(d.getHours() + hours)
  return d
}