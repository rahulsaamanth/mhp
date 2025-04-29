"use client"

import { useState } from "react"
import { Button, ButtonProps } from "@/components/ui/button"
import { Download } from "lucide-react"
import { downloadInvoice } from "../_lib/invoice-utils"
import { toast } from "sonner"
import { InvoiceDetailedInfo } from "../_lib/queries"
import { Loader } from "lucide-react"

interface DownloadInvoiceButtonProps extends ButtonProps {
  invoice: InvoiceDetailedInfo
  iconOnly?: boolean
}

export function DownloadInvoiceButton({
  invoice,
  iconOnly = false,
  className,
  variant = "outline",
  size = "sm",
  ...props
}: DownloadInvoiceButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownload = async () => {
    try {
      setIsDownloading(true)
      const result = await downloadInvoice(invoice)

      if (result.success) {
        toast.success(result.message || "Invoice downloaded successfully")
      } else {
        toast.error(result.message || "Failed to download invoice")
        console.error("Download error:", result.message)
      }
    } catch (error) {
      console.error("Error downloading invoice:", error)
      toast.error("An unexpected error occurred while downloading the invoice")
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <Button
      onClick={handleDownload}
      variant={variant}
      size={size}
      disabled={isDownloading}
      className={className}
      {...props}
    >
      {isDownloading ? (
        <Loader className="h-4 w-4 animate-spin" />
      ) : (
        <Download className="h-4 w-4" />
      )}
      {!iconOnly && (
        <span className="ml-2">
          {isDownloading ? "Downloading..." : "Download"}
        </span>
      )}
    </Button>
  )
}
