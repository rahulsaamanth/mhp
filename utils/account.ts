import { db } from "@/db/db"
import { eq } from "drizzle-orm"
import { account } from "@rahulsaamanth/mhp-schema"

export const getAccountByUserId = async (userId: string) => {
  try {
    // const account = await db.account.findFirst({
    //   where: { userId },
    // })
    const _account = await db.query.account
      .findFirst({
        where: eq(account.userId, userId),
      })
      .execute()

    return _account
  } catch {
    return null
  }
}
