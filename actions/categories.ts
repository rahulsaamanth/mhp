"use server"

import { db } from "@/db/db"

export async function getCategories() {
  return await db.query.category.findMany()
}
export async function getManufacturers() {
  return await db.query.manufacturer.findMany()
}
