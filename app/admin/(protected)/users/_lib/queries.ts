import "server-only"

import { cache } from "@/lib/cache"
import { filterColumns } from "@/lib/filter-columns"
import { UsersWithOrders } from "@/actions/users"
import { order, user } from "@rahulsaamanth/mhp-schema"
import { SQLChunk, sql } from "drizzle-orm"
import { db } from "@/db/db"
import { NeonHttpQueryResult } from "drizzle-orm/neon-http"
import { GetUsersSchema } from "./validations"

interface CountResult {
  count: string | number
}

export async function getUsers(input: GetUsersSchema) {
  return cache(
    async () => {
      try {
        const offset = (input.page - 1) * input.perPage
        const fromDate = input.from ? new Date(input.from) : undefined
        const toDate = input.to ? new Date(input.to) : undefined

        const advancedTable = input.flags.includes("advancedTable")

        const advancedWhere: SQLChunk[] =
          input.filters && input.filters.length > 0
            ? (filterColumns({
                table: user,
                filters: input.filters,
                joinOperator: input.joinOperator,
              }) as unknown as SQLChunk[]) || []
            : []

        const whereConditions: SQLChunk[] = advancedTable
          ? advancedWhere
          : [
              input.name ? sql`u."name" ILIKE ${`%${input.name}%`}` : sql`1=1`,
              input.email
                ? sql`u."email" ILIKE ${`%${input.email}%`}`
                : sql`1=1`,
              input.phone
                ? sql`u."phone" ILIKE ${`%${input.phone}%`}`
                : sql`1=1`,
              fromDate
                ? sql`u."createdAt" >= ${fromDate.toISOString()}`
                : sql`1=1`,
              toDate ? sql`u."createdAt" <= ${toDate.toISOString()}` : sql`1=1`,
            ].filter(Boolean)

        const whereClause =
          whereConditions.length > 0
            ? sql`${sql.join(whereConditions as SQLChunk[], sql` AND `)}`
            : sql`WHERE 1=1`

        const orderBy = input.sort.map((item) => {
          const direction = item.desc ? "DESC" : "ASC"
          const column = item.id as keyof UsersWithOrders

          switch (column) {
            case "name":
              return sql`"name" ${sql.raw(direction)}`
            case "email":
              return sql`"email" ${sql.raw(direction)}`
            case "phone":
              return sql`"phone" ${sql.raw(direction)}`
            case "createdAt":
              return sql`"createdAt" ${sql.raw(direction)}`
            default:
              return sql`"createdAt" DESC`
          }
        })

        const orderByClause =
          orderBy.length > 0
            ? sql`ORDER BY ${sql.join(orderBy, sql`, `)}`
            : sql`ORDER BY "createdAt" DESC`

        const { data, total } = await db.transaction(async (tx) => {
          const data = (await tx.execute(sql`
            WITH 
            UserStats AS (
              SELECT 
                u."id",
                u."name",
                u."email",
                u."emailVerified",
                u."phone",
                u."createdAt",
                u."lastActive",
                (
                  SELECT COALESCE(ARRAY_AGG(o.*), '{}')
                  FROM "Order" o
                  WHERE o."userId" = u.id
                ) as "orders"
              FROM "User" u
              WHERE u."role" = 'USER' AND ${whereClause}
            )
            SELECT *
            FROM UserStats
            ${orderByClause}            
            LIMIT ${input.perPage}
            OFFSET ${offset}
          `)) as unknown as NeonHttpQueryResult<UsersWithOrders>

          const totalResult = (await tx.execute(
            sql`
              SELECT COUNT(*) as count
              FROM "User" u
              WHERE u."role" = 'USER' AND ${whereClause}
            `
          )) as unknown as NeonHttpQueryResult<CountResult>

          const total = Number(totalResult.rows[0]?.count) ?? 0

          return {
            data: data.rows as UsersWithOrders[],
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
      tags: ["users"],
    }
  )()
}
