"use server"

import { db } from "@/db/db"
import { category, manufacturer } from "@/db/schema"
import { getErrorMessage } from "@/lib/handle-error"

import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export async function addCategory(name: string) {
  try {
    const [_category] = await db
      .insert(category)
      .values({
        name,
      })
      .returning()
    revalidatePath("/sku-options")
    return {
      success: true,
      category: _category,
    }
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error),
    }
  }
}

export async function addSubCategory({
  id,
  name,
}: {
  id: string
  name: string
}) {
  try {
    const [_category] = await db
      .insert(category)
      .values({
        name,
        parentId: id,
      })
      .returning()
    revalidatePath("/sku-options")
    return {
      success: true,
      category: _category,
    }
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error),
    }
  }
}

export async function deleteCategory(id: string) {
  try {
    const [_category] = await db
      .delete(category)
      .where(eq(category.id, id))
      .returning()

    revalidatePath("/sku-options")
    return {
      success: true,
      category: _category,
    }
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error),
    }
  }
}

export async function addManufacturer(name: string) {
  try {
    const [_manufacturer] = await db
      .insert(manufacturer)
      .values({
        name,
      })
      .returning()
    revalidatePath("/sku-options")
    return {
      success: true,
      manufacturer: _manufacturer,
    }
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error),
    }
  }
}
