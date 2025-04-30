import "server-only"

import { db } from "@/db/db"
import { cache } from "@/lib/cache"

export async function getCategories() {
  return cache(
    async () => {
      return await db.query.category.findMany()
    },
    ["categories"],
    {
      tags: ["categories"],
      revalidate: 3600,
    }
  )()
}

export async function getManufacturers() {
  return cache(
    async () => {
      return await db.query.manufacturer.findMany()
    },
    ["manufacturers"],
    {
      tags: ["manufacturers"],
      revalidate: 3600,
    }
  )()
}

export async function getTags() {
  return cache(
    async () => {
      return await db.query.tag.findMany()
    },
    ["tags"],
    {
      tags: ["tags"],
      revalidate: 3600,
    }
  )()
}
