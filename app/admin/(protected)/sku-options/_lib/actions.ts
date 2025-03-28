"use server"

import { db } from "@/db/db"
import { category, manufacturer, tag } from "@rahulsaamanth/mhp-schema"
import { getErrorMessage } from "@/lib/handle-error"

import { eq } from "drizzle-orm"
import { revalidatePath, revalidateTag, unstable_noStore } from "next/cache"

export async function addCategory(name: string) {
  unstable_noStore()
  try {
    const [_category] = await db
      .insert(category)
      .values({
        name,
      })
      .returning()
    // revalidatePath("/sku-options")
    revalidateTag("categories")
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
  unstable_noStore()
  try {
    const [_category] = await db
      .insert(category)
      .values({
        name,
        parentId: id,
      })
      .returning()
    // revalidatePath("/sku-options")
    revalidateTag("categories")
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
  unstable_noStore()
  try {
    const [_category] = await db
      .delete(category)
      .where(eq(category.id, id))
      .returning()

    // revalidatePath("/sku-options")
    revalidateTag("categories")
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
  unstable_noStore()
  try {
    const [_manufacturer] = await db
      .insert(manufacturer)
      .values({
        name,
      })
      .returning()
    // revalidatePath("/sku-options")
    revalidateTag("manufacturers")
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

export async function deleteManufacturer(id: string) {
  unstable_noStore()
  try {
    const [_manufacturer] = await db
      .delete(manufacturer)
      .where(eq(manufacturer.id, id))
      .returning()
    // revalidatePath("/sku-options")
    revalidateTag("manufacturers")
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

export async function addTag(name: string) {
  unstable_noStore()
  try {
    const [_tag] = await db
      .insert(tag)
      .values({
        name: name.toUpperCase().trim(),
      })
      .returning()

    // revalidatePath("/sku-options")
    revalidateTag("tags")

    return {
      success: true,
      tag: _tag,
    }
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error),
    }
  }
}

export async function deleteTag(id: string) {
  unstable_noStore()
  try {
    const [_tag] = await db.delete(tag).where(eq(tag.id, id)).returning()

    revalidateTag("tags")
    return {
      success: true,
      tag: _tag,
    }
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error),
    }
  }
}
