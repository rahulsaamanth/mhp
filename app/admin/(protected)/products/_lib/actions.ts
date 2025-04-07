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
  productVariant,
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

export const getProductsWithFullDetials = async (): Promise<FullProduct[]> => {
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

export async function updateProduct(
  productId: string,
  data: z.infer<typeof createProductSchema>
) {
  unstable_noStore()
  console.log("update called")
  try {
    const result = await db.transaction(async (tx) => {
      // Update main product
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

      const existingVariantMap = new Map(
        existingVariants.map((variant) => [variant.sku, variant.id])
      )

      for (const variant of data.variants) {
        const stockByLocation = [
          {
            location: "MANGALORE-01" as const,
            stock: variant.stock_MANG1 || 0,
          },
          {
            location: "MANGALORE-02" as const,
            stock: variant.stock_MANG2 || 0,
          },
          {
            location: "KERALA-01" as const,
            stock: variant.stock_KERALA1 || 0,
          },
        ]

        if (variant.sku && existingVariantMap.has(variant.sku)) {
          const variantId = existingVariantMap.get(variant.sku)
          await tx
            .update(productVariant)
            .set({
              variantName: variant.variantName,
              potency: variant.potency,
              packSize: variant.packSize,
              costPrice: variant.costPrice,
              mrp: variant.mrp,
              sellingPrice: variant.sellingPrice,
              discount: variant.discount,
              discountType: variant.discountType,
              stockByLocation,
              variantImage: variant.variantImage,
            })
            .where(eq(productVariant.id, variantId!))

          existingVariantMap.delete(variant.sku)
        } else {
          const {
            stock_MANG1,
            stock_MANG2,
            stock_KERALA1,
            ...variantWithoutStockProps
          } = variant
          await tx.insert(productVariant).values({
            ...variantWithoutStockProps,
            productId,
            stockByLocation,
          })
        }
      }

      if (existingVariantMap.size > 0) {
        const variantIdsToDelete = Array.from(existingVariantMap.values())

        for (const variantId of variantIdsToDelete) {
          const hasOrders = await tx.execute(
            sql`SELECT 1 FROM "OrderDetails" WHERE "productVariantId" = ${variantId} LIMIT 1`
          )

          if (hasOrders.rowCount === 0)
            await tx
              .delete(productVariant)
              .where(eq(productVariant.id, variantId))
          else {
            await tx
              .update(productVariant)
              .set({
                discontinued: true,
                stockByLocation: [
                  {
                    location: "MANGALORE-01" as const,
                    stock: 0,
                  },
                  {
                    location: "MANGALORE-02" as const,
                    stock: 0,
                  },
                  {
                    location: "KERALA-01" as const,
                    stock: 0,
                  },
                ],
              })
              .where(eq(productVariant.id, variantId))
          }
        }
      }
      const updatedVariants = await tx.query.productVariant.findMany({
        where: eq(productVariant.productId, productId),
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

export async function getProduct(
  productId: string
): Promise<FullProduct | { error: string }> {
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
      console.log("Inserting Product:", productData)
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
        mrp: variant.priceAfterTax,
        stockByLocation: [
          {
            location: "MANGALORE-01" as const,
            stock: variant.stock_MANG1 || 0,
          },
          {
            location: "MANGALORE-02" as const,
            stock: variant.stock_MANG2 || 0,
          },
          {
            location: "KERALA-01" as const,
            stock: variant.stock_KERALA1 || 0,
          },
        ],
        stock_MANG1: undefined,
        stock_MANG2: undefined,
        stock_KERALA1: undefined,
      }))

      console.log("Inserting variants:", variantsToInsert)

      const newVariants = await tx
        .insert(productVariant)
        .values(variantsToInsert)
        .returning()

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
