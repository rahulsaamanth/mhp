import "server-only"

import { type GetOrdersSchema } from "./validations"
import { cache } from "@/lib/cache"
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
export interface OrderDetailedInfo {
  id: string
  userId?: string
  customerName?: string
  customerPhone?: string
  customerEmail?: string | null
  isGuestOrder: boolean
  storeId?: string
  discountCodeId?: string
  createdAt: Date
  subtotal: number
  shippingCost: number
  discount: number
  tax: number
  totalAmountPaid: number
  orderType: (typeof orderType.enumValues)[number]
  deliveryStatus: (typeof deliveryStatus.enumValues)[number]
  addressId: string
  paymentStatus: (typeof paymentStatus.enumValues)[number]
  paymentIntentId?: string
  invoiceNumber?: string
  customerNotes?: string
  adminNotes?: string
  cancellationReason?: string
  estimatedDeliveryDate?: Date
  deliveredAt?: Date
  userName?: string
  userEmail?: string
  userPhone?: string
  adminViewStatus?: "NEW" | "OPENED" | "PROCESSING" | "CLOSED"
  shippingAddress?: {
    street: string
    city: string
    state: string
    postalCode: string
    country: string
  }
  products?: {
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
  discountCode?: string // Added discount code field
}

export async function getOrders(input: GetOrdersSchema) {
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
                ? sql`o."createdAt" >= ${fromDate.toISOString()}`
                : sql`1=1`,
              toDate ? sql`o."createdAt" <= ${toDate.toISOString()}` : sql`1=1`,
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
            case "createdAt":
              return sql`"createdAt" ${sql.raw(direction)}`
            case "userName":
              return sql`"userName" ${sql.raw(direction)} NULLS LAST`
            default:
              return sql`"createdAt" DESC`
          }
        })

        const result = await db.transaction(async (tx) => {
          const rawOrders = (await tx.execute(sql`
            WITH OrderStats AS(
               SELECT 
                o."id",
                o."createdAt",
                o."totalAmountPaid",
                o."subtotal",
                o."paymentStatus",
                o."deliveryStatus",
                o."orderType",
                o."userId",
                o."invoiceNumber",
                o."shippingCost",
                o."addressId",
                o."isGuestOrder",
                o."customerName",
                o."customerPhone",
                o."customerEmail",
                o."storeId",
                o."discount",
                o."tax",
                o."adminViewStatus",
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
          `)) as unknown as NeonHttpQueryResult<Partial<OrderDetailedInfo>>

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
            rawOrders.rows.map(async (order) => {
              if (!order.id) return order

              // Get shipping address if it exists
              const shippingAddressData = await fetchShippingAddress(tx, order)

              // Get order details with product information
              const orderDetails = await fetchOrderDetails(tx, order.id)

              return {
                ...order,
                ...shippingAddressData,
                ...orderDetails,
              }
            })
          )

          return {
            data: ordersWithDetails,
            total,
          }
        })

        const pageCount = Math.ceil(result.total / input.perPage)

        return {
          data: result.data,
          pageCount,
        }
      } catch (error) {
        console.error("Error fetching orders:", error)
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

// Helper function to fetch shipping address
async function fetchShippingAddress(
  tx: any,
  orderInfo: Partial<OrderDetailedInfo>
) {
  if (!orderInfo.addressId) {
    return {}
  }

  const addressData = await tx.execute(sql`
    SELECT 
      "street",
      "city",
      "state",
      "postalCode",
      "country"
    FROM "Address"
    WHERE "id" = ${orderInfo.addressId}
  `)

  if (addressData.rows.length === 0) {
    return {}
  }

  return {
    shippingAddress: {
      street: addressData.rows[0].street,
      city: addressData.rows[0].city,
      state: addressData.rows[0].state,
      postalCode: addressData.rows[0].postalCode,
      country: addressData.rows[0].country,
    },
  }
}

// Helper function to fetch order details with products
async function fetchOrderDetails(tx: any, orderId: string) {
  const [orderDetailsData, discountCodeData] = (await Promise.all([
    tx.execute(sql`
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
    `),
    tx.execute(sql`
      SELECT dc."code"
      FROM "Order" o
      LEFT JOIN "DiscountCode" dc ON o."discountCodeId" = dc."id"
      WHERE o."id" = ${orderId}
    `),
  ])) as [any, any]

  // Transform the data to match the OrderDetailedInfo interface
  const products = orderDetailsData.rows.map((item: any) => ({
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
    discountCode: discountCodeData.rows[0]?.code || "None",
  }
}
