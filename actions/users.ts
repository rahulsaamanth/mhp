"use server"

import { db } from "@/drizzle/db"
import { order, user } from "@/drizzle/schema"
import { eq, InferSelectModel } from "drizzle-orm"

type User = InferSelectModel<typeof user>
type Order = InferSelectModel<typeof order>

type UsersWithOrders = {
  User: User
  Order: Order | null
}

export const getUsers = async () => {
  try {
    const _users: UsersWithOrders[] = await db
      .select()
      .from(user)
      .where(eq(user.role, "USER"))
      .leftJoin(order, eq(user.id, order.userId))

    const usersWithOrders = _users.reduce(
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

    return usersWithOrders
  } catch (error) {
    throw new Error(`Failed to get users: ${(error as Error).message}`)
  }
}
