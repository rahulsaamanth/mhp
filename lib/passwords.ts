import { webcrypto } from "crypto"

const getSubtleCrypto = () => {
  return typeof window === "undefined" ? webcrypto.subtle : crypto.subtle
}

async function pbkdf2(
  password: string,
  salt: Uint8Array
): Promise<ArrayBuffer> {
  const encoder = new TextEncoder()
  const passwordBuffer = encoder.encode(password)

  const key = await getSubtleCrypto().importKey(
    "raw",
    passwordBuffer,
    "PBKDF2",
    false,
    ["deriveBits"]
  )

  return getSubtleCrypto().deriveBits(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 600000, // High iteration count for security
      hash: "SHA-256",
    },
    key,
    256 // 256-bit key
  )
}

export async function hashPassword(password: string): Promise<string> {
  // Generate a random salt
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const derivedKey = await pbkdf2(password, salt)

  // Combine salt and derived key
  const combined = new Uint8Array(salt.length + derivedKey.byteLength)
  combined.set(salt)
  combined.set(new Uint8Array(derivedKey), salt.length)

  // Return as base64 string
  return Buffer.from(combined).toString("base64")
}

export async function comparePasswords(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  try {
    // Decode the stored hash
    const combined = Buffer.from(hashedPassword, "base64")

    // Extract salt and hash
    const salt = combined.slice(0, 16)
    const storedHash = combined.slice(16)

    // Hash the input password with the same salt
    const derivedKey = await pbkdf2(password, new Uint8Array(salt))

    // Compare in constant time
    return Buffer.from(derivedKey).equals(storedHash)
  } catch {
    return false
  }
}
