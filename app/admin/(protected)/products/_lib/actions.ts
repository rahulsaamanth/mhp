"use server"

import { getSignedURL } from "@/actions/settings"
import { db } from "@/db/db"
import {
  Category,
  Manufacturer,
  Product,
  Variant,
  category,
  manufacturer,
  product,
  productVariant,
} from "@/db/schema"
import { getErrorMessage } from "@/lib/handle-error"
import { generateSKU, generateVariantName } from "@/lib/utils"
import { createProductSchema } from "@/schemas"
import { pause } from "@/utils/pause"

import { InferSelectModel, eq, inArray, sql } from "drizzle-orm"
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
          form: data.form,
          unit: data.unit,
          status: data.status,
          tags: data.tags,
          hsnCode: data.hsnCode,
          tax: data.tax,
        })
        .where(eq(product.id, productId))
        .returning()

      await tx
        .delete(productVariant)
        .where(eq(productVariant.productId, productId))

      const variantsToInsert = data.variants.map((variant) => ({
        ...variant,
        productId,
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

      const newVariants = await tx
        .insert(productVariant)
        .values(variantsToInsert)
        .returning()

      return {
        ...updatedProduct,
        variants: newVariants,
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

export const computeSHA256 = async (file: File) => {
  const buffer = await file.arrayBuffer()
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
  return hashHex
}

export const uploadProductImage = async ({
  file,
  fileName,
}: {
  file: File
  fileName: string
}): Promise<string> => {
  try {
    const signedURLResult = await getSignedURL({
      fileSize: file.size,
      fileType: file.type,
      checksum: await computeSHA256(file),
      fileName: fileName,
    })
    if (signedURLResult.error !== undefined)
      throw new Error(signedURLResult.error)
    const url = signedURLResult.success.url
    await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": file.type,
      },
      body: file,
    })
    const fileUrl = url.split("?")[0]
    return fileUrl as string
  } catch (error) {
    console.error("Error uploading image:", error)
    throw new Error("Failed to upload image")
  }
}
