"use server"

import db from "@/lib/db"

import { User, UserRole } from "@prisma/client"
import { sql } from "kysely"

export const getUsers = async (): Promise<User[]> => {
  try {
    return await db.user.findMany({
      where: {
        role: UserRole.USER,
      },
      include: {
        orders: true,
      },
      orderBy: {
        id: "asc",
      },
    })
  } catch (error) {
    throw new Error(`Failed to get users: ${(error as Error).message}`)
  }
}

// export const getUsers = async (): Promise<User[]> => {
//   try {
//     const users = await db
//       .selectFrom("User")
//       .where("role", "=", UserRole.USER)
//       .selectAll()
//       .execute()
//     const usersWithOrders = await Promise.all(
//       users.map(async (user) => {
//         const orders = await db
//           .selectFrom("Order")
//           .where("userId", "=", user.id)
//           .selectAll()
//           .execute()
//         return {
//           ...user,
//           orders,
//         }
//       }),
//     )
//     return usersWithOrders
//   } catch (error) {
//     throw new Error(`Failed to get users: ${(error as Error).message}`)
//   }
// }
