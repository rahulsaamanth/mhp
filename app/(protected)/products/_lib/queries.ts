import "server-only"

import { product } from "@/db/schema"
import { and, asc, count, desc, gte, ilike, lte, sql } from "drizzle-orm"

import { type GetProductsSchema } from "./validations"
import { unstable_cache } from "@/lib/unstable-cache"
import { db } from "@/db/db"
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
              input.name ? ilike(product.name, `%${input.name}%`) : undefined,
              fromDate ? gte(product.createdAt, fromDate) : undefined,
              toDate ? lte(product.createdAt, toDate) : undefined
            )

        const orderBy =
          input.sort.length > 0
            ? input.sort.map((item) =>
                item.desc ? desc(product[item.id]) : asc(product[item.id])
              )
            : [asc(product.createdAt)]

        const { data, total } = await db.transaction(async (tx) => {
          // const data = await tx
          //   .select()
          //   .from(product)
          //   .limit(input.perPage)
          //   .offset(offset)
          //   .where(where)
          //   .orderBy(...orderBy)
          const data = await tx
            .select({
              id: product.id,
              name: product.name,
              status: product.status,
              createdAt: product.createdAt,
              image: sql<string>`(
            SELECT (pv."variantImage"[1])
            FROM "ProductVariant" pv
            WHERE pv."productId" = "Product"."id"
            LIMIT 1
            )`,
              sales: sql<number>`(
            SELECT COUNT(DISTINCT od."orderId")
            FROM "OrderDetails" od
            JOIN "ProductVariant" pv ON od."productVariantId" = pv."id"
            WHERE pv."productId" = "Product"."id"
            )`,
              minPrice: sql<number>`(
            SELECT MIN(pv."price")
            FROM "ProductVariant" pv
            WHERE pv."productId" = "Product"."id"
            )`,
              maxPrice: sql<number>`(
            SELECT MAX(pv."price")
            FROM "ProductVariant" pv
            WHERE pv."productId" = "Product"."id"
            )`,
              stock: sql<number>`(
            SELECT SUM(pv."stock")
            FROM "ProductVariant" pv
            WHERE pv."productId" = "Product"."id"
            )`,
            })
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
