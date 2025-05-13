"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { OrderForTable } from "@/types"
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Copy,
  MoreVertical,
  Package,
  ReceiptText,
  ShoppingCart,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import React from "react"
import { OrderDetailedInfo } from "../_lib/queries"

interface OrderDetailsCardProps {
  selectedOrderId: string | null
  orders: OrderForTable[]
  orderDetails: Record<string, OrderDetailedInfo | null>
  setSelectedOrderIdAction: React.Dispatch<React.SetStateAction<string | null>>
}

export function OrderDetailsCard({
  selectedOrderId,
  orders,
  orderDetails,
  setSelectedOrderIdAction,
}: OrderDetailsCardProps) {
  // Get the selected order from orders array
  const selectedOrder = selectedOrderId
    ? orders.find((order) => order.id === selectedOrderId)
    : null

  // Get the selected order details from the prefetched details
  const currentOrderDetails = selectedOrderId
    ? orderDetails[selectedOrderId]
    : null

  // Find the previous/next order for navigation
  const findAdjacentOrder = (direction: "prev" | "next") => {
    if (!selectedOrderId || !orders || orders.length === 0) return

    const currentIndex = orders.findIndex(
      (order) => order.id === selectedOrderId
    )
    if (currentIndex === -1) return

    if (direction === "prev" && currentIndex > 0) {
      const prevOrder = orders[currentIndex - 1]
      if (prevOrder) {
        setSelectedOrderIdAction(prevOrder.id)
      }
    } else if (direction === "next" && currentIndex < orders.length - 1) {
      const nextOrder = orders[currentIndex + 1]
      if (nextOrder) {
        setSelectedOrderIdAction(nextOrder.id)
      }
    }
  }

  // Format date for display
  const formattedDate = selectedOrder
    ? new Date(selectedOrder.orderDate).toLocaleDateString()
    : ""

  // Render a skeleton when no order is selected
  if (!selectedOrder || orders.length === 0) {
    return (
      <Card className="overflow-hidden" x-chunk="dashboard-05-chunk-4">
        <CardHeader className="flex flex-row items-start bg-muted/50">
          <div className="grid gap-0.5">
            <CardTitle className="group flex items-center gap-2 text-lg">
              <Skeleton className="h-6 w-40" />
            </CardTitle>
            <CardDescription>
              <Skeleton className="h-4 w-28" />
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-6 text-sm">
          <div className="grid gap-4">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-20 w-full" />
          </div>
        </CardContent>
        <CardFooter className="flex flex-row items-center border-t bg-muted/50 px-6 py-3">
          <Skeleton className="h-4 w-20" />
          <div className="ml-auto flex gap-1">
            <Skeleton className="h-6 w-6" />
            <Skeleton className="h-6 w-6" />
          </div>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden" x-chunk="dashboard-05-chunk-4">
      <CardHeader className="flex flex-row items-start bg-muted/50">
        <div className="grid gap-0.5">
          <CardTitle className="group flex items-center gap-2 text-lg">
            Order {selectedOrder?.id || ""}
            <Button
              size="icon"
              variant="outline"
              className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
            >
              <Copy className="h-3 w-3" />
              <span className="sr-only">Copy Order ID</span>
            </Button>
          </CardTitle>
          <CardDescription>Date: {formattedDate}</CardDescription>
        </div>
        <div className="ml-auto flex items-center gap-1">
          <Button asChild size="sm" variant="outline" className="h-8 gap-1">
            <Link
              href={`/admin/invoices?invoiceNumber=${currentOrderDetails?.invoiceNumber || selectedOrder?.id}`}
            >
              <ReceiptText className="h-3.5 w-3.5" />
              <span className="lg:sr-only xl:not-sr-only xl:whitespace-nowrap">
                View Invoice
              </span>
            </Link>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="outline" className="h-8 w-8">
                <MoreVertical className="h-3.5 w-3.5" />
                <span className="sr-only">More</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Edit</DropdownMenuItem>
              <DropdownMenuItem>Export</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Trash</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="p-6 text-sm">
        {!currentOrderDetails ? (
          <div className="grid gap-4">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : (
          <>
            <div className="grid gap-3">
              <div className="font-semibold flex items-center gap-2">
                <Package className="h-4 w-4" />
                Order Details
              </div>
              <ul className="grid gap-3">
                <li className="flex items-center justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>
                    ₹{currentOrderDetails.subtotal?.toFixed(2) || "0.00"}
                  </span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-muted-foreground">Discount Code</span>
                  <span>{currentOrderDetails.discountCode || "None"}</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-muted-foreground">Discount</span>
                  <span>
                    ₹{currentOrderDetails.discount?.toFixed(2) || "0.00"}
                  </span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>
                    ₹{currentOrderDetails.shippingCost?.toFixed(2) || "0.00"}
                  </span>
                </li>
                <li className="flex items-center justify-between font-medium">
                  <span className="text-muted-foreground">Total Amount</span>
                  <span>
                    ₹{currentOrderDetails.totalAmountPaid?.toFixed(2) || "0.00"}
                  </span>
                </li>
              </ul>

              <Separator className="my-2" />

              <ul className="grid gap-3">
                <li className="flex items-center justify-between">
                  <span className="text-muted-foreground">Payment Status</span>
                  <Badge variant="default">
                    {currentOrderDetails.paymentStatus?.toString()}
                  </Badge>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-muted-foreground">Order Type</span>
                  <Badge variant="outline">
                    {currentOrderDetails.orderType?.toString()}
                  </Badge>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-muted-foreground">Delivery Status</span>
                  <Badge variant="default">
                    {currentOrderDetails.deliveryStatus?.toString()}
                  </Badge>
                </li>
              </ul>

              {/* Address section */}
              {currentOrderDetails.shippingAddress && (
                <>
                  <Separator className="my-2" />
                  <div className="grid gap-2">
                    <div>
                      <h5 className="text-xs font-medium">Delivery Address</h5>
                      <p className="text-xs text-muted-foreground">
                        {currentOrderDetails.shippingAddress.street},{" "}
                        {currentOrderDetails.shippingAddress.city},{" "}
                        {currentOrderDetails.shippingAddress.state},{" "}
                        {currentOrderDetails.shippingAddress.postalCode},{" "}
                        {currentOrderDetails.shippingAddress.country}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>

            <Separator className="my-4" />

            <div className="grid gap-3">
              <div className="font-semibold flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                Products
              </div>
              <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                {currentOrderDetails?.products &&
                currentOrderDetails.products.length > 0 ? (
                  currentOrderDetails.products.map((product) => (
                    <div
                      key={product.id}
                      className="flex gap-3 border rounded-md p-2"
                    >
                      <div className="h-16 w-16 overflow-hidden rounded-md relative bg-muted">
                        {product.image ? (
                          <Image
                            src={product.image}
                            fill
                            alt={product.name}
                            className="object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center bg-muted">
                            <Package className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">
                          {product.name}
                        </h4>
                        <span className="text-xs text-muted-foreground truncate block">
                          {product.variantName || ""}{" "}
                          {product.potency !== "NONE"
                            ? `- ${product.potency}`
                            : ""}{" "}
                          {product.packSize ? `- ${product.packSize}` : ""}
                        </span>
                        <div className="flex justify-between mt-1">
                          <span className="text-xs">
                            ₹{product.unitPrice.toFixed(2)} × {product.quantity}
                          </span>
                          <span className="font-medium">
                            ₹{product.totalPrice.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-3 flex flex-col items-center text-muted-foreground">
                    <AlertCircle className="h-5 w-5 mb-1" />
                    <span className="block">No products found</span>
                  </div>
                )}
              </div>
            </div>

            <Separator className="my-4" />

            <div className="grid gap-3">
              <div className="font-semibold">Customer Information</div>
              <div className="flex items-start gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src=""
                    alt={currentOrderDetails.userName || ""}
                  />
                  <AvatarFallback>
                    {currentOrderDetails.userName?.substring(0, 2) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="grid gap-1">
                  <h4 className="font-medium">
                    {currentOrderDetails.userName || "No name provided"}
                  </h4>
                  {currentOrderDetails.userEmail && (
                    <p className="text-xs text-muted-foreground">
                      {currentOrderDetails.userEmail}
                    </p>
                  )}
                  {currentOrderDetails.userPhone && (
                    <p className="text-xs text-muted-foreground">
                      {currentOrderDetails.userPhone}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>

      <CardFooter className="flex flex-row items-center border-t bg-muted/50 px-6 py-3">
        <div className="text-xs text-muted-foreground">
          Updated <time dateTime={formattedDate}>{formattedDate}</time>
        </div>
        <Pagination className="ml-auto mr-0 w-auto">
          <PaginationContent>
            <PaginationItem>
              <Button
                size="icon"
                variant="outline"
                className="h-6 w-6"
                onClick={() => findAdjacentOrder("prev")}
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                <span className="sr-only">Previous Order</span>
              </Button>
            </PaginationItem>
            <PaginationItem>
              <Button
                size="icon"
                variant="outline"
                className="h-6 w-6"
                onClick={() => findAdjacentOrder("next")}
              >
                <ChevronRight className="h-3.5 w-3.5" />
                <span className="sr-only">Next Order</span>
              </Button>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </CardFooter>
    </Card>
  )
}
