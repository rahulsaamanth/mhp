"use server"

// import { getSignedURL } from "@/actions/settings"
import { db } from "@/db/db"
import { currentUser } from "@/lib/auth"
import { getErrorMessage } from "@/lib/handle-error"
import { createProductSchema } from "@/schemas"
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3"
import {
  Category,
  Manufacturer,
  Product,
  Variant,
  category,
  manufacturer,
  product,
  productInventory,
  productVariant,
  store,
} from "@rahulsaamanth/mhp-schema"

import { SQL, eq, inArray, sql } from "drizzle-orm"
import { revalidateTag, unstable_noStore } from "next/cache"
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
    // TODO: delete the prodcut media from s3 bucket before deleting the product from the db
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

export type FullProduct = Product & {
  category: Category
  manufacturer: Manufacturer
  variants: Variant[]
}

// export const getProductsWithFullDetials = async (): Promise<FullProduct[]> => {
//   try {
//     return await db.query.product.findMany({
//       with: {
//         category: true,
//         manufacturer: true,
//         variants: true,
//       },
//     })
//   } catch (error) {
//     throw new Error(`Failed to get prodcuts: ${(error as Error).message}`)
//   }
// }

export async function updateProduct(
  productId: string,
  data: z.infer<typeof createProductSchema>
) {
  unstable_noStore()
  try {
    const result = await db.transaction(async (tx) => {
      const [updatedProduct] = await tx
        .update(product)
        .set({
          name: data.name,
          description: data.description,
          categoryId: data.categoryId,
          manufacturerId: data.manufacturerId,
          isFeatured: data.isFeatured,
          form: data.form,
          unit: data.unit,
          status: data.status,
          tags: data.tags,
          hsnCode: data.hsnCode,
          tax: data.tax,
        })
        .where(eq(product.id, productId))
        .returning()

      const existingVariants = await tx.query.productVariant.findMany({
        where: eq(productVariant.productId, productId),
      })

      const existingVariantMapByID = new Map(
        existingVariants.map((variant) => [variant.id, variant])
      )

      const processedVariantIds = new Set<string>()

      // Get store IDs for inventory management
      const stores = await tx.query.store.findMany()
      const storeMap = {
        MANG1: stores.find((s) => s.code === "MANGALORE-01")?.id,
        MANG2: stores.find((s) => s.code === "MANGALORE-02")?.id,
        KERALA1: stores.find((s) => s.code === "KERALA-01")?.id,
      }

      for (const variant of data.variants) {
        let existingId =
          variant.id && existingVariantMapByID.has(variant.id)
            ? variant.id
            : null

        if (existingId) {
          console.log(`Updating existing variant with ID: ${existingId}`)

          const updateData = {
            variantName: variant.variantName,
            potency: variant.potency,
            packSize: variant.packSize,
            costPrice: variant.costPrice,
            mrp: variant.mrp,
            sellingPrice: variant.sellingPrice,
            discount: variant.discount,
            discountType: variant.discountType,
            ...(variant.variantImage !== undefined && {
              variantImage: variant.variantImage,
            }),
          }

          // Update the product variant
          await tx
            .update(productVariant)
            .set(updateData)
            .where(eq(productVariant.id, existingId))

          // Update inventory for each store
          if (storeMap.MANG1) {
            await upsertInventory(
              tx,
              existingId,
              storeMap.MANG1,
              variant.stock_MANG1 || 0
            )
          }

          if (storeMap.MANG2) {
            await upsertInventory(
              tx,
              existingId,
              storeMap.MANG2,
              variant.stock_MANG2 || 0
            )
          }

          if (storeMap.KERALA1) {
            await upsertInventory(
              tx,
              existingId,
              storeMap.KERALA1,
              variant.stock_KERALA1 || 0
            )
          }

          processedVariantIds.add(existingId)
        } else {
          console.log(`Creating new variant with SKU: ${variant.sku}`)
          const {
            stock_MANG1,
            stock_MANG2,
            stock_KERALA1,
            ...variantWithoutStockProps
          } = variant

          // Create the product variant
          const [newVariant] = await tx
            .insert(productVariant)
            .values({
              ...variantWithoutStockProps,
              productId,
            })
            .returning()

          if (newVariant?.id) {
            // Create inventory entries for each store
            if (storeMap.MANG1) {
              await tx.insert(productInventory).values({
                productVariantId: newVariant.id,
                storeId: storeMap.MANG1,
                stock: stock_MANG1 || 0,
              })
            }

            if (storeMap.MANG2) {
              await tx.insert(productInventory).values({
                productVariantId: newVariant.id,
                storeId: storeMap.MANG2,
                stock: stock_MANG2 || 0,
              })
            }

            if (storeMap.KERALA1) {
              await tx.insert(productInventory).values({
                productVariantId: newVariant.id,
                storeId: storeMap.KERALA1,
                stock: stock_KERALA1 || 0,
              })
            }

            processedVariantIds.add(newVariant.id)
          }
        }
      }

      const allExistingIds = existingVariants.map((v) => v.id)

      const variantsToRemove = allExistingIds.filter(
        (id) => !processedVariantIds.has(id)
      )

      for (const variantId of variantsToRemove) {
        const hasOrders = await tx.execute(
          sql`SELECT 1 FROM "OrderDetails" WHERE "productVariantId" = ${variantId} LIMIT 1`
        )

        if (hasOrders.rowCount === 0) {
          console.log(`Deleting variant with ID: ${variantId}`)
          // Delete all inventory records for this variant
          await tx
            .delete(productInventory)
            .where(eq(productInventory.productVariantId, variantId))

          // Delete the variant
          await tx
            .delete(productVariant)
            .where(eq(productVariant.id, variantId))
        } else {
          console.log(`Marking variant as discontinued: ${variantId}`)
          try {
            // Mark as discontinued
            await tx
              .update(productVariant)
              .set({
                discontinued: true,
              })
              .where(eq(productVariant.id, variantId))

            // Update inventory to zero
            await tx
              .update(productInventory)
              .set({
                stock: 0,
              })
              .where(eq(productInventory.productVariantId, variantId))
          } catch (e) {
            console.error("Error marking variant as discontinued:", e)
          }
        }
      }

      const updatedVariants = await tx.query.productVariant.findMany({
        where: eq(productVariant.productId, productId),
        orderBy: [productVariant.createdAt],
      })

      return {
        ...updatedProduct,
        variants: updatedVariants,
      }
    })

    revalidateTag("products")
    return { success: true, product: result }
  } catch (error) {
    console.error("Error updating product:", error)
    return { success: false, error: getErrorMessage(error) }
  }
}

