import { db } from "@/db/db"
import { user } from "@rahulsaamanth/mhp_shared-schema"
import { eq } from "drizzle-orm"

export const getUserByEmail = async (email: string) => {
  try {
    // const user = await db.user.findUnique({ where: { email } })
    const _user = await db.query.user
      .findFirst({
        where: eq(user.email, email),
      })
      .execute()

    return _user
  } catch {
    return null
  }
}

export const getUserById = async (id: string) => {
  try {
    // const user = await db.user.findUnique({ where: { id } })
    const _user = await db.query.user
      .findFirst({
        where: eq(user.id, id),
      })
      .execute()

    return _user
  } catch {
    return null
  }
}
