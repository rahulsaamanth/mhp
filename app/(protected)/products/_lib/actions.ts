"use server"

import { db } from "@/db/db"
import {
  Category,
  Manufacturer,
  Product,
  Variants,
  category,
  manufacturer,
  product,
  productVariant,
} from "@/db/schema"
import { getErrorMessage } from "@/lib/handle-error"
import { generateSKU, generateVariantName } from "@/lib/utils"
import { createProductSchema } from "@/schemas"
import { pause } from "@/utils/pause"

import { InferSelectModel, eq, inArray } from "drizzle-orm"
import { revalidatePath, revalidateTag, unstable_noStore } from "next/cache"
import * as z from "zod"

export async function deleteProducts(input: { ids: string[] }) {
  unstable_noStore()
  try {
    await db.delete(product).where(inArray(product.id, input.ids))

    revalidateTag("products")
    return {
      data: null,
      error: null,
    }
  } catch (error) {
    return {
      data: null,
      error: getErrorMessage(error),
    }
  }
}

export async function deleteProduct(input: { id: string }) {
  unstable_noStore()
  try {
    await db.delete(product).where(eq(product.id, input.id))

    revalidateTag("products")

    return {
      data: null,
      error: null,
    }
  } catch (error) {
    return {
      data: null,
      error: getErrorMessage(error),
    }
  }
}

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
    pause(4000)
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

export async function createProduct(data: z.infer<typeof createProductSchema>) {
  unstable_noStore()
  try {
    const validatedData = createProductSchema.parse(data)
    const { variants, ...productData } = validatedData

    const result = await db.transaction(async (tx) => {
      const [newProduct] = await tx
        .insert(product)
        .values({
          ...productData,
        })
        .returning()

      if (!newProduct) throw new Error("Failed to create product")

      const variantsToInsert = variants.map((variant) => ({
        ...variant,
        productId: newProduct.id,
        sku: generateSKU({
          productName: productData.name,
          productForm: productData.form,
          packSize: variant.packSize.toString(),
          potency: variant.potency.toString(),
        }),
        variantName: generateVariantName({
          productName: productData.name,
          packSize: variant.packSize.toString(),
          potency: variant.packSize.toString(),
        }),
      }))

      const newVariants = await tx
        .insert(productVariant)
        .values(variantsToInsert)
        .returning()

      return {
        ...newProduct,
        variants: newVariants,
      }
    })

    revalidatePath("products")

    return {
      success: true,
      product: result,
    }
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error),
    }
  }
}
