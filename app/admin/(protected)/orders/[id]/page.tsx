"use client"

import { db } from "@/db/db"
import { useQuery } from "@tanstack/react-query"
import React, { useEffect } from "react"
import { getOrder, updateOrderAdminStatus } from "../_lib/actions"
import { notFound } from "next/navigation"
import { OrderForm } from "../_components/order-form"

import { eq } from "drizzle-orm"

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

  const {
    data: orderData,
    isPending: isOrderLoading,
    isError: isOrderError,
  } = useQuery<OrderData | OrderError>({
    queryKey: ["orders", id],
    queryFn: () => getOrder(id),
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  })

  useEffect(() => {
    if (orderData && !("error" in orderData) && orderData.length > 0) {
      const order = orderData[0]
      if (
        order &&
        (order.adminViewStatus === "NEW" || !order.adminViewStatus)
      ) {
        updateOrderAdminStatus(id, "OPENED").catch(console.error)
      }
    }
  }, [orderData, id])

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
    return (
      <div className="container mx-auto p-6 text-center">
        <p className="text-lg">Loading order details...</p>
      </div>
    )
  }

  if (!orderData || "error" in orderData) {
    return notFound()
  }

  if (Array.isArray(orderData) && orderData.length === 0) {
    return notFound()
  }

  const order = Array.isArray(orderData) ? orderData[0] : orderData

  if (!order) {
    return notFound()
  }

  const shippingAddress = order.address || {
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
  }

  const productDetails = order.orderDetails?.[0]?.product

  console.log(
    "Order Details Structure:",
    order.orderDetails?.[0]
      ? {
          productObject: order.orderDetails[0].product,
          detailObject: order.orderDetails[0],
        }
      : "No order details"
  )

  if (order.orderDetails?.[0]?.product) {
    console.log("First product variant structure:", {
      id: order.orderDetails[0].product.id,
      productId: order.orderDetails[0].product.productId,
      variantName: order.orderDetails[0].product.variantName,
      sku: order.orderDetails[0].product.sku,
    })
  }

  console.log("Full order data structure:", order)

  const preparedOrderData = {
    ...order,
    shippingAddress,
    orderItems:
      order.orderDetails?.map((detail: any) => {
        if (!detail.product) {
          console.error("No product data found for order detail:", detail.id)
          return {
            id: detail.id,
            productVariantId: detail.productVariantId || "",
            quantity: detail.quantity || 0,
            unitPrice: detail.unitPrice || 0,
            originalPrice: detail.originalPrice || detail.unitPrice || 0,
            totalPrice: (detail.quantity || 0) * (detail.unitPrice || 0),
            discountAmount: detail.discountAmount || 0,
            taxAmount: detail.taxAmount || 0,
            productName: `Unknown Product (${detail.productVariantId})`,
            variantName: "",
            potency: "",
            packSize: null,
            sku: "",
          }
        }

        const productName =
          detail.product?.variantName ||
          `Unknown Product (${detail.productVariantId})`

        return {
          id: detail.id,
          productId: detail.product?.productId || "",
          productVariantId: detail.productVariantId || "",
          quantity: detail.quantity || 0,
          unitPrice: detail.unitPrice || 0,
          originalPrice: detail.originalPrice || detail.unitPrice || 0,
          totalPrice: (detail.quantity || 0) * (detail.unitPrice || 0),
          discountAmount: detail.discountAmount || 0,
          taxAmount: detail.taxAmount || 0,
          productName: productName,
          variantName: detail.product?.variantName || "",
          potency: detail.product?.potency || "",
          packSize: detail.product?.packSize,
          sku: detail.product?.sku || "",
        }
      }) || [],
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
