import React from "react"
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Image,
  Svg,
  Path,
  G,
} from "@react-pdf/renderer"
import { InvoiceDetailedInfo } from "../_lib/queries"

// Register standard fonts
Font.register({
  family: "Helvetica",
  fonts: [{ src: "Helvetica" }, { src: "Helvetica-Bold", fontWeight: "bold" }],
})

// Create styles with improved design to match invoice-details-modal
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    padding: 30,
    fontFamily: "Helvetica",
    fontSize: 10,
  },
  // Header section with logo
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingBottom: 15,
    marginBottom: 20,
  },
  logoContainer: {
    width: 120,
    height: 60,
  },
  logo: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
  },
  invoiceHeaderRight: {
    flexDirection: "column",
    alignItems: "flex-end",
  },
  invoiceTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  invoiceNumber: {
    fontSize: 10,
    color: "#6b7280",
    marginBottom: 5,
  },
  invoiceDate: {
    fontSize: 10,
    marginBottom: 4,
  },
  statusBadge: {
    fontSize: 9,
    padding: 4,
    borderRadius: 4,
    backgroundColor: "#f3f4f6",
    color: "#374151",
    marginTop: 5,
    textTransform: "uppercase",
  },
  statusBadgePaid: {
    backgroundColor: "#dcfce7",
    color: "#14532d",
  },
  statusBadgeFailed: {
    backgroundColor: "#fee2e2",
    color: "#7f1d1d",
  },

  // Invoice To/From section
  addressGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  addressColumn: {
    width: "48%",
  },
  addressTitle: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#6b7280",
    textTransform: "uppercase",
    marginBottom: 8,
  },
  companyName: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 4,
  },
  addressText: {
    fontSize: 10,
    marginBottom: 2,
    color: "#374151",
  },

  // Product table
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 10,
    fontWeight: "bold",
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  tableHeaderProduct: {
    flex: 6,
  },
  tableHeaderQty: {
    flex: 2,
    textAlign: "center",
  },
  tableHeaderPrice: {
    flex: 2,
    textAlign: "right",
  },
  tableHeaderTotal: {
    flex: 2,
    textAlign: "right",
  },

  // Product items
  productRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingHorizontal: 10,
    paddingVertical: 8,
    alignItems: "center",
  },
  productCell: {
    flex: 6,
  },
  productName: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 2,
  },
  productVariant: {
    fontSize: 8,
    color: "#6b7280",
  },
  qtyCell: {
    flex: 2,
    textAlign: "center",
  },
  priceCell: {
    flex: 2,
    textAlign: "right",
  },
  totalCell: {
    flex: 2,
    textAlign: "right",
    fontWeight: "bold",
  },

  // Product table container
  productContainer: {
    marginVertical: 20,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 4,
  },
  productTableTitle: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#6b7280",
    textTransform: "uppercase",
    marginBottom: 8,
  },

  // Summary section
  summaryContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 20,
  },
  summaryTable: {
    width: "33%",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  summaryLabel: {
    fontSize: 10,
    color: "#6b7280",
  },
  summaryValue: {
    fontSize: 10,
    textAlign: "right",
  },
  summarySeparator: {
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    marginVertical: 6,
  },
  summaryTotalLabel: {
    fontSize: 12,
    fontWeight: "bold",
  },
  summaryTotalValue: {
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "right",
  },

  // Footer
  footer: {
    marginTop: 40,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    textAlign: "center",
  },
  footerText: {
    fontSize: 9,
    color: "#6b7280",
    marginBottom: 4,
  },

  // No product state
  noProductContainer: {
    padding: 20,
    alignItems: "center",
  },
  noProductText: {
    fontSize: 10,
    color: "#6b7280",
  },
})

// Helper functions
const safeString = (value: any): string => {
  if (value === undefined || value === null) return ""
  return String(value)
}

