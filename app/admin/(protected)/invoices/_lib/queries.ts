// /home/rahulsaamanth/Code0/mhp/app/admin/(protected)/invoices/_lib/queries.ts
import "server-only"

import { type GetInvoicesSchema } from "./validations"
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
import { InvoiceForTable, OrderWithComputedFields } from "@/types"
import { NeonHttpQueryResult } from "drizzle-orm/neon-http"

interface CountResult {
  count: number | number
}

// Interface for the detailed invoice information
export interface InvoiceDetailedInfo
  extends Omit<OrderWithComputedFields, "orderDetails"> {
  status: any
  customer: any
  items: any
  total: number
  notes: string
  dueDate: string | number | Date
  date: string | number | Date
  company: any
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
  tax: number
  discount: number
  totalAmountPaid: number
  paymentMethod?: string
  paymentStatus: typeof paymentStatus
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
  orderDate: Date
  isGuestOrder: boolean
  customerName: string
  customerEmail: string | null
  customerPhone: string | null
}

export async function getInvoices(input: GetInvoicesSchema) {
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
              input.invoiceNumber
                ? sql`o."invoiceNumber" ILIKE ${`%${input.invoiceNumber}%`}`
                : sql`1=1`,
              input.userName
                ? sql`u."name" ILIKE ${`%${input.userName}%`}`
                : sql`1=1`,
              fromDate
                ? sql`o."orderDate" >= ${fromDate.toISOString()}`
                : sql`1=1`,
              toDate ? sql`o."orderDate" <= ${toDate.toISOString()}` : sql`1=1`,
              // Only include orders that have an invoice number
              sql`o."invoiceNumber" IS NOT NULL`,
            ].filter(Boolean)

        const whereClause =
          whereConditions.length > 0
            ? sql`${sql.join(whereConditions as SQLChunk[], sql` AND `)}`
            : sql`WHERE 1=1`

        const orderBy = input.sort.map((item) => {
          const direction = item.desc ? "DESC" : "ASC"
          const column = item.id as keyof InvoiceForTable

          switch (column) {
            case "totalAmountPaid":
              return sql`"totalAmountPaid" ${sql.raw(direction)} NULLS LAST`
            case "orderDate":
              return sql`"orderDate" ${sql.raw(direction)}`
            case "userName":
              return sql`"userName" ${sql.raw(direction)} NULLS LAST`
            case "invoiceNumber":
              return sql`"invoiceNumber" ${sql.raw(direction)} NULLS LAST`
            default:
              return sql`"orderDate" DESC`
          }
        })

        const { data, total } = await db.transaction(async (tx) => {
          const data = (await tx.execute(sql`
                            WITH InvoiceStats AS(
                               SELECT 
                                o."id",
                                o."orderDate",
                                o."totalAmountPaid",
                                o."subtotal",
                                o."tax",
                                o."discount",
                                o."paymentStatus",
                                o."deliveryStatus",
                                o."orderType",
                                o."userId",
                                o."invoiceNumber",
                                o."shippingCost",
                                o."shippingAddressId", 
                                o."billingAddressId",
                                o."isGuestOrder",
                                o."customerName",
                                o."customerEmail",
                                o."customerPhone",
                                u."name" as "userName",
                                u."email" as "userEmail",
                                u."phone" as "userPhone"
                            FROM "Order" o
                            LEFT JOIN "User" u ON u."id" = o."userId"
                            WHERE ${whereClause}                                     
                            )
                            SELECT *
                            FROM InvoiceStats
                            ${orderBy.length ? sql`ORDER BY ${sql.join(orderBy, sql`, `)}` : sql``}
                            LIMIT ${input.perPage}
                            OFFSET ${offset}
                            `)) as unknown as NeonHttpQueryResult<
            Partial<InvoiceDetailedInfo>
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

          // For each invoice, fetch its details
          const invoicesWithDetails = await Promise.all(
            data.rows.map(async (invoice) => {
              if (!invoice.id) return invoice

              // Get addresses if they exist
              const addressesData = await fetchAddresses(tx, invoice)

              // Get order details with product information
              const orderDetails = await fetchOrderDetails(
                tx,
                invoice.id as string
              )

              return {
                ...invoice,
                ...addressesData,
                ...orderDetails,
              }
            })
          )

          return {
            data: invoicesWithDetails as InvoiceDetailedInfo[],
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
      revalidate: 60, // Cache for 60 seconds
      tags: ["invoices"],
    }
  )()
}

// Helper function to fetch addresses
async function fetchAddresses(
  tx: any,
  invoiceInfo: Partial<InvoiceDetailedInfo>
) {
  try {
    if (!invoiceInfo.shippingAddressId && !invoiceInfo.billingAddressId) {
      return {}
    }

    const shippingAddressId = invoiceInfo.shippingAddressId
    const billingAddressId = invoiceInfo.billingAddressId

    const shippingAddressPromise = shippingAddressId
      ? tx.execute(
          sql`SELECT "street", "city", "state", "postalCode", "country" FROM "Address" WHERE "id" = ${shippingAddressId}`
        )
      : Promise.resolve({ rows: [] })

    const billingAddressPromise = billingAddressId
      ? tx.execute(
          sql`SELECT "street", "city", "state", "postalCode", "country" FROM "Address" WHERE "id" = ${billingAddressId}`
        )
      : Promise.resolve({ rows: [] })

    const [shippingAddressResult, billingAddressResult] = await Promise.all([
      shippingAddressPromise,
      billingAddressPromise,
    ])

    return {
      shippingAddress: shippingAddressResult.rows[0] || null,
      billingAddress: billingAddressResult.rows[0] || null,
    }
  } catch (error) {
    console.error("Error fetching addresses:", error)
    return {}
  }
}

// Helper function to fetch order details with products
async function fetchOrderDetails(tx: any, orderId: string) {
  try {
    const orderDetailsResult = await tx.execute(sql`
      SELECT 
        od."id" as "orderDetailId",
        od."quantity",
        od."unitPrice",
        od."originalPrice",
        od."discountAmount",
        od."taxAmount",
        p."id" as "productId",
        p."name",
        p."description",
        pv."variantName",
        pv."potency",
        pv."packSize",
        pv."variantImage"
      FROM "OrderDetails" od
      JOIN "ProductVariant" pv ON od."productVariantId" = pv."id"
      JOIN "Product" p ON pv."productId" = p."id"
      WHERE od."orderId" = ${orderId}
    `)

    const products = orderDetailsResult.rows.map((detail: any) => {
      const totalPrice = detail.unitPrice * detail.quantity
      const image =
        detail.variantImage && detail.variantImage.length > 0
          ? detail.variantImage[0]
          : null

      return {
        id: detail.productId,
        name: detail.name,
        description: detail.description,
        quantity: detail.quantity,
        unitPrice: detail.unitPrice,
        totalPrice,
        image,
        variantName: detail.variantName,
        potency: detail.potency,
        packSize: detail.packSize,
      }
    })

    return { products }
  } catch (error) {
    console.error("Error fetching order details:", error)
    return { products: [] }
  }
}
