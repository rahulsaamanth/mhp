"use server"

import { db } from "@/db/db"
import { order } from "@rahulsaamanth/mhp-schema"
import { eq } from "drizzle-orm"

export async function getOrder(id: string) {
  try {
    const data = await db.query.order.findMany({
      where: eq(order.id, id),
      with: {
        orderDetails: {
          with: {
            order: true,
            product: true,
          },
        },
      },
    })

    // Return empty array if no data found (instead of potentially undefined)
    return data || []
  } catch (error) {
    console.error("Error fetching order", error)
    return { error: "Internal server error" }
  }
}
