"use server"

import { db } from "@/lib/db"
import { User, UserRole } from "@prisma/client"

export const getUsers = async (): Promise<User[]> => {
  try {
    return await db.user.findMany({
      where: {
        role: UserRole.USER,
      },
      include: {
        orders: true,
      },
    })
  } catch (error) {
    throw new Error(`Failed to get users: ${(error as Error).message}`)
  }
}
