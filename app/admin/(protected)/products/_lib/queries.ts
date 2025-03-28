import "server-only"

import {
  Category,
  Manufacturer,
  category,
  manufacturer,
  product,
} from "@rahulsaamanth/mhp-schema"
import { SQLChunk, count, eq, gt, sql } from "drizzle-orm"

import { db } from "@/db/db"
import { filterColumns } from "@/lib/filter-columns"
import { unstable_cache } from "@/lib/unstable-cache"
import { ProductForTable } from "@/types"
import { type GetProductsSchema } from "./validations"
import { NeonHttpQueryResult } from "drizzle-orm/neon-http"

interface CountResult {
  count: string | number
}

export async function getProducts(input: GetProductsSchema) {
  return unstable_cache(
    async () => {
      try {
        const offset = (input.page - 1) * input.perPage
        const fromDate = input.from ? new Date(input.from) : undefined
        const toDate = input.to ? new Date(input.to) : undefined
        const advancedTable = input.flags.includes("advancedTable")

        const advancedWhere: SQLChunk[] =
          advancedTable && input.filters && input.filters.length > 0
            ? (filterColumns({
                table: product,
                filters: input.filters,
                joinOperator: input.joinOperator,
              }) as unknown as SQLChunk[]) || []
            : []

        const whereConditions: SQLChunk[] = advancedTable
          ? advancedWhere
          : [
              input.name ? sql`p."name" ILIKE ${`%${input.name}%`}` : sql`1=1`,
              input.categoryName && input.categoryName.length > 0
                ? Array.isArray(input.categoryName)
                  ? sql`c."name" IN ${input.categoryName}`
                  : sql`c."name" ILIKE ${`%${input.categoryName}%`}`
                : sql`1=1`,
              input.manufacturerName && input.manufacturerName.length > 0
                ? Array.isArray(input.manufacturerName)
                  ? sql`m."name" IN ${input.manufacturerName}`
                  : sql`m."name" ILIKE ${`%${input.manufacturerName}%`}`
                : sql`1=1`,
              input.status && input.status.length > 0
                ? Array.isArray(input.status)
                  ? sql`p."status" IN ${input.status}`
                  : sql`p."status" ILIKE ${`%${input.status}%`}`
                : sql`1=1`,

              fromDate
                ? sql`p."createdAt" >= ${fromDate.toISOString()}`
                : sql`1=1`,
              toDate ? sql`p."createdAt" <= ${toDate.toISOString()}` : sql`1=1`,
            ].filter(Boolean)

        const whereClause =
          whereConditions.length > 0
            ? sql`${sql.join(whereConditions as SQLChunk[], sql` AND `)}`
            : sql`1=1`

        const orderByChunks = input.sort.map((item) => {
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
            case "categoryName":
              return sql`COALESCE("categoryName", '') ${sql.raw(direction)} NULLS LAST`
            case "manufacturerName":
              return sql`COALESCE("manufacturerName", '') ${sql.raw(direction)} NULLS LAST`
            default:
              return sql`"createdAt" DESC`
          }
        })

        const orderByClause =
          orderByChunks.length > 0
            ? sql`ORDER BY ${sql.join(orderByChunks, sql`, `)}`
            : sql`ORDER BY "createdAt" DESC`

        const { data, total } = await db.transaction(async (tx) => {
          const data = (await tx.execute(sql`
            WITH 
            ProductStats AS (
              SELECT 
                p."id",
                p."name",
                p."status",
                p."createdAt",
                c."name" as "categoryName",
                m."name" as "manufacturerName",
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
              LEFT JOIN "Category" c ON p."categoryId" = c."id"
              LEFT JOIN "Manufacturer" m ON p."manufacturerId" = m."id"
              WHERE ${whereClause}
            )
            SELECT *
            FROM ProductStats
            ${orderByClause}            
            LIMIT ${input.perPage}
            OFFSET ${offset}
          `)) as unknown as NeonHttpQueryResult<ProductForTable>

          const totalResult = (await tx.execute(
            sql`
              SELECT COUNT(*) as count
              FROM "Product" p
              LEFT JOIN "Category" c ON p."categoryId" = c."id"
              LEFT JOIN "Manufacturer" m ON p."manufacturerId" = m."id"
              WHERE ${whereClause}
            `
          )) as unknown as NeonHttpQueryResult<CountResult>

          const total = Number(totalResult.rows[0]?.count) ?? 0

          return {
            data: data.rows as ProductForTable[],
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

export async function getCategoryCounts() {
  return unstable_cache(
    async () => {
      try {
        return await db
          .select({
            category: category.name,
            count: count(product.id),
          })
          .from(category)
          .leftJoin(product, eq(category.id, product.categoryId))
          .groupBy(category.name)
          .having(gt(count(product.id), 0))
          .then((res) =>
            res.reduce(
              (acc, { category, count }) => {
                acc[category] = count
                return acc
              },
              {} as Record<Category["name"], number>
            )
          )
      } catch (_err) {
        return {} as Record<Category["name"], number>
      }
    },
    ["category-product-counts"],
    {
      revalidate: 3600,
    }
  )()
}

export async function getManufacturerCounts() {
  return unstable_cache(
    async () => {
      try {
        return await db
          .select({
            manufacturer: manufacturer.name,
            count: count(manufacturer.id),
          })
          .from(manufacturer)
          .leftJoin(product, eq(manufacturer.id, product.manufacturerId))
          .groupBy(manufacturer.name)
          .having(gt(count(manufacturer.id), 0))
          .then((res) =>
            res.reduce(
              (acc, { manufacturer, count }) => {
                acc[manufacturer] = count
                return acc
              },
              {} as Record<Manufacturer["name"], number>
            )
          )
      } catch (_err) {
        return {} as Record<Manufacturer["name"], number>
      }
    },
    ["manufacturer-product-counts"],
    {
      revalidate: 3600,
    }
  )()
}

export async function getStatusCounts() {
  return unstable_cache(
    async () => {
      try {
        return await db
          .select({
            status: product.status,
            count: count(product.id),
          })
          .from(product)
          .groupBy(product.status)
          .then((res) =>
            res.reduce(
              (acc, { status, count }) => {
                acc[status] = count
                return acc
              },
              {} as Record<ProductForTable["status"], number>
            )
          )
      } catch (_err) {
        return {} as Record<ProductForTable["status"], number>
      }
    },
    ["status-product-counts"],
    {
      revalidate: 3600,
    }
  )()
}
