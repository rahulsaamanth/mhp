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
  // Disable caching to always fetch fresh data
  unstable_noStore()

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
        address: true,
        store: true,
        user: true,
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
      // Make sure we always have a valid userId for the address
      // For offline orders, we'll use the admin's userId if no specific user is provided
      const [shippingAddressResult] = await tx
        .insert(address)
        .values({
          userId: data.userId || user.id!, // Always use admin's ID if no userId provided
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
          createdAt: new Date(),
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

    // Implementation for updating an order
    return await db.transaction(async (tx) => {
      // Get the current order to compare changes
      const currentOrder = await tx.query.order.findFirst({
        where: eq(order.id, orderId),
        with: {
          orderDetails: {
            with: {
              product: true,
            },
          },
          address: true,
        },
      })

      if (!currentOrder) {
        return {
          success: false,
          error: "Order not found",
        }
      }

      // Update shipping address
      await tx
        .update(address)
        .set({
          street: data.shippingAddress.street,
          city: data.shippingAddress.city,
          state: data.shippingAddress.state,
          postalCode: data.shippingAddress.postalCode,
          country: data.shippingAddress.country,
          updatedAt: new Date(),
        })
        .where(eq(address.id, currentOrder.addressId))

      // Update the order details
      await tx
        .update(order)
        .set({
          // For offline orders, ensure we use the admin's ID if no user ID is provided
          userId: data.userId || user.id!,
          customerName: data.customerName,
          customerPhone: data.customerPhone,
          customerEmail: data.customerEmail || null,
          isGuestOrder: data.isGuestOrder,
          storeId: data.storeId,
          subtotal: data.subtotal,
          shippingCost: data.shippingCost,
          discount: data.discount,
          tax: data.tax,
          totalAmountPaid: data.totalAmountPaid,
          orderType: data.orderType,
          deliveryStatus: data.deliveryStatus,
          paymentStatus: data.paymentStatus,
          paymentIntentId: data.paymentIntentId || null,
          customerNotes: data.customerNotes || null,
          adminNotes: data.adminNotes || null,
          estimatedDeliveryDate: data.estimatedDeliveryDate,
          updatedAt: new Date(),
        })
        .where(eq(order.id, orderId))

      // Handle order items
      // 1. Delete existing order details
      await tx.delete(orderDetails).where(eq(orderDetails.orderId, orderId))

      // 2. Add new order details
      for (const item of data.orderItems) {
        // Check if product exists in inventory and update stock
        if (item.productVariantId) {
          const inventoryItem = await tx.query.productInventory.findFirst({
            where: and(
              eq(productInventory.productVariantId, item.productVariantId),
              eq(productInventory.storeId, data.storeId)
            ),
          })

          if (inventoryItem) {
            // Calculate previous and new stock
            const previousStock = inventoryItem.stock
            const newStock = previousStock - item.quantity

            // Add order details
            await tx.insert(orderDetails).values({
              orderId: orderId,
              productVariantId: item.productVariantId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              originalPrice: item.originalPrice,
            })

            // Update inventory stock
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
              reason: `Order Update ${orderId}`,
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

/**
 * Updates the admin view status of an order
 */
export async function updateOrderAdminStatus(
  orderId: string,
  status: "NEW" | "OPENED" | "PROCESSING" | "CLOSED"
) {
  try {
    const user = await currentUser()

    if (!user || user.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" }
    }

    // Update the order status in the database
    await db
      .update(order)
      .set({
        adminViewStatus: status,
        updatedAt: new Date(),
      })
      .where(eq(order.id, orderId))

    // Revalidate the orders page to reflect the changes
    revalidateTag("orders")

    return { success: true }
  } catch (error) {
    console.error("Error updating order admin status:", error)
    return {
      success: false,
      error: getErrorMessage(error),
    }
  }
}
