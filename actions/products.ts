"use server"

import { db } from "@/drizzle/db"
import { product } from "@/drizzle/schema"
import { InferSelectModel } from "drizzle-orm"

type Product = InferSelectModel<typeof product>

export const getProducts = async (): Promise<Product[]> => {
  try {
    return await db.query.product
      .findMany({
        with: {
          category: true,
          manufacturer: true,
          variants: true,
        },
      })
      .execute()
  } catch (error) {
    throw new Error(`Failed to get prodcuts: ${(error as Error).message}`)
  }
}
