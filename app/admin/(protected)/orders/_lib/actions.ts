"use server"

import { db } from "@/db/db"
import { currentUser } from "@/lib/auth"
import { getErrorMessage } from "@/lib/handle-error"
import { createOrderSchema } from "@/schemas"

import { revalidateTag, unstable_noStore } from "next/cache"
import * as z from "zod"
import { eq, and, sql } from "drizzle-orm"
import {
  address,
  inventoryManagement,
  order,
  orderDetails,
  productInventory,
} from "@rahulsaamanth/mhp-schema"

export async function getOrder(id: string) {
  try {
    const data = await db.query.order.findMany({
      where: eq(order.id, id),
      with: {
        orderDetails: {
          with: {
            order: true,
            product: true,
          },
        },
      },
    })

    // Return empty array if no data found (instead of potentially undefined)
    return data || []
  } catch (error) {
    console.error("Error fetching order", error)
    return { error: "Internal server error" }
  }
}

export async function createOrder(data: z.infer<typeof createOrderSchema>) {
  unstable_noStore()
  try {
    const user = await currentUser()

    if (!user) {
      return {
        success: false,
        error: "Unauthorized",
      }
    }

    // Start a transaction
    return await db.transaction(async (tx) => {
      // Create shipping address
      const [shippingAddressResult] = await tx
        .insert(address)
        .values({
          userId: data.userId || user.id!,
          street: data.shippingAddress.street,
          city: data.shippingAddress.city,
          state: data.shippingAddress.state,
          postalCode: data.shippingAddress.postalCode,
          country: data.shippingAddress.country,
          type: "SHIPPING",
        })
        .returning({ id: address.id })

      const shippingAddressId = shippingAddressResult?.id

      const invoiceNumber = `INV-${new Date().getFullYear()}-${String(
        new Date().getMonth() + 1
      ).padStart(
        2,
        "0"
      )}-${String(Math.floor(Math.random() * 100000)).padStart(5, "0")}`

      // Create order
      const [orderResult] = await tx
        .insert(order)
        .values({
          userId: data.userId || user.id!,
          customerName: data.customerName,
          customerPhone: data.customerPhone,
          customerEmail: data.customerEmail || null,
          isGuestOrder: data.isGuestOrder,
          storeId: data.storeId,
          orderDate: new Date(),
          invoiceNumber: invoiceNumber,
          subtotal: data.subtotal,
          shippingCost: data.shippingCost,
          discount: data.discount,
          tax: data.tax,
          totalAmountPaid: data.totalAmountPaid,
          orderType: data.orderType,
          deliveryStatus: data.deliveryStatus,
          addressId: String(shippingAddressId),
          paymentStatus: data.paymentStatus,
          paymentIntentId: data.paymentIntentId || null,
          customerNotes: data.customerNotes || null,
          adminNotes: data.adminNotes || null,
          estimatedDeliveryDate: data.estimatedDeliveryDate || null,
        })
        .returning({ id: order.id })

      const orderId = orderResult?.id!

      // Create order details and update inventory
      for (const item of data.orderItems) {
        // Create order detail
        await tx.insert(orderDetails).values({
          orderId,
          productVariantId: item.productVariantId,
          originalPrice: item.originalPrice,
          discountAmount: item.discountAmount,
          taxAmount: item.taxAmount,
          unitPrice: item.unitPrice,
          quantity: item.quantity,
          itemStatus: data.deliveryStatus,
          fulfilledFromStoreId: data.storeId,
        })

        // Update inventory if order is confirmed
        if (data.deliveryStatus !== "CANCELLED") {
          // Get current inventory
          const inventory = await tx.query.productInventory.findFirst({
            where: (inv) =>
              and(
                eq(inv.productVariantId, item.productVariantId),
                eq(inv.storeId, data.storeId)
              ),
          })

          if (inventory) {
            const previousStock = inventory.stock
            const newStock = Math.max(0, previousStock - item.quantity)

            // Update inventory
            await tx
              .update(productInventory)
              .set({
                stock: newStock,
                updatedAt: new Date(),
              })
              .where(
                and(
                  eq(productInventory.productVariantId, item.productVariantId),
                  eq(productInventory.storeId, data.storeId)
                )
              )

            // Record inventory movement
            await tx.insert(inventoryManagement).values({
              productVariantId: item.productVariantId,
              orderId,
              type: "OUT",
              quantity: item.quantity,
              reason: `Order ${orderId}`,
              storeId: data.storeId,
              previousStock,
              newStock,
              createdAt: new Date(),
              createdBy: user.id!,
            })
          }
        }
      }

      revalidateTag("orders")

      return {
        success: true,
        orderId,
      }
    })
  } catch (error) {
    console.error("Error creating order:", error)
    return {
      success: false,
      error: getErrorMessage(error),
    }
  }
}

export async function updateOrder(
  orderId: string,
  data: z.infer<typeof createOrderSchema>
) {
  try {
    const user = await currentUser()

    if (!user) {
      return {
        success: false,
        error: "Unauthorized",
      }
    }

    // Implementation for updating an order would go here
    // This would be more complex as it would need to handle:
    // 1. Updating order details
    // 2. Potentially adjusting inventory based on changes
    // 3. Handling address changes
    // 4. Managing order items that were added/removed/modified

    revalidateTag("orders")

    return {
      success: true,
      orderId,
    }
  } catch (error) {
    console.error("Error updating order:", error)
    return {
      success: false,
      error: getErrorMessage(error),
    }
  }
}

export async function deleteOrders({ ids }: { ids: string[] }) {
  unstable_noStore()
  try {
    const user = await currentUser()

    if (!user) {
      return {
        success: false,
        error: "Unauthorized",
      }
    }

    // Delete orders in a transaction to ensure all related data is properly deleted
    await db.transaction(async (tx) => {
      // First delete related order details to maintain referential integrity
      for (const id of ids) {
        await tx.delete(orderDetails).where(eq(orderDetails.orderId, id))
      }

      // Then delete the orders
      await tx.delete(order).where(
        sql`${order.id} IN (${sql.join(
          ids.map((id) => sql`${id}`),
          sql`, `
        )})`
      )
    })

    revalidateTag("orders")

    return {
      success: true,
    }
  } catch (error) {
    console.error("Error deleting orders:", error)
    return {
      success: false,
      error: getErrorMessage(error),
    }
  }
}
