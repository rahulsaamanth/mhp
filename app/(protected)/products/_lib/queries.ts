import "server-only"

import { product } from "@/db/schema"
import { SQLChunk, sql } from "drizzle-orm"

import { db } from "@/db/db"
import { filterColumns } from "@/lib/filter-columns"
import { unstable_cache } from "@/lib/unstable-cache"
import { ProductForTable } from "@/types"
import { type GetProductsSchema } from "./validations"

export async function getProducts(input: GetProductsSchema) {
  return unstable_cache(
    async () => {
      try {
        const offset = (input.page - 1) * input.perPage
        const fromDate = input.from ? new Date(input.from) : undefined
        const toDate = input.to ? new Date(input.to) : undefined
        const advancedTable = input.flags.includes("advancedTable")

        const advancedWhere =
          input.filters && input.filters.length > 0
            ? filterColumns({
                table: product,
                filters: input.filters,
                joinOperator: input.joinOperator,
              })
            : []

        const whereConditions = advancedTable
          ? advancedWhere
          : [
              input.name ? sql`p."name" ILIKE ${`%${input.name}%`}` : sql`1=1`,
              fromDate
                ? sql`p."createdAt" >= ${fromDate.toISOString()}`
                : sql`1=1`,
              toDate ? sql`p."createdAt" <= ${toDate.toISOString()}` : sql`1=1`,
            ].filter(Boolean)

        const whereClause = sql`${sql.join(whereConditions as SQLChunk[], sql` AND `)}`

        const orderBy = input.sort.map((item) => {
          const direction = item.desc ? "DESC" : "ASC"
          const column = item.id as keyof ProductForTable

          switch (column) {
            case "sales":
              return sql`"sales" ${sql.raw(direction)} NULLS LAST`
            case "stock":
              return sql`"stock" ${sql.raw(direction)} NULLS LAST`
            case "minPrice":
              return sql`"minPrice" ${sql.raw(direction)} NULLS LAST`
            case "maxPrice":
              return sql`"maxPrice" ${sql.raw(direction)} NULLS LAST`
            case "name":
              return sql`"name" ${sql.raw(direction)}`
            case "createdAt":
              return sql`"createdAt" ${sql.raw(direction)}`
            default:
              return sql`"createdAt" DESC`
          }
        })

        const { data, total } = await db.transaction(async (tx) => {
          const data = await tx.execute(sql`
            WITH ProductStats AS (
              SELECT 
                p."id",
                p."name",
                p."status",
                p."createdAt",
                (
                  SELECT (pv."variantImage"[1])
                  FROM "ProductVariant" pv
                  WHERE pv."productId" = p.id
                  LIMIT 1
                ) as "image",
                (
                  SELECT COUNT(DISTINCT od."orderId")
                  FROM "OrderDetails" od
                  JOIN "ProductVariant" pv ON od."productVariantId" = pv.id
                  WHERE pv."productId" = p.id
                ) as "sales",
                (
                  SELECT MIN(pv."sellingPrice")
                  FROM "ProductVariant" pv
                  WHERE pv."productId" = p.id
                ) as "minPrice",
                (
                  SELECT MAX(pv."sellingPrice")
                  FROM "ProductVariant" pv
                  WHERE pv."productId" = p.id
                ) as "maxPrice",
                (
                SELECT COALESCE(
                SUM((stockItem->>'stock')::integer),0)
                FROM "ProductVariant" pv,
                jsonb_array_elements(pv."stockByLocation") as stockItem
                WHERE pv."productId" = p.id
                ) as "stock"
              FROM "Product" p
              WHERE ${whereClause}
            )
            SELECT *
            FROM ProductStats
            ${orderBy.length ? sql`ORDER BY ${sql.join(orderBy, sql`, `)}` : sql``}
            LIMIT ${input.perPage}
            OFFSET ${offset}
          `)

          const total = await tx
            .execute(
              sql`
              SELECT COUNT(*) as count
              FROM "Product" p
              WHERE ${whereClause}
            `
            )
            .then((res) => Number(res[0]?.count) ?? 0)

          return {
            data: data as unknown as ProductForTable[],
            total,
          }
        })

        const pageCount = Math.ceil(total / input.perPage)

        return {
          data,
          pageCount,
        }
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
