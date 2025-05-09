"use server"

import * as z from "zod"
import { signIn } from "@/auth"

import { LoginSchema } from "@/schemas"
import { DEFAULT_LOGIN_REDIRECT } from "@/routes"
import { AuthError } from "next-auth"
import { getUserByEmail } from "@/utils/user"
import { sendVerificationEmail, sendTwoFactorTokenEmail } from "@/lib/mail"
import { generateVerificationToken, generateTwoFactorToken } from "@/lib/tokens"
import { getTwoFactorTokenByEmail } from "@/utils/two-factor-token"
import { db } from "@/db/db"
import { getTwoFactorConfirmationByUserId } from "@/utils/two-factor-confirmation"
import {
  twoFactorConfirmation,
  twoFactorToken,
} from "@rahulsaamanth/mhp-schema"
import { eq } from "drizzle-orm"

export const login = async (
  values: z.infer<typeof LoginSchema>,
  callbackUrl?: string | null
) => {
  const validatedFields = LoginSchema.safeParse(values)

  if (!validatedFields.success) return { error: "Invalid fields!" }

  const { email, password, code } = validatedFields.data

  const existingUser = await getUserByEmail(email)

  if (!existingUser || !existingUser.email || !existingUser.password)
    return { error: "Email doesn't exist!" }

  if (!existingUser.emailVerified) {
    const verificationToken = await generateVerificationToken(
      existingUser.email
    )

    await sendVerificationEmail(
      verificationToken.identifier,
      verificationToken.token
    )
    return { success: "Confirmation email sent!" }
  }

  if (existingUser.isTwoFactorEnabled && existingUser.email) {
    if (!code) {
      const twoFactorToken = await generateTwoFactorToken(existingUser.email)

      await sendTwoFactorTokenEmail(twoFactorToken.email, twoFactorToken.token)

      return { twoFactor: true }
    }
    const _twoFactorToken = await getTwoFactorTokenByEmail(existingUser.email)

    if (!_twoFactorToken) return { error: "Invaid code" }

    if (_twoFactorToken.token !== code) return { error: "Invalid code" }

    const hasExpired = new Date(_twoFactorToken.expires) < new Date()

    if (hasExpired) return { error: "code expired!" }

    await db
      .delete(twoFactorToken)
      .where(eq(twoFactorToken.id, _twoFactorToken.id))
      .execute()

    const existingConfirmation = await getTwoFactorConfirmationByUserId(
      existingUser.id
    )

    if (existingConfirmation)
      await db
        .delete(twoFactorConfirmation)
        .where(eq(twoFactorConfirmation.id, existingConfirmation.id))
        .execute()

    await db
      .insert(twoFactorConfirmation)
      .values({
        userId: existingUser?.id,
      })
      .execute()
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: callbackUrl || DEFAULT_LOGIN_REDIRECT,
    })
    return { success: "Logged in successfully!" }
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid credentials" }
        case "AccessDenied":
          return { error: "Access Denied: Admin Route" }
        default:
          return { error: "Something went wrong!" }
      }
    }
    throw error
  }
}