const formatDate = (dateString?: string | Date) => {
  if (!dateString) return ""
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

const formatCurrency = (amount?: number) => {
  if (amount === undefined || amount === null) return "₹0.00"
  return `₹${amount.toFixed(2)}`
}

// Get status badge style
const getStatusBadgeStyle = (status: string) => {
  const statusLower = status.toLowerCase()
  if (statusLower === "paid") {
    return { ...styles.statusBadge, ...styles.statusBadgePaid }
  } else if (statusLower === "failed") {
    return { ...styles.statusBadge, ...styles.statusBadgeFailed }
  }
  return styles.statusBadge
}

// Company Logo SVG Component
const CompanyLogo = () => (
  <Svg width="120" height="60" viewBox="0 0 240 120">
    {/* Simple "MH" logo with a pill shape */}
    <G>
      {/* Background pill */}
      <Path
        d="M40,20 L200,20 C220,20 220,100 200,100 L40,100 C20,100 20,20 40,20 Z"
        fill="#0284c7"
      />
      {/* "M" letter */}
      <Path
        d="M60,35 L80,35 L90,65 L100,35 L120,35 L120,85 L105,85 L105,55 L95,85 L85,85 L75,55 L75,85 L60,85 Z"
        fill="#ffffff"
      />
      {/* "H" letter */}
      <Path
        d="M130,35 L145,35 L145,55 L175,55 L175,35 L190,35 L190,85 L175,85 L175,65 L145,65 L145,85 L130,85 Z"
        fill="#ffffff"
      />
    </G>
  </Svg>
)

// Define the PDF Document
const InvoicePDF = ({ invoice }: { invoice: InvoiceDetailedInfo }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header with Logo */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          {/* Replace the text-based logo with the SVG logo */}
          <CompanyLogo />
          <Text style={{ fontSize: 10, color: "#666", marginTop: 4 }}>
            Pharmaceuticals
          </Text>
        </View>
        <View style={styles.invoiceHeaderRight}>
          <Text style={styles.invoiceTitle}>INVOICE</Text>
          <Text style={styles.invoiceNumber}>#{invoice.invoiceNumber}</Text>
          <Text style={styles.invoiceDate}>
            Date:{" "}
            {formatDate(
              invoice.date
                ? String(invoice.date)
                : invoice.orderDate
                  ? String(invoice.orderDate)
                  : undefined
            )}
          </Text>
          <Text style={getStatusBadgeStyle(safeString(invoice.paymentStatus))}>
            {safeString(invoice.paymentStatus).toLowerCase().replace("_", " ")}
          </Text>
        </View>
      </View>

      {/* Invoice To/From Section */}
      <View style={styles.addressGrid}>
        <View style={styles.addressColumn}>
          <Text style={styles.addressTitle}>Invoice To</Text>
          <Text style={styles.companyName}>
            {invoice.isGuestOrder
              ? safeString(invoice.customerName)
              : safeString(invoice.userName)}
          </Text>
          <Text style={styles.addressText}>
            {invoice.isGuestOrder
              ? safeString(invoice.customerEmail)
              : safeString(invoice.userEmail)}
          </Text>
          <Text style={styles.addressText}>
            {invoice.isGuestOrder
              ? safeString(invoice.customerPhone)
              : safeString(invoice.userPhone)}
          </Text>
        </View>

        <View style={styles.addressColumn}>
          <Text style={styles.addressTitle}>Invoice From</Text>
          <Text style={styles.companyName}>MH Pharmaceuticals</Text>
          <Text style={styles.addressText}>support@mhpharmaceuticals.com</Text>
          <Text style={styles.addressText}>
            Order ID: {safeString(invoice.id)}
          </Text>
        </View>
      </View>

      {/* Shipping & Billing Address */}
      <View style={styles.addressGrid}>
        <View style={styles.addressColumn}>
          <Text style={styles.addressTitle}>Shipping Address</Text>
          {invoice.shippingAddress ? (
            <>
              <Text style={styles.addressText}>
                {safeString(invoice.shippingAddress.street)}
              </Text>
              <Text style={styles.addressText}>
                {safeString(invoice.shippingAddress.city)},{" "}
                {safeString(invoice.shippingAddress.state)}{" "}
                {safeString(invoice.shippingAddress.postalCode)}
              </Text>
              <Text style={styles.addressText}>
                {safeString(invoice.shippingAddress.country)}
              </Text>
            </>
          ) : (
            <Text style={styles.addressText}>No shipping address provided</Text>
          )}
        </View>

        <View style={styles.addressColumn}>
          <Text style={styles.addressTitle}>Billing Address</Text>
          {invoice.billingAddress ? (
            <>
              <Text style={styles.addressText}>
                {safeString(invoice.billingAddress.street)}
              </Text>
              <Text style={styles.addressText}>
                {safeString(invoice.billingAddress.city)},{" "}
                {safeString(invoice.billingAddress.state)}{" "}
                {safeString(invoice.billingAddress.postalCode)}
              </Text>
              <Text style={styles.addressText}>
                {safeString(invoice.billingAddress.country)}
              </Text>
            </>
          ) : (
            <Text style={styles.addressText}>No billing address provided</Text>
          )}
        </View>
      </View>

      {/* Products Table */}
      <Text style={styles.productTableTitle}>Order Summary</Text>
      <View style={styles.productContainer}>
        {/* Table Header */}
        <View style={styles.tableHeader}>
          <Text style={styles.tableHeaderProduct}>Product</Text>
          <Text style={styles.tableHeaderQty}>Qty</Text>
          <Text style={styles.tableHeaderPrice}>Unit Price</Text>
          <Text style={styles.tableHeaderTotal}>Total</Text>
        </View>

        {/* Table Rows */}
        {invoice.products && invoice.products.length > 0 ? (
          invoice.products.map((product, index) => (
            <View key={`product-${index}`} style={styles.productRow}>
              <View style={styles.productCell}>
                <Text style={styles.productName}>
                  {safeString(product.name)}
                </Text>
                <Text style={styles.productVariant}>
                  {safeString(product.variantName)}
                  {safeString(product.potency) !== "NONE"
                    ? ` - ${safeString(product.potency)}`
                    : ""}
                  {product.packSize ? ` - ${safeString(product.packSize)}` : ""}
                </Text>
              </View>
              <Text style={styles.qtyCell}>{product.quantity}</Text>
              <Text style={styles.priceCell}>
                {formatCurrency(product.unitPrice)}
              </Text>
              <Text style={styles.totalCell}>
                {formatCurrency(
                  product.totalPrice || product.quantity * product.unitPrice
                )}
              </Text>
            </View>
          ))
        ) : (
          <View style={styles.noProductContainer}>
            <Text style={styles.noProductText}>No products found</Text>
          </View>
        )}
      </View>

      {/* Price Summary */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryTable}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal:</Text>
            <Text style={styles.summaryValue}>
              {formatCurrency(invoice.subtotal || 0)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Shipping:</Text>
            <Text style={styles.summaryValue}>
              {formatCurrency(invoice.shippingCost || 0)}
            </Text>
          </View>
          {invoice.discount > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Discount:</Text>
              <Text style={styles.summaryValue}>
                -{formatCurrency(invoice.discount)}
              </Text>
            </View>
          )}
          {invoice.tax > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tax:</Text>
              <Text style={styles.summaryValue}>
                {formatCurrency(invoice.tax)}
              </Text>
            </View>
          )}
          <View style={styles.summarySeparator} />
          <View style={styles.summaryRow}>
            <Text style={styles.summaryTotalLabel}>Total:</Text>
            <Text style={styles.summaryTotalValue}>
              {formatCurrency(invoice.totalAmountPaid || invoice.total || 0)}
            </Text>
          </View>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Thank you for your business!</Text>
        <Text style={styles.footerText}>
          If you have any questions about this invoice, please contact us at
          support@mhpharmaceuticals.com
        </Text>
      </View>
    </Page>
  </Document>
)

export default InvoicePDF
