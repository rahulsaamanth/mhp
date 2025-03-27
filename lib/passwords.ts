export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)

  const cryptoProvider =
    typeof window === "undefined"
      ? (await import("node:crypto")).webcrypto
      : window.crypto

  const hash = await cryptoProvider.subtle.digest("SHA-256", data)
  return Buffer.from(hash).toString("base64")
}

export async function comparePasswords(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  const hash = await hashPassword(password)
  return hash === hashedPassword
}
