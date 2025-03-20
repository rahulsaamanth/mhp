import { db } from "@/db/db"
import { twoFactorConfirmation } from "@rahulsaamanth/mhp_shared-schema"
import { eq } from "drizzle-orm"

export const getTwoFactorConfirmationByUserId = async (userId: string) => {
  try {
    // const twoFactorConfirmation = await db.twoFactorConfirmation.findUnique({
    //   where: { userId },
    // })
    const _twoFactorConfirmation = await db.query.twoFactorConfirmation
      .findFirst({
        where: eq(twoFactorConfirmation.userId, userId),
      })
      .execute()

    return _twoFactorConfirmation
  } catch {
    return null
  }
}
