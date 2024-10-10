"use server"

import { db } from "@/drizzle/db"
import { Order, order, User, user } from "@/drizzle/schema"
import { eq, InferSelectModel } from "drizzle-orm"

export type UsersWithOrders = User & {
  orders: Order[]
}

export const getUsers = async () => {
  try {
    const usersWithOrders = await db.query.user.findMany({
      where: eq(user.role, "USER"),
      with: {
        orders: true,
      },
    })

    return usersWithOrders
  } catch (error) {
    throw new Error(`Failed to get users: ${(error as Error).message}`)
  }
}
