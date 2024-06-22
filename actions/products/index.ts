"use server"

import db from "@/lib/db"
import { Product } from "@prisma/client"

export const getProducts = async (): Promise<Product[]> => {
  try {
    return await db.product.findMany({
      include: {
        orderDetails: true,
        category: true,
        brand: true,
      },
    })
  } catch (error) {
    throw new Error(`Failed to get users: ${(error as Error).message}`)
  }
}

// type Products = Omit<Product, "brand" | "category" | "properties">

// export const getProducts = async (): Promise<Products[]> => {
//   try {
//     const products = await db.selectFrom("Product").selectAll().execute()

//     return products
//   } catch (error) {
//     throw new Error(`Failed to get users: ${(error as Error).message}`)
//   }
// }
