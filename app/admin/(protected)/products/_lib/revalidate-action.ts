"use server"

import { revalidateTag } from "next/cache"
import { unstable_noStore } from "next/cache"

/**
 * Manually revalidates product cache
 */
export async function revalidateProducts() {
  unstable_noStore()
  try {
    // Revalidate all product-related cache tags
    revalidateTag("products")
    revalidateTag("category-product-counts")
    revalidateTag("manufacturer-product-counts")
    revalidateTag("status-product-counts")

    // Also revalidate related entity tags that may contain product data
    revalidateTag("categories")
    revalidateTag("manufacturers")
    revalidateTag("tags")

    return {
      success: true,
      message: "Products cache successfully revalidated",
    }
  } catch (error) {
    console.error("Error revalidating products:", error)
    return {
      success: false,
      message: "Failed to revalidate products cache",
    }
  }
}
