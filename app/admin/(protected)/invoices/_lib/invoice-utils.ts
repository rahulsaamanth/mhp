// /home/rahulsaamanth/Code0/mhp/app/admin/(protected)/invoices/_lib/invoice-utils.ts
import { InvoiceDetailedInfo } from "./queries"
import { jsPDF } from "jspdf"
import "jspdf-autotable"
import { formatCurrency } from "@/lib/formatters"

// Function to generate and download a PDF invoice
export async function generateInvoicePDF(
  invoice: InvoiceDetailedInfo
): Promise<Blob> {
  // Create a new PDF document
  const doc = new jsPDF()

  // Set document properties
  doc.setProperties({
    title: `Invoice #${invoice.invoiceNumber}`,
    subject: "Invoice",
    author: "MHP System",
    creator: "MHP System",
  })

  // Add company logo and header
  doc.setFontSize(20)
  doc.text("INVOICE", 105, 20, { align: "center" })

  // Add invoice details
  doc.setFontSize(10)
  doc.text(`Invoice #: ${invoice.invoiceNumber}`, 150, 40, { align: "right" })
  doc.text(
    `Date: ${new Date(invoice.orderDate).toLocaleDateString()}`,
    150,
    45,
    { align: "right" }
  )
  doc.text(`Order ID: ${invoice.id}`, 150, 50, { align: "right" })

  // Add customer information
  doc.setFontSize(12)
  doc.text("Bill To:", 20, 40)
  doc.setFontSize(10)
  doc.text(`${invoice.userName}`, 20, 45)
  doc.text(`${invoice.userEmail}`, 20, 50)
  doc.text(`${invoice.userPhone || ""}`, 20, 55)

  // Add shipping address
  if (invoice.shippingAddress) {
    doc.setFontSize(12)
    doc.text("Shipping Address:", 20, 65)
    doc.setFontSize(10)
    doc.text(`${invoice.shippingAddress.street}`, 20, 70)
    doc.text(
      `${invoice.shippingAddress.city}, ${invoice.shippingAddress.state} ${invoice.shippingAddress.postalCode}`,
      20,
      75
    )
    doc.text(`${invoice.shippingAddress.country}`, 20, 80)
  }

  // Add billing address
  if (invoice.billingAddress) {
    doc.setFontSize(12)
    doc.text("Billing Address:", 110, 65)
    doc.setFontSize(10)
    doc.text(`${invoice.billingAddress.street}`, 110, 70)
    doc.text(
      `${invoice.billingAddress.city}, ${invoice.billingAddress.state} ${invoice.billingAddress.postalCode}`,
      110,
      75
    )
    doc.text(`${invoice.billingAddress.country}`, 110, 80)
  }

  // Add product table
  const tableColumn = ["Product", "Quantity", "Unit Price", "Total"]
  const tableRows = invoice.products.map((product) => [
    `${product.name} - ${product.variantName} (${product.potency})`,
    product.quantity.toString(),
    formatCurrency(product.unitPrice),
    formatCurrency(product.totalPrice),
  ])

  // @ts-ignore - jspdf-autotable types
  doc.autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: 90,
    theme: "grid",
    headStyles: { fillColor: [66, 66, 66] },
  })

  // Get the final Y position after the table
  // @ts-ignore - jspdf-autotable types
  const finalY = doc.lastAutoTable.finalY + 10

  // Add summary
  doc.text("Summary", 130, finalY)
  doc.text("Subtotal:", 130, finalY + 10)
  doc.text(formatCurrency(invoice.subtotal), 175, finalY + 10, {
    align: "right",
  })

  doc.text("Shipping:", 130, finalY + 15)
  doc.text(formatCurrency(invoice.shippingCost), 175, finalY + 15, {
    align: "right",
  })

  if (invoice.discount > 0) {
    doc.text("Discount:", 130, finalY + 20)
    doc.text(`-${formatCurrency(invoice.discount)}`, 175, finalY + 20, {
      align: "right",
    })
  }

  if (invoice.tax > 0) {
    doc.text("Tax:", 130, finalY + 25)
    doc.text(formatCurrency(invoice.tax), 175, finalY + 25, { align: "right" })
  }

  // Add total
  doc.setFontSize(12)
  doc.setFont("helvetica", "bold")
  doc.text("Total:", 130, finalY + 35)
  doc.text(formatCurrency(invoice.totalAmountPaid), 175, finalY + 35, {
    align: "right",
  })

  // Add footer
  doc.setFontSize(8)
  doc.setFont("helvetica", "normal")
  doc.text("Thank you for your business!", 105, 280, { align: "center" })

  // Return the PDF as a blob
  return doc.output("blob")
}

// Function to download the invoice
export async function downloadInvoice(invoice: InvoiceDetailedInfo) {
  try {
    const pdfBlob = await generateInvoicePDF(invoice)

    // Create a download link
    const url = URL.createObjectURL(pdfBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `Invoice_${invoice.invoiceNumber}.pdf`

    // Trigger download
    document.body.appendChild(link)
    link.click()

    // Clean up
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    return true
  } catch (error) {
    console.error("Error downloading invoice:", error)
    return false
  }
}

// Function to send the invoice to the customer
export async function sendInvoiceToCustomer(invoice: InvoiceDetailedInfo) {
  try {
    // In a real implementation, you would call an API endpoint to send the email
    // For now, we'll just simulate a successful response

    // Example API call:
    // const response = await fetch('/api/invoices/send', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     invoiceId: invoice.id,
    //     email: invoice.userEmail,
    //   }),
    // })

    // if (!response.ok) {
    //   throw new Error('Failed to send invoice')
    // }

    // return await response.json()

    // Simulate a successful response
    return {
      success: true,
      message: `Invoice #${invoice.invoiceNumber} sent to ${invoice.userEmail}`,
    }
  } catch (error) {
    console.error("Error sending invoice:", error)
    return {
      success: false,
      message: "Failed to send invoice",
    }
  }
}
