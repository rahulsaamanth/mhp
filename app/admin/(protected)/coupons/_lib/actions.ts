"use server"

import { db, sql } from "@/db/db"
import { currentUser } from "@/lib/auth"
import { getErrorMessage } from "@/lib/handle-error"
import { addDiscountCodeSchema } from "@/schemas"
import { discountCode } from "@rahulsaamanth/mhp-schema"
import { eq } from "drizzle-orm"
import { revalidateTag, unstable_noStore } from "next/cache"
import * as z from "zod"

export type AddDiscountCodeFormValues = z.infer<typeof addDiscountCodeSchema>

export async function createDiscountCode(data: AddDiscountCodeFormValues) {
  unstable_noStore()
  try {
    const user = await currentUser()

    if (!user) {
      return {
        success: false,
        error: "Unauthorized",
      }
    }

    const [newDiscountCode] = await db
      .insert(discountCode)
      .values({
        ...data,
        usageCount: 0,
      })
      .returning()

    revalidateTag("discount-codes")

    return {
      success: true,
      discountCode: newDiscountCode,
    }
  } catch (error) {
    console.error("Error creating discount code:", error)
    return {
      success: false,
      error: getErrorMessage(error),
    }
  }
}

export async function deleteDiscountCode(id: string) {
  unstable_noStore()
  try {
    const user = await currentUser()

    if (!user) {
      return {
        success: false,
        error: "Unauthorized",
      }
    }

    // Execute query to check if discount code is in use
    const result =
      await sql`SELECT 1 FROM "Order" WHERE "discountCodeId" = ${id} LIMIT 1`

    if (result.length > 0) {
      return {
        success: false,
        error:
          "This discount code is being used by orders and cannot be deleted",
      }
    }

    const [deletedDiscountCode] = await db
      .delete(discountCode)
      .where(eq(discountCode.id, id))
      .returning()

    revalidateTag("discount-codes")

    return {
      success: true,
      discountCode: deletedDiscountCode,
    }
  } catch (error) {
    console.error("Error deleting discount code:", error)
    return {
      success: false,
      error: getErrorMessage(error),
    }
  }
}

export async function toggleDiscountCodeStatus(id: string) {
  unstable_noStore()
  try {
    const user = await currentUser()

    if (!user) {
      return {
        success: false,
        error: "Unauthorized",
      }
    }

    const currentCode = await db.query.discountCode.findFirst({
      where: eq(discountCode.id, id),
    })

    if (!currentCode) {
      return {
        success: false,
        error: "Discount code not found",
      }
    }

    const [updatedDiscountCode] = await db
      .update(discountCode)
      .set({
        isActive: !currentCode.isActive,
      })
      .where(eq(discountCode.id, id))
      .returning()

    revalidateTag("discount-codes")

    return {
      success: true,
      discountCode: updatedDiscountCode,
    }
  } catch (error) {
    console.error("Error toggling discount code status:", error)
    return {
      success: false,
      error: getErrorMessage(error),
    }
  }
}
