import "server-only"

import { product } from "@/drizzle/schema"
import { and, asc, count, desc, gte, ilike, lte } from "drizzle-orm"

import { type GetProductsSchema } from "./validations"
import { unstable_cache } from "@/lib/unstable-cache"
import { db } from "@/drizzle/db"
import { filterColumns } from "@/lib/filter-columns"

export async function getProducts(input: GetProductsSchema) {
  return unstable_cache(
    async () => {
      try {
        const offset = (input.page - 1) * input.perPage
        const fromDate = input.from ? new Date(input.from) : undefined
        const toDate = input.to ? new Date(input.to) : undefined
        const advancedTable = input.flags.includes("advancedTable")

        const advancedWhere = filterColumns({
          table: product,
          filters: input.filters,
          joinOperator: input.joinOperator,
        })
        const where = advancedTable
          ? advancedWhere
          : and(
              input.name ? ilike(product.name, `%${product.name}%`) : undefined,
              fromDate
                ? gte(product.createdAt, fromDate.toISOString())
                : undefined,
              toDate ? lte(product.createdAt, toDate.toISOString()) : undefined
            )

        const orderBy =
          input.sort.length > 0
            ? input.sort.map((item) =>
                item.desc ? desc(product[item.id]) : asc(product[item.id])
              )
            : [asc(product.createdAt)]

        const { data, total } = await db.transaction(async (tx) => {
          const data = await tx
            .select()
            .from(product)
            .limit(input.perPage)
            .offset(offset)
            .where(where)
            .orderBy(...orderBy)

          const total = await tx
            .select({ count: count() })
            .from(product)
            .where(where)
            .execute()
            .then((res) => res[0]?.count ?? 0)

          return { data, total }
        })
        const pageCount = Math.ceil(total / input.perPage)

        return { data: data, pageCount: pageCount }
      } catch (error) {
        console.log(error)
        return { data: [], pageCount: 0 }
      }
    },
    [JSON.stringify(input)],
    {
      revalidate: 3600,
      tags: ["products"],
    }
  )()
}
