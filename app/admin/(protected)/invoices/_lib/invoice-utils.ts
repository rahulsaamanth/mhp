"use client"

import { InvoiceDetailedInfo } from "./queries"
import { formatCurrency } from "@/lib/formatters"

// Dynamic import for html2pdf to avoid SSR issues
let html2pdf: any = null

// This function will be loaded only on the client side
const loadHtml2Pdf = async () => {
  if (!html2pdf) {
    // Import html2pdf dynamically only in browser environment
    const module = await import("html2pdf.js")
    html2pdf = module.default
  }
  return html2pdf
}

export async function downloadInvoice(invoice: InvoiceDetailedInfo) {
  try {
    // Make sure we're in a browser environment
    if (typeof window === "undefined" || typeof document === "undefined") {
      return {
        success: false,
        message: "PDF generation is only available in the browser",
      }
    }

    // Load html2pdf dynamically
    const html2pdfLib = await loadHtml2Pdf()

    // Get the invoice content element
    const element = document.getElementById("invoice-content")

    if (!element) {
      return {
        success: false,
        message: "Invoice content not found",
      }
    }

    // Create a clone of the element to avoid modifying the original
    const clonedElement = element.cloneNode(true) as HTMLElement

    // Remove print:hidden elements from the clone
    const hiddenElements = clonedElement.querySelectorAll(".print\\:hidden")
    hiddenElements.forEach((el) => el.remove())

    // Fix for Dialog component: make the cloned content visible
    // Create a temporary div to hold our invoice for conversion
    const tempDiv = document.createElement("div")
    tempDiv.style.position = "absolute"
    tempDiv.style.left = "-9999px"
    tempDiv.style.top = "0"
    tempDiv.style.width = "816px" // A4 width in pixels at 96 DPI
    tempDiv.style.opacity = "1"
    tempDiv.style.visibility = "visible"
    tempDiv.style.pointerEvents = "none"
    tempDiv.appendChild(clonedElement)
    document.body.appendChild(tempDiv)

    // Make sure all content within the cloned element is visible
    const hiddenStyles = tempDiv.querySelectorAll(
      '[style*="visibility: hidden"], [style*="display: none"], [aria-hidden="true"]'
    )
    hiddenStyles.forEach((el) => {
      if (el instanceof HTMLElement) {
        el.style.visibility = "visible"
        el.style.display = "block"
        el.removeAttribute("aria-hidden")
      }
    })

    // Configure html2pdf options
    const options = {
      filename: `Invoice_${invoice.invoiceNumber}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        letterRendering: true,
        logging: false,
      },
      jsPDF: {
        unit: "mm",
        format: "a4",
        orientation: "portrait" as "portrait" | "landscape",
      },
      margin: [10, 10, 10, 10],
    }

    // Generate and download the PDF
    try {
      await html2pdfLib().from(tempDiv).set(options).save()

      // Cleanup: remove the temporary div after PDF generation
      document.body.removeChild(tempDiv)

      return {
        success: true,
        message: "Invoice downloaded successfully",
      }
    } catch (pdfError) {
      console.error("PDF generation error:", pdfError)

      // Cleanup: remove the temporary div even if there was an error
      if (document.body.contains(tempDiv)) {
        document.body.removeChild(tempDiv)
      }

      throw pdfError
    }
  } catch (error) {
    console.error("Error generating PDF:", error)
    return {
      success: false,
      message: "Failed to generate PDF",
    }
  }
}

// Placeholder for the future implementation
export async function sendInvoiceToCustomer(invoice: InvoiceDetailedInfo) {
  try {
    // This function will be replaced with your better solution
    console.log(
      "Invoice email functionality will be implemented with a better solution"
    )

    return {
      success: true,
      message: `Invoice email feature will be implemented with your preferred solution`,
    }
  } catch (error) {
    console.error("Error:", error)
    return {
      success: false,
      message: "Failed to send invoice",
    }
  }
}
