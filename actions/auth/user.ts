"use server"

import { db } from "@/drizzle/db"
import { user } from "@/drizzle/schema"
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
