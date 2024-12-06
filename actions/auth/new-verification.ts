"use server"

import { db } from "@/db/db"
import { user, verificationToken } from "@/db/schema"
import { getUserByEmail } from "@/utils/user"
import { getVerificationTokenByToken } from "@/utils/verification-token"
import { eq } from "drizzle-orm"

export const newVerification = async (token: string) => {
  const existingToken = await getVerificationTokenByToken(token)

  if (!existingToken) return { error: "Token does not exist!" }

  const hasExpired = new Date(existingToken.expires) < new Date()

  if (hasExpired) return { error: "Token has expired!" }

  const existingUser = await getUserByEmail(existingToken.email)

  if (!existingUser) return { error: "Email does not exist!" }

  // await db.user.update({
  //   where: { id: existingUser.id },
  //   data: {
  //     emailVerified: new Date(),
  //     email: existingToken.email,
  //   },
  // })
  await db
    .update(user)
    .set({
      emailVerified: new Date(),
      email: existingToken.email,
    })
    .where(eq(user.id, existingUser.id))
    .execute()

  // await db.verificationToken.delete({
  //   where: { id: existingToken.id },
  // })
  await db
    .delete(verificationToken)
    .where(eq(verificationToken.id, existingToken.id))
    .execute()

  return { success: "Email verified!" }
}
