"use server"

import { db } from "@/drizzle/db"
import { product } from "@/drizzle/schema"
import { InferSelectModel } from "drizzle-orm"

type Product = InferSelectModel<typeof product>

export const getProducts = async (): Promise<Product[]> => {
  try {
    // return await db.product.findMany({
    //   include: {
    //     orderDetails: true,
    //     category: true,
    //     brand: true,
    //   },
    // })
    return await db.query.product
      .findMany({
        with: {
          orderDetails: true,
          category: true,
          brand: true,
        },
      })
      .execute()
  } catch (error) {
    throw new Error(`Failed to get users: ${(error as Error).message}`)
  }
}
