"use server"

import { db } from "@/db/db"
import { category, manufacturer, product, productVariant } from "@/db/schema"
import { productFormSchema } from "@/schemas"
import { InferSelectModel, sql } from "drizzle-orm"
import * as z from "zod"

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

export type ProductFormValues = z.infer<typeof productFormSchema>

export async function updateProduct(
  productId: string,
  data: ProductFormValues
) {
  try {
    await db.transaction(async (tx) => {
      // Update main product
      await tx.execute(sql`
        UPDATE "Product"
        SET 
        name = ${data.name},
        description = ${data.description},
        status = ${data.status},
        tags = ${data.tags},
        category_id = ${data.categoryId},
        manufacturer_id = ${data.manufacturerId},
        properties = ${JSON.stringify(data.properties)}
        WHERE id = ${productId}
    `)

      // Update variants
      for (const variant of data.variants) {
        await tx.execute(sql`
        UPDATE "ProductVariant"
        SET
            variant_name = ${variant.variantName},
            variant_image = ${variant.variantImage},
            potency = ${variant.potency},
            pack_size = ${variant.packSize},
            price = ${variant.price},
            stock = ${variant.stock}
        WHERE product_id = ${productId}
        `)
      }
    })

    return { success: true }
  } catch (error) {
    console.error("Error updating product:", error)
    return { success: false, error: "Failed to update product" }
  }
}

export async function getProduct(productId: string) {
  const result = await db.execute(sql`
    SELECT 
    p.*,
    c.name as category_name,
    m.name as manufacturer_name,
    json_agg(
        json_build_object(
        'id', pv.id,
        'variantName', pv.variant_name,
        'variantImage', pv.variant_image,
        'potency', pv.potency,
        'packSize', pv.pack_size,
        'price', pv.price,
        'stock', pv.stock
        )
    ) as variants
    FROM "Product" p
    LEFT JOIN "Category" c ON p.category_id = c.id
    LEFT JOIN "Manufacturer" m ON p.manufacturer_id = m.id
    LEFT JOIN "ProductVariant" pv ON pv.product_id = p.id
    WHERE p.id = ${productId}
    
`)
  return result[0]
}