// Helper function to upsert inventory records
async function upsertInventory(
  tx: any,
  variantId: string,
  storeId: string,
  stock: number
) {
  // Check if inventory record exists
  const existingInventory = await tx.query.productInventory.findFirst({
    where: sql`${productInventory.productVariantId} = ${variantId} AND ${productInventory.storeId} = ${storeId}`,
  })

  if (existingInventory) {
    // Update existing inventory
    await tx
      .update(productInventory)
      .set({ stock })
      .where(
        sql`${productInventory.productVariantId} = ${variantId} AND ${productInventory.storeId} = ${storeId}`
      )
  } else {
    // Create new inventory record
    await tx.insert(productInventory).values({
      productVariantId: variantId,
      storeId,
      stock,
    })
  }
}

export async function getProduct(
  productId: string
): Promise<FullProduct | { error: string }> {
  try {
    const _product = await db.query.product.findFirst({
      where: eq(product.id, productId),
      with: {
        category: true,
        manufacturer: true,
        variants: {
          with: {
            inventory: {
              with: {
                store: true,
              },
            },
          },
        },
      },
    })

    if (!_product) {
      return { error: "Product not found" }
    }

    return _product as FullProduct
  } catch (error) {
    console.error("Error fetching product:", error)
    return { error: "Internal server error" }
  }
}

