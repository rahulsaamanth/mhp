"use server"

import { db } from "@/db/db"
import { category, manufacturer, product, productVariant } from "@/db/schema"
// import { productFormSchema } from "@/schemas"
import { InferSelectModel, eq, sql } from "drizzle-orm"
import { revalidatePath, revalidateTag } from "next/cache"

import * as z from "zod"

type Product = InferSelectModel<typeof product>
type Category = InferSelectModel<typeof category>
type Manufacturer = InferSelectModel<typeof manufacturer>
type Variants = InferSelectModel<typeof productVariant>
export type fullProduct = Product & {
  category: Category
  manufacturer: Manufacturer
  variants: Variants[]
}

export const getProductsWithFullDetials = async (): Promise<fullProduct[]> => {
  try {
    return await db.query.product.findMany({
      with: {
        category: true,
        manufacturer: true,
        variants: true,
      },
    })
  } catch (error) {
    throw new Error(`Failed to get prodcuts: ${(error as Error).message}`)
  }
}

// export type ProductFormValues = z.infer<typeof productFormSchema>

// export async function updateProduct(
//   productId: string,
//   data: ProductFormValues
// ) {
//   try {
//     await db.transaction(async (tx) => {
//       // Update main product
//       await tx.execute(sql`
//         UPDATE "Product"
//         SET
//         name = ${data.name},
//         description = ${data.description},
//         status = ${data.status},
//         tags = ${data.tags},
//         category_id = ${data.categoryId},
//         manufacturer_id = ${data.manufacturerId},
//         properties = ${JSON.stringify(data.properties)}
//         WHERE id = ${productId}
//     `)

//       // Update variants
//       for (const variant of data.variants) {
//         await tx.execute(sql`
//         UPDATE "ProductVariant"
//         SET
//             variant_name = ${variant.variantName},
//             variant_image = ${variant.variantImage},
//             potency = ${variant.potency},
//             pack_size = ${variant.packSize},
//             price = ${variant.price},
//             stock = ${variant.stock}
//         WHERE product_id = ${productId}
//         `)
//       }
//     })

//     return { success: true }
//   } catch (error) {
//     console.error("Error updating product:", error)
//     return { success: false, error: "Failed to update product" }
//   }
// }

export async function getProduct(
  productId: string
): Promise<fullProduct | { error: string }> {
  try {
    const _product = await db.query.product.findFirst({
      where: eq(product.id, productId),
      with: {
        category: true,
        manufacturer: true,
        variants: true,
      },
    })

    if (!_product) {
      return { error: "Product not found" }
    }

    return _product as fullProduct
  } catch (error) {
    console.error("Error fetching product:", error)
    return { error: "Internal server error" }
  }
}

const ProductSchema = z.object({
  name: z.string().min(2, "Product name must be at least 2 characters"),
  description: z.string(),
  categoryId: z.string(),
  manufacturerId: z.string(),
})

export async function createProduct(data: z.infer<typeof ProductSchema>) {
  try {
    const validatedData = ProductSchema.parse(data)

    const [newProduct] = await db
      .insert(product)
      .values({
        ...validatedData,
      })
      .returning()

    return {
      success: true,
      product: newProduct,
    }
  } catch (error) {
    console.error("Error creating product:", error)

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors.map((err) => err.message),
      }
    }

    return {
      success: false,
      error: "Failed to create product",
    }
  }
}
