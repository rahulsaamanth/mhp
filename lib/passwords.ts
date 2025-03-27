import * as crypto from "crypto"

export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)

  const hash = crypto.createHash("SHA-256")
  hash.update(password)
  return hash.digest("base64")
}

export async function comparePasswords(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  const hash = await hashPassword(password)
  return hash === hashedPassword
}