async function validateForeignKeys(data: z.infer<typeof createProductSchema>) {
  const categoryExists = await db.query.category.findFirst({
    where: eq(category.id, data.categoryId),
  })

  if (!categoryExists) {
    return {
      success: false,
      error: `Category with ID ${data.categoryId} does not exist`,
    }
  }

  const manufacturerExists = await db.query.manufacturer.findFirst({
    where: eq(manufacturer.id, data.manufacturerId),
  })

  if (!manufacturerExists) {
    return {
      success: false,
      error: `Manufacturer with ID ${data.manufacturerId} does not exist`,
    }
  }

  return { success: true }
}

export async function createProduct(data: z.infer<typeof createProductSchema>) {
  unstable_noStore()
  try {
    const validatedData = createProductSchema.parse(data)

    const validation = await validateForeignKeys(validatedData)
    if (!validation.success) return validation

    const { variants, ...productData } = validatedData

    const result = await db.transaction(async (tx) => {
      const [newProduct] = await tx
        .insert(product)
        .values({
          ...productData,
        })
        .returning()

      if (!newProduct) throw new Error("Failed to create product")

      // Get store IDs for inventory management
      const stores = await tx.query.store.findMany()
      const storeMap = {
        MANG1: stores.find((s) => s.code === "MANGALORE-01")?.id,
        MANG2: stores.find((s) => s.code === "MANGALORE-02")?.id,
        KERALA1: stores.find((s) => s.code === "KERALA-01")?.id,
      }

      const variantsToInsert = variants.map((variant) => {
        const {
          stock_MANG1,
          stock_MANG2,
          stock_KERALA1,
          ...variantWithoutStockProps
        } = variant
        return {
          ...variantWithoutStockProps,
          productId: newProduct.id,
        }
      })

      const newVariants = await tx
        .insert(productVariant)
        .values(variantsToInsert)
        .returning()

      // Create inventory records for each variant
      for (let i = 0; i < newVariants.length; i++) {
        const variant = newVariants[i]
        const originalVariant = variants[i]

        // Skip if either variant is undefined
        if (!variant || !originalVariant) continue

        // Create inventory entries for each store
        if (storeMap.MANG1) {
          await tx.insert(productInventory).values({
            productVariantId: variant.id,
            storeId: storeMap.MANG1,
            stock: originalVariant.stock_MANG1 || 0,
          })
        }

        if (storeMap.MANG2) {
          await tx.insert(productInventory).values({
            productVariantId: variant.id,
            storeId: storeMap.MANG2,
            stock: originalVariant.stock_MANG2 || 0,
          })
        }

        if (storeMap.KERALA1) {
          await tx.insert(productInventory).values({
            productVariantId: variant.id,
            storeId: storeMap.KERALA1,
            stock: originalVariant.stock_KERALA1 || 0,
          })
        }
      }

      return {
        ...newProduct,
        variants: newVariants,
      }
    })

    revalidateTag("products")

    // revalidatePath("/products")

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

const s3Client = new S3Client({
  region: process.env.AWS_BUCKET_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

const allowedFileTypes = [
  "image/jpeg",
  "image/png",
  "image/jpg",
  "image/webp",
  "image/svg+xml",
]

const MaxFileSize = 1024 * 1024 * 5 // 5MB

export async function uploadProductImage(
  base64File: string,
  fileName: string,
  fileType: string
) {
  try {
    const user = await currentUser()
    if (!user) throw new Error("Unauthorized")
    const fileBuffer = Buffer.from(base64File, "base64")

    if (fileBuffer.length > MaxFileSize) {
      throw new Error("File size too large")
    }

    if (!allowedFileTypes.includes(fileType)) {
      throw new Error("File type not allowed")
    }

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: fileName,
      Body: fileBuffer,
      ContentType: fileType,
    })

    await s3Client.send(command)
    return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_BUCKET_REGION}.amazonaws.com/${fileName}`
  } catch (error) {
    console.error("Error uploading to S3:", error)
    throw new Error("Failed to upload file")
  }
}
