import crypto from "crypto"
import { db } from "@/drizzle/db"
import { v4 as uuid } from "uuid"

import { getVerificationTokenByEmail } from "@/utils/verification-token"
import { generatePasswordResetTokenByEmail } from "@/utils/password-reset-token"
import { getTwoFactorTokenByEmail } from "@/utils/two-factor-token"
import {
  passwordResetToken,
  twoFactorToken,
  verificationToken,
} from "@/drizzle/schema"
import { eq } from "drizzle-orm"

export const generateTwoFactorToken = async (email: string) => {
  const token = crypto.randomInt(100_000, 1_000_000).toString()
  const expires = new Date(new Date().getTime() + 5 * 60 * 1000)

  const existingToken = await getTwoFactorTokenByEmail(email)

  if (existingToken) {
    await db
      .delete(twoFactorToken)
      .where(eq(twoFactorToken.id, existingToken.id))
      .execute()
  }

  const [_twoFactorToken] = await db
    .insert(twoFactorToken)
    .values({
      email,
      token,
      expires,
    })
    .returning()
    .execute()

  return _twoFactorToken!
}

export const generatePasswordResetToken = async (email: string) => {
  const token = uuid()
  const expires = new Date(new Date().getTime() + 3600 * 1000)

  const existingToken = await generatePasswordResetTokenByEmail(email)

  if (existingToken) {
    await db
      .delete(passwordResetToken)
      .where(eq(passwordResetToken.id, existingToken?.id))
      .execute()
  }

  const [_passwordResetToken] = await db
    .insert(passwordResetToken)
    .values({
      email,
      token,
      expires,
    })
    .returning()
    .execute()

  return _passwordResetToken!
}

export const generateVerificationToken = async (email: string) => {
  const token = uuid()
  const expires = new Date(new Date().getTime() + 3600 * 1000)

  const existingToken = await getVerificationTokenByEmail(email)
  if (existingToken) {
    await db
      .delete(verificationToken)
      .where(eq(verificationToken.id, existingToken.id))
      .execute()
  }

  const [_verificationToken] = await db
    .insert(verificationToken)
    .values({
      email,
      token,
      expires,
    })
    .returning()
    .execute()

  return _verificationToken!
}
