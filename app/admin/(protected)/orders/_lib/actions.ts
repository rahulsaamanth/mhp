"use server"

import { db } from "@/db/db"
import { order } from "@rahulsaamanth/mhp-schema"
import { eq } from "drizzle-orm"

export async function getOrder(id: string) {
  try {
    const data = db.query.order.findMany({
      where: eq(order.id, id),
    })
    if (!data) return { error: "Order not found" }

    return data
  } catch (error) {
    console.error("Error fetching order", error)
    return { error: "Internal server error" }
  }
}
