"use client"

import { db } from "@/db/db"
import { useQuery } from "@tanstack/react-query"
import React from "react"
import { getOrder } from "../_lib/actions"
import { notFound } from "next/navigation"
import { OrderForm } from "../_components/order-form"
import { OrderFormSkeleton } from "../_components/loading-ui"

import { eq } from "drizzle-orm"

// Define types for our order data
type OrderError = { error: string }
type OrderData = Array<{
  id: string
  orderDetails: Array<any>
  address?: {
    street: string
    city: string
    state: string
    postalCode: string
    country: string
  }
  [key: string]: any
}>

export default function EditOrderPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = React.use(params)

  // Fetch order data with proper typings
  const {
    data: orderData,
    isPending: isOrderLoading,
    isError: isOrderError,
  } = useQuery<OrderData | OrderError>({
    queryKey: ["orders", id],
    queryFn: () => getOrder(id),
  })

  // Fetch additional data needed for the form
  const {
    data: formData,
    isPending: isFormDataLoading,
    isError: isFormDataError,
  } = useQuery({
    queryKey: ["order-form-data"],
    queryFn: async () => {
      try {
        const stores = await db.query.store.findMany({
          where: (s) => eq(s.isActive, true),
        })

        const users = await db.query.user.findMany({
          orderBy: (u) => u.name,
        })

        const products = await db.query.product.findMany({
          orderBy: (p) => p.name,
          limit: 100,
        })

        const categories = await db.query.category.findMany({
          orderBy: (c) => c.name,
        })

        const manufacturers = await db.query.manufacturer.findMany({
          orderBy: (m) => m.name,
        })

        return { stores, users, products, categories, manufacturers }
      } catch (error) {
        console.error("Failed to fetch form data:", error)
        throw new Error("Failed to load form data")
      }
    },
  })

  if (isOrderError) {
    return notFound()
  }

  if (isFormDataError) {
    return (
      <div className="container mx-auto p-6 text-center">
        <h2 className="text-2xl font-bold text-red-500 mb-4">
          Error Loading Form Data
        </h2>
        <p className="mb-6">
          There was a problem loading the required data for this form.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
        >
          Try Again
        </button>
      </div>
    )
  }

  if (isOrderLoading || isFormDataLoading) {
    return <OrderFormSkeleton />
  }

  // Check if orderData is an error object
  if (!orderData || "error" in orderData) {
    return notFound()
  }

  // Check if orderData is an array with no items
  if (Array.isArray(orderData) && orderData.length === 0) {
    return notFound()
  }

  // Transform orderData to match the format expected by OrderForm
  // The getOrder function returns an array, so we need to use the first item
  const order = Array.isArray(orderData) ? orderData[0] : orderData

  // At this point, we've already checked that order exists, but TypeScript doesn't know that
  // Let's ensure it's defined before we use it
  if (!order) {
    return notFound()
  }

  // Get shipping address from address relation
  const shippingAddress = order.address || {
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
  }

  // Get product details from the order
  const productDetails = order.orderDetails?.[0]?.product

  // For development only - inspect the structure of the order details
  if (process.env.NODE_ENV !== "production") {
    console.log(
      "Order Details Structure:",
      order.orderDetails?.[0]
        ? JSON.stringify(
            {
              product: order.orderDetails[0].product,
              detail: order.orderDetails[0],
            },
            null,
            2
          )
        : "No order details"
    )
  }

  // Prepare order data for the form with all required fields
  const preparedOrderData = {
    ...order,
    shippingAddress,
    orderItems:
      order.orderDetails?.map((detail: any) => {
        // Access product data correctly based on API response structure
        const product = detail.product || {}

        // For debugging - log the product information
        if (process.env.NODE_ENV !== "production") {
          console.log(`Product data for item ${detail.id}:`, product)
        }

        return {
          id: detail.id,
          productId: detail.productId,
          productVariantId: detail.productVariantId,
          quantity: detail.quantity,
          unitPrice: detail.unitPrice,
          originalPrice: product.mrp || detail.unitPrice,
          totalPrice: detail.totalPrice,
          discountAmount: 0, // Add default values required by schema
          taxAmount: product.taxAmount || 0, // Fix: was using tax instead of taxAmount
          // Make sure we get the product name
          productName: product.name || "Product " + detail.productId,
          // Make sure variant information is correctly retrieved
          variantName: product.variantName || "",
          potency: product.potency || "",
          packSize: product.packSize || 0,
          // Include the full product object for reference
          product: product,
        }
      }) || [],
    // Convert ISO string dates to Date objects if they exist
    estimatedDeliveryDate: order.estimatedDeliveryDate
      ? new Date(order.estimatedDeliveryDate)
      : undefined,
  }

  return (
    <div className="container mx-auto py-6">
      {formData && (
        <OrderForm props={formData} mode="edit" orderData={preparedOrderData} />
      )}
    </div>
  )
}
