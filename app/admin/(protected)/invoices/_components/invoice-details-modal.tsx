// /home/rahulsaamanth/Code0/mhp/app/admin/(protected)/invoices/_components/invoice-details-modal.tsx
"use client"

import React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { InvoiceDetailedInfo } from "../_lib/queries"
import { Download, Send, Printer, Copy } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/formatters"
import { Skeleton } from "@/components/ui/skeleton"
import { paymentStatus } from "@rahulsaamanth/mhp-schema"

interface InvoiceDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  invoiceDetails: InvoiceDetailedInfo | null
}

export function InvoiceDetailsModal({
  isOpen,
  onClose,
  invoiceDetails,
}: InvoiceDetailsModalProps) {
  const handleDownload = () => {
    // Implement download functionality
    console.log("Downloading invoice:", invoiceDetails?.invoiceNumber)
  }

  const handleSend = () => {
    // Implement send functionality
    console.log("Sending invoice to:", invoiceDetails?.userEmail)
  }

  const handlePrint = () => {
    window.print()
  }

  // Format date for display
  const formattedDate = invoiceDetails
    ? new Date(invoiceDetails.orderDate).toLocaleDateString()
    : ""

  // Render a skeleton when no invoice is selected
  if (!invoiceDetails) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              <Skeleton className="h-6 w-40" />
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-20 w-full" />
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span>Invoice #{invoiceDetails.invoiceNumber}</span>
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6"
                onClick={() => {
                  navigator.clipboard.writeText(
                    invoiceDetails.invoiceNumber || ""
                  )
                }}
              >
                <Copy className="h-3 w-3" />
                <span className="sr-only">Copy Invoice Number</span>
              </Button>
            </div>
            <Badge
              variant={
                String(invoiceDetails.paymentStatus) === "PAID"
                  ? "secondary"
                  : String(invoiceDetails.paymentStatus) === "FAILED"
                    ? "destructive"
                    : "outline"
              }
            >
              {String(invoiceDetails.paymentStatus)
                .toLowerCase()
                .replace("_", " ")}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Invoice Header */}
          <div className="flex justify-between">
            <div>
              <h3 className="font-semibold">Invoice To:</h3>
              <p>{invoiceDetails.userName}</p>
              <p>{invoiceDetails.userEmail}</p>
              <p>{invoiceDetails.userPhone}</p>
            </div>
            <div className="text-right">
              <h3 className="font-semibold">Invoice Details:</h3>
              <p>Date: {formattedDate}</p>
              <p>Order ID: {invoiceDetails.id}</p>
            </div>
          </div>

          <Separator />

          {/* Shipping & Billing Address */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Shipping Address:</h3>
              {invoiceDetails.shippingAddress ? (
                <address className="not-italic">
                  <p>{invoiceDetails.shippingAddress.street}</p>
                  <p>
                    {invoiceDetails.shippingAddress.city},{" "}
                    {invoiceDetails.shippingAddress.state}{" "}
                    {invoiceDetails.shippingAddress.postalCode}
                  </p>
                  <p>{invoiceDetails.shippingAddress.country}</p>
                </address>
              ) : (
                <p className="text-muted-foreground">No shipping address</p>
              )}
            </div>
            <div>
              <h3 className="font-semibold mb-2">Billing Address:</h3>
              {invoiceDetails.billingAddress ? (
                <address className="not-italic">
                  <p>{invoiceDetails.billingAddress.street}</p>
                  <p>
                    {invoiceDetails.billingAddress.city},{" "}
                    {invoiceDetails.billingAddress.state}{" "}
                    {invoiceDetails.billingAddress.postalCode}
                  </p>
                  <p>{invoiceDetails.billingAddress.country}</p>
                </address>
              ) : (
                <p className="text-muted-foreground">No billing address</p>
              )}
            </div>
          </div>

          <Separator />

          {/* Products Table */}
          <div>
            <h3 className="font-semibold mb-2">Products:</h3>
            <div className="border rounded-md">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Unit Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {invoiceDetails.products.map((product, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-medium">{product.name}</span>
                          <span className="text-xs text-gray-500">
                            {product.variantName} - {product.potency}
                            {product.packSize ? ` (${product.packSize})` : ""}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {product.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {formatCurrency(product.unitPrice)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {formatCurrency(product.totalPrice)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Invoice Summary */}
          <div className="flex justify-end">
            <div className="w-64 space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal:</span>
                <span>{formatCurrency(invoiceDetails.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping:</span>
                <span>{formatCurrency(invoiceDetails.shippingCost)}</span>
              </div>
              {invoiceDetails.discount > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Discount:</span>
                  <span>-{formatCurrency(invoiceDetails.discount)}</span>
                </div>
              )}
              {invoiceDetails.tax > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax:</span>
                  <span>{formatCurrency(invoiceDetails.tax)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Total:</span>
                <span>{formatCurrency(invoiceDetails.totalAmountPaid)}</span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
            <Button variant="outline" onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
            <Button onClick={handleSend}>
              <Send className="mr-2 h-4 w-4" />
              Send to Customer
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
