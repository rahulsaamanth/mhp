import { db } from "@/db/db"
import { twoFactorToken } from "@rahulsaamanth/mhp-schema"
import { eq } from "drizzle-orm"

export const getTwoFactorTokenByToken = async (token: string) => {
  try {
    // `const twoFactorToken = await db.twoFactorToken.findUnique({
    //   where: { token },
    // })`
    const _twoFactorToken = await db.query.twoFactorToken
      .findFirst({
        where: eq(twoFactorToken.token, token),
      })
      .execute()

    return _twoFactorToken
  } catch {
    return null
  }
}

export const getTwoFactorTokenByEmail = async (email: string) => {
  try {
    // const twoFactorToken = await db.twoFactorToken.findFirst({
    //   where: { email },
    // })
    const _twoFactorToken = await db.query.twoFactorToken
      .findFirst({
        where: eq(twoFactorToken.email, email),
      })
      .execute()

    return _twoFactorToken
  } catch {
    return null
  }
}
