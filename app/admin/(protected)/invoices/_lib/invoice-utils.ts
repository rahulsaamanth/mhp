"use client"

import { InvoiceDetailedInfo } from "./queries"
import { saveAs } from "file-saver"
import { pdf } from "@react-pdf/renderer"
import React from "react"

export async function downloadInvoice(invoice: InvoiceDetailedInfo) {
  try {
    // Dynamically load the components to avoid SSR issues with react-pdf
    const ReactPDF = require("@react-pdf/renderer")
    const React = require("react")
    const PDFDocument = require("../_components/InvoicePDF").default

    // Ensure document is created in the browser context
    const blob = await ReactPDF.pdf(
      React.createElement(PDFDocument, { invoice })
    ).toBlob()

    // Use file-saver to download the PDF
    saveAs(blob, `Invoice_${invoice.invoiceNumber || "download"}.pdf`)

    return {
      success: true,
      message: "Invoice downloaded successfully",
    }
  } catch (error) {
    console.error("Error generating PDF:", error)
    return {
      success: false,
      message: `Failed to generate PDF: ${error instanceof Error ? error.message : String(error)}`,
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
