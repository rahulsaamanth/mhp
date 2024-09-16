"use server"

import { db } from "@/drizzle/db"
import { Order, order, User, user } from "@/drizzle/schema"
import { eq, InferSelectModel } from "drizzle-orm"

export type UsersWithOrders = User & {
  orders: Order[]
}

export const getUsers = async () => {
  try {
    const _users = await db
      .select()
      .from(user)
      .where(eq(user.role, "USER"))
      .leftJoin(order, eq(user.id, order.userId))

    const usersWithOrders: UsersWithOrders[] = _users.reduce(
      (acc: (User & { orders: Order[] })[], { User, Order }) => {
        const existingUser = acc.find((u) => u.id === User.id)
        if (existingUser) {
          if (Order) {
            existingUser.orders.push(Order)
          }
        } else {
          acc.push({
            ...User,
            orders: Order ? [Order] : [],
          })
        }
        return acc
      },
      []
    )
    console.log(usersWithOrders)

    return usersWithOrders
  } catch (error) {
    throw new Error(`Failed to get users: ${(error as Error).message}`)
  }
}
