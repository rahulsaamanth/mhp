import { db } from "@/db/db"
import { verificationToken } from "@rahulsaamanth/mhp-schema"
import { eq } from "drizzle-orm"

export const getVerificationTokenByEmail = async (email: string) => {
  try {
    // const verifcationToken = await db.verificationToken.findFirst({
    //   where: { email },
    // })
    const _verificationToken = await db.query.verificationToken
      .findFirst({
        where: eq(verificationToken?.identifier, email),
      })
      .execute()

    return _verificationToken
  } catch {
    return null
  }
}

export const getVerificationTokenByToken = async (token: string) => {
  try {
    // const verifcationToken = await db.verificationToken.findUnique({
    //   where: { token },
    // })
    const _verificationToken = await db.query.verificationToken
      .findFirst({
        where: eq(verificationToken.token, token),
      })
      .execute()

    return _verificationToken
  } catch {
    return null
  }
}
