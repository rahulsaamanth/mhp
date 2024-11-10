"use server"

import { db } from "@/drizzle/db"
import {
  category,
  manufacturer,
  product,
  productVariant,
} from "@/drizzle/schema"
import { InferSelectModel } from "drizzle-orm"

type Product = InferSelectModel<typeof product>
type Category = InferSelectModel<typeof category>
type Manufacturer = InferSelectModel<typeof manufacturer>
type Variants = InferSelectModel<typeof productVariant>
type fullProduct = Product & {
  category: Category
  manufacturer: Manufacturer
  variants: Variants[]
}

export const getProductsWithFullDetials = async (): Promise<fullProduct[]> => {
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
