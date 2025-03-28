import { db } from "@/db/db"
import { passwordResetToken } from "@rahulsaamanth/mhp-schema"
import { eq } from "drizzle-orm"

export const getPasswordResetTokenByToken = async (token: string) => {
  try {
    // const passwordResetToken = await db.passwordResetToken.findUnique({
    //   where: { token },
    // })
    const _passwordResetToken = await db.query.passwordResetToken
      .findFirst({
        where: eq(passwordResetToken.token, token),
      })
      .execute()

    return _passwordResetToken
  } catch {
    return null
  }
}

export const generatePasswordResetTokenByEmail = async (email: string) => {
  try {
    // const passwrodResetToken = await db.passwordResetToken.findFirst({
    //   where: { email },
    // })
    const _passwordResetToken = await db.query.passwordResetToken
      .findFirst({
        where: eq(passwordResetToken.email, email),
      })
      .execute()

    return _passwordResetToken
  } catch {
    return null
  }
}
