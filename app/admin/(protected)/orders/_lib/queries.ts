import "server-only"

import { type GetOrdersSchema } from "./validations"
import { unstable_cache } from "next/cache"
import { filterColumns } from "@/lib/filter-columns"
import {
  order,
  paymentStatus,
  deliveryStatus,
  orderType,
} from "@rahulsaamanth/mhp-schema"
import { SQLChunk, sql } from "drizzle-orm"
import { db } from "@/db/db"
import { OrderForTable, OrderWithComputedFields } from "@/types"
import { NeonHttpQueryResult } from "drizzle-orm/neon-http"

interface CountResult {
  count: number | number
}

// Interface for the detailed order information
export interface OrderDetailedInfo
  extends Omit<OrderWithComputedFields, "orderDetails"> {
  products: {
    id: string
    name: string
    description: string
    quantity: number
    unitPrice: number
    totalPrice: number
    image: string | null
    variantName: string
    potency: string
    packSize: number | null
  }[]
  subtotal: number
  shippingCost: number
  paymentMethod?: string
  shippingAddressId?: string
  billingAddressId?: string
  shippingAddress?: {
    street: string
    city: string
    state: string
    postalCode: string
    country: string
  }
  billingAddress?: {
    street: string
    city: string
    state: string
    postalCode: string
    country: string
  }
  userEmail: string
  userPhone: string
  invoiceNumber?: string
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
                                o."subtotal",
                                o."paymentStatus",
                                o."deliveryStatus",
                                o."orderType",
                                o."userId",
                                o."invoiceNumber",
                                o."shippingCost",
                                o."shippingAddressId", 
                                o."billingAddressId",
                                u."name" as "userName",
                                u."email" as "userEmail",
                                u."phone" as "userPhone"
                            FROM "Order" o
                            LEFT JOIN "User" u ON u."id" = o."userId"
                            WHERE ${whereClause}                                     
                            )
                            SELECT *
                            FROM OrderStats
                            ${orderBy.length ? sql`ORDER BY ${sql.join(orderBy, sql`, `)}` : sql``}
                            LIMIT ${input.perPage}
                            OFFSET ${offset}
                            `)) as unknown as NeonHttpQueryResult<
            Partial<OrderDetailedInfo>
          >

          const totalResult = (await tx.execute(
            sql`
                                SELECT COUNT(*) as count
                                FROM "Order" o
                                LEFT JOIN "User" u ON u."id" = o."userId"
                                WHERE ${whereClause}
                                `
          )) as unknown as NeonHttpQueryResult<CountResult>

          const total = Number(totalResult.rows[0]?.count) ?? 0

          // For each order, fetch its details
          const ordersWithDetails = await Promise.all(
            data.rows.map(async (order) => {
              if (!order.id) return order

              // Get addresses if they exist
              const addressesData = await fetchAddresses(tx, order)

              // Get order details with product information
              const orderDetails = await fetchOrderDetails(
                tx,
                order.id as string
              )

              return {
                ...order,
                ...addressesData,
                ...orderDetails,
              }
            })
          )

          return {
            data: ordersWithDetails as OrderDetailedInfo[],
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

// Helper function to fetch addresses
async function fetchAddresses(tx: any, orderInfo: Partial<OrderDetailedInfo>) {
  if (!(orderInfo.shippingAddressId || orderInfo.billingAddressId)) {
    return {}
  }

  const addressIds = []
  if (orderInfo.shippingAddressId) addressIds.push(orderInfo.shippingAddressId)
  if (
    orderInfo.billingAddressId &&
    orderInfo.billingAddressId !== orderInfo.shippingAddressId
  ) {
    addressIds.push(orderInfo.billingAddressId)
  }

  if (addressIds.length === 0) return {}

  const addressesData = (await tx.execute(sql`
    SELECT 
      a."id",
      a."street",
      a."city",
      a."state",
      a."postalCode",
      a."country"
    FROM "Address" a
    WHERE a."id" IN (${sql.join(
      addressIds.map((id) => sql`${id}`),
      sql`, `
    )})
  `)) as unknown as NeonHttpQueryResult<{
    id: string
    street: string
    city: string
    state: string
    postalCode: string
    country: string
    type: string
  }>

  const result: Partial<OrderDetailedInfo> = {}

  if (addressesData.rows.length > 0) {
    for (const address of addressesData.rows) {
      if (address.id === orderInfo.shippingAddressId) {
        result.shippingAddress = {
          street: address.street,
          city: address.city,
          state: address.state,
          postalCode: address.postalCode,
          country: address.country,
        }
      }
      if (address.id === orderInfo.billingAddressId) {
        result.billingAddress = {
          street: address.street,
          city: address.city,
          state: address.state,
          postalCode: address.postalCode,
          country: address.country,
        }
      }
    }
  }

  return result
}

// Helper function to fetch order details with products
async function fetchOrderDetails(tx: any, orderId: string) {
  const orderDetailsData = (await tx.execute(sql`
    SELECT 
      od."id" as "orderDetailId",
      od."quantity",
      od."unitPrice",
      pv."id" as "variantId",
      pv."variantName",
      pv."potency",
      pv."packSize",
      pv."variantImage",
      p."id" as "productId",
      p."name" as "productName",
      p."description" as "productDescription",
      p."form" as "productForm"
    FROM "OrderDetails" od
    JOIN "ProductVariant" pv ON od."productVariantId" = pv."id"
    JOIN "Product" p ON pv."productId" = p."id"
    WHERE od."orderId" = ${orderId}
  `)) as unknown as NeonHttpQueryResult<{
    orderDetailId: string
    quantity: number
    unitPrice: number
    variantId: string
    variantName: string
    potency: string
    packSize: number | null
    variantImage: string[] | null
    productId: string
    productName: string
    productDescription: string
    productForm: string
  }>

  // Transform the data to match the OrderDetailedInfo interface
  const products = orderDetailsData.rows.map((item) => ({
    id: item.productId,
    name: item.productName,
    description: item.productDescription,
    quantity: Number(item.quantity) || 0,
    unitPrice: Number(item.unitPrice) || 0,
    totalPrice: (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0),
    image:
      item.variantImage && item.variantImage.length > 0
        ? item.variantImage[0]
        : null,
    variantName: item.variantName,
    potency: item.potency,
    packSize: item.packSize,
  }))

  return {
    products,
    // No need to return subtotal as it's already in the order record
  }
}
