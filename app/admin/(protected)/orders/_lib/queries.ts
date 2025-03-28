import "server-only"

import { type GetOrdersSchema } from "./validations"
import { unstable_cache } from "next/cache"
import { filterColumns } from "@/lib/filter-columns"
import { order } from "@rahulsaamanth/mhp-schema"
import { SQLChunk, sql } from "drizzle-orm"
import { db } from "@/db/db"
import { OrderForTable } from "@/types"
import { NeonHttpQueryResult } from "drizzle-orm/neon-http"

interface CountResult {
  count: number | number
}
export async function getOrders(input: GetOrdersSchema) {
  return unstable_cache(
    async () => {
      try {
        const offset = (input.page - 1) * input.perPage
        const fromDate = input.from ? new Date(input.from) : undefined
        const toDate = input.to ? new Date(input.to) : undefined

        const advancedTable = input.flags.includes("advancedTable")

        const advancedWhere: SQLChunk[] =
          input.filters && input.filters.length > 0
            ? (filterColumns({
                table: order,
                filters: input.filters,
                joinOperator: input.joinOperator,
              }) as unknown as SQLChunk[]) || []
            : []

        const whereConditions: SQLChunk[] = advancedTable
          ? advancedWhere
          : [
              input.orderId
                ? sql`o."id" ILIKE ${`%${input.orderId}`}`
                : sql`1=1`,
              input.userName
                ? sql`u."name" ILIKE ${`%${input.userName}%`}`
                : sql`1=1`,
              fromDate
                ? sql`o."orderDate" >= ${fromDate.toISOString()}`
                : sql`1=1`,
              toDate ? sql`o."orderDate" <= ${toDate.toISOString()}` : sql`1=1`,
            ].filter(Boolean)

        const whereClause =
          whereConditions.length > 0
            ? sql`${sql.join(whereConditions as SQLChunk[], sql` AND `)}`
            : sql`WHERE 1=1`

        const orderBy = input.sort.map((item) => {
          const direction = item.desc ? "DESC" : "ASC"
          const column = item.id as keyof OrderForTable

          switch (column) {
            case "totalAmountPaid":
              return sql`"totalAmountPaid" ${sql.raw(direction)} NULLS LAST`
            case "orderDate":
              return sql`"orderDate" ${sql.raw(direction)}`
            case "userName":
              return sql`"userName" ${sql.raw(direction)} NULLS LAST`
            default:
              return sql`"orderDate" DESC`
          }
        })

        const { data, total } = await db.transaction(async (tx) => {
          const data = (await tx.execute(sql`
                            WITH OrderStats AS(
                               SELECT 
                                o."id",
                                o."orderDate",
                                o."totalAmountPaid",
                                o."paymentStatus",
                                o."orderType",
                                o."userId",
                                o."invoiceNumber",
                                u."name" as "userName"
                            FROM "Order" o
                            LEFT JOIN "User" u ON u."id" = o."userId"
                            WHERE ${whereClause}                                     
                            )
                            SELECT *
                            FROM OrderStats
                            ${orderBy.length ? sql`ORDER BY ${sql.join(orderBy, sql`, `)}` : sql``}
                            LIMIT ${input.perPage}
                            OFFSET ${offset}
                            `)) as unknown as NeonHttpQueryResult<OrderForTable>

          const totalResult = (await tx.execute(
            sql`
                                SELECT COUNT(*) as count
                                FROM "Order" o
                                LEFT JOIN "User" u ON u."id" = o."userId"
                                WHERE ${whereClause}
                                `
          )) as unknown as NeonHttpQueryResult<CountResult>

          const total = Number(totalResult.rows[0]?.count) ?? 0

          return {
            data: data.rows as OrderForTable[],
            total,
          }
        })

        const pageCount = Math.ceil(total / input.perPage)

        return {
          data,
          pageCount,
        }
      } catch (error) {
        console.error(error)
        return {
          data: [],
          pageCount: 0,
        }
      }
    },
    [JSON.stringify(input)],
    {
      revalidate: 3600,
      tags: ["orders"],
    }
  )()
}
