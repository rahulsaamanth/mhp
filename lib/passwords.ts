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
      iterations: 600000,
      hash: "SHA-256",
    },
    key,
    256
  )
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const derivedKey = await pbkdf2(password, salt)

  const combined = new Uint8Array(salt.length + derivedKey.byteLength)
  combined.set(salt)
  combined.set(new Uint8Array(derivedKey), salt.length)

  return Buffer.from(combined).toString("base64")
}

export async function comparePasswords(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  try {
    const combined = Buffer.from(hashedPassword, "base64")

    const saltBytes = combined.slice(0, 16)
    const storedHashBytes = combined.slice(16)

    const salt = Uint8Array.from(saltBytes)

    const derivedKey = await pbkdf2(password, salt)

    const derivedKeyArray = new Uint8Array(derivedKey)

    const storedHashArray = Uint8Array.from(storedHashBytes)

    if (derivedKeyArray.length !== storedHashArray.length) {
      return false
    }

    let result = 0
    for (let i = 0; i < derivedKeyArray.length; i++) {
      result |= (derivedKeyArray[i] ?? 0) ^ (storedHashArray[i] ?? 0)
    }

    return result === 0
  } catch {
    return false
  }
}
