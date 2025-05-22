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
import { Send, Printer, Copy, Package, ShoppingCart } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/formatters"
import { Skeleton } from "@/components/ui/skeleton"
import { DownloadInvoiceButton } from "./download-invoice-button"
import { sendInvoiceToCustomer } from "../_lib/invoice-utils"
import { toast } from "sonner"
import Image from "next/image"

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
  const [isSending, setIsSending] = React.useState(false)

  const handlePrint = () => {
    window.print()
  }

  const handleSend = async () => {
    if (!invoiceDetails) return

    try {
      setIsSending(true)
      const result = await sendInvoiceToCustomer(invoiceDetails)

      if (result.success) {
        toast.success(result.message || "Invoice sent successfully")
      } else {
        toast.error(result.message || "Failed to send invoice")
      }
    } catch (error) {
      console.error("Error sending invoice:", error)
      toast.error("An unexpected error occurred while sending the invoice")
    } finally {
      setIsSending(false)
    }
  }

  // Format date for display
  const formattedDate = invoiceDetails
    ? new Date(invoiceDetails.createdAt).toLocaleDateString()
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
      <DialogContent
        className="max-w-4xl print:shadow-none print:border-none print:max-w-full"
        id="invoice-content"
      >
        <div className="print:hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between pr-8">
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
        </div>

        <div className="space-y-6 py-4 print:p-0 print:max-w-full">
          {/* Invoice Header with Logo */}
          <div className="flex justify-between items-start border-b pb-4">
            <div className="w-1/3">
              <div className="relative h-20 w-40">
                <Image
                  src="/the_logo1.png"
                  alt="Company Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-2xl font-bold mb-1">INVOICE</h2>
              <p className="text-sm text-muted-foreground">
                #{invoiceDetails.invoiceNumber}
              </p>
              <p className="text-sm mt-2">Date: {formattedDate}</p>
              <Badge
                variant={
                  String(invoiceDetails.paymentStatus) === "PAID"
                    ? "secondary"
                    : String(invoiceDetails.paymentStatus) === "FAILED"
                      ? "destructive"
                      : "outline"
                }
                className="mt-2 print:inline-flex hidden"
              >
                {String(invoiceDetails.paymentStatus)
                  .toLowerCase()
                  .replace("_", " ")}
              </Badge>
            </div>
          </div>

          {/* Invoice To/From */}
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-1">
              <h3 className="font-semibold text-sm uppercase text-muted-foreground">
                Invoice To
              </h3>
              <h4 className="font-bold">
                {invoiceDetails.isGuestOrder
                  ? invoiceDetails.customerName
                  : invoiceDetails.userName}
              </h4>
              <p className="text-sm">
                {invoiceDetails.isGuestOrder
                  ? invoiceDetails.customerEmail
                  : invoiceDetails.userEmail}
              </p>
              <p className="text-sm">
                {invoiceDetails.isGuestOrder
                  ? invoiceDetails.customerPhone
                  : invoiceDetails.userPhone}
              </p>
            </div>

            <div className="space-y-1">
              <h3 className="font-semibold text-sm uppercase text-muted-foreground">
                Invoice From
              </h3>
              <h4 className="font-bold">Homeo South Pharmaceuticals</h4>
              <p className="text-sm">support@homeosouth.com</p>
              <p className="text-sm">Order ID: {invoiceDetails.id}</p>
            </div>
          </div>

          {/* Address Section */}
          <div className="grid grid-cols-1 gap-8 pt-2">
            <div className="space-y-1">
              <h3 className="font-semibold text-sm uppercase text-muted-foreground">
                Delivery Address
              </h3>
              {invoiceDetails.shippingAddress ? (
                <address className="not-italic text-sm">
                  <p>{invoiceDetails.shippingAddress.street}</p>
                  <p>
                    {invoiceDetails.shippingAddress.city},{" "}
                    {invoiceDetails.shippingAddress.state}{" "}
                    {invoiceDetails.shippingAddress.postalCode}
                  </p>
                  <p>{invoiceDetails.shippingAddress.country}</p>
                </address>
              ) : (
                <p className="text-muted-foreground text-sm">
                  No shipping address
                </p>
              )}
            </div>
          </div>

          {/* Products Section */}
          <div className="mt-8">
            <h3 className="font-semibold flex items-center gap-2 mb-3 text-sm uppercase text-muted-foreground">
              <ShoppingCart className="h-4 w-4" />
              Order Summary
            </h3>
            <div className="border rounded-md overflow-hidden">
              <div className="bg-muted px-4 py-2.5 text-sm font-medium grid grid-cols-12">
                <div className="col-span-6">Product</div>
                <div className="col-span-2 text-center">Qty</div>
                <div className="col-span-2 text-right">Unit Price</div>
                <div className="col-span-2 text-right">Total</div>
              </div>
              <div className="divide-y max-h-64 overflow-y-auto print:max-h-none">
                {invoiceDetails.products?.length > 0 ? (
                  invoiceDetails.products.map((product, index) => (
                    <div
                      key={index}
                      className="px-4 py-3 grid grid-cols-12 items-center"
                    >
                      <div className="col-span-6 flex gap-3">
                        <div className="h-12 w-12 overflow-hidden rounded-md relative bg-muted flex-shrink-0">
                          {product.image ? (
                            <Image
                              src={product.image}
                              fill
                              alt={product.name}
                              className="object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center bg-muted">
                              <Package className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
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
                        </div>
                      </div>
                      <div className="col-span-2 text-center">
                        {product.quantity}
                      </div>
                      <div className="col-span-2 text-right">
                        {formatCurrency(product.unitPrice)}
                      </div>
                      <div className="col-span-2 text-right font-medium">
                        {formatCurrency(product.totalPrice)}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <Package className="h-5 w-5 mb-1 mx-auto" />
                    <span className="block">No products found</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Invoice Summary */}
          <div className="flex justify-end mt-6">
            <div className="w-64 space-y-1.5">
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">Subtotal:</span>
                <span>{formatCurrency(invoiceDetails.subtotal)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">Shipping:</span>
                <span>{formatCurrency(invoiceDetails.shippingCost)}</span>
              </div>
              {invoiceDetails.discount > 0 && (
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Discount:</span>
                  <span>-{formatCurrency(invoiceDetails.discount)}</span>
                </div>
              )}
              {invoiceDetails.tax > 0 && (
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Tax:</span>
                  <span>{formatCurrency(invoiceDetails.tax)}</span>
                </div>
              )}
              <Separator className="my-2" />
              <div className="flex justify-between py-1 font-bold">
                <span>Total:</span>
                <span>{formatCurrency(invoiceDetails.totalAmountPaid)}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-4 border-t text-center text-xs text-muted-foreground">
            <p>Thank you for your business!</p>
            <p className="mt-1">
              If you have any questions about this invoice, please contact us at
              support@homeosouth.com
            </p>
          </div>
        </div>

        <DialogFooter className="print:hidden">
          <div className="flex gap-2">
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>

            <DownloadInvoiceButton invoice={invoiceDetails} iconOnly={false} />

            <Button onClick={handleSend} disabled={isSending}>
              {isSending ? (
                <>
                  <span className="animate-spin mr-2">●</span>
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send to Customer
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
