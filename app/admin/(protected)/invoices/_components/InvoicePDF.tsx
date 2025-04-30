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
  Defs,
  LinearGradient,
  Stop,
  Circle,
  Rect,
} from "@react-pdf/renderer"
import { InvoiceDetailedInfo } from "../_lib/queries"
import { Filter } from "lucide-react"

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
  if (amount === undefined || amount === null) return "Rs. 0.00"
  return `Rs. ${amount.toFixed(2)}`
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

// Company Logo SVG Component with the detailed SVG - Refined for React-PDF
// Removed bottle shape, tagline, leaf, and divider line
const CompanyLogo = () => (
  <Svg width="300" height="61" viewBox="0 0 300 61">
    <G
      transform="translate(0.000000,61.000000) scale(0.100000,-0.100000)"
      fill="#000000"
    >
      {/* Green MH section */}
      <Path
        d="M2291 511 c-22 -14 -11 -183 13 -210 31 -34 79 -45 119 -26 45 21 57
51 57 143 0 78 -10 105 -36 95 -10 -4 -14 -27 -14 -88 0 -88 -12 -115 -50
-115 -38 0 -50 27 -50 109 0 80 -12 108 -39 92z"
        fill="#5cb800"
      />

      {/* HERBAL Text */}
      <Path
        d="M550 391 c0 -90 3 -120 13 -124 29 -11 40 9 33 57 l-7 46 55 0 56 0
0 -45 c0 -34 5 -47 20 -55 28 -15 31 -3 28 126 -3 101 -4 109 -23 109 -17 0
-20 -8 -23 -47 l-3 -48 -55 0 -55 0 7 35 c7 37 -7 65 -32 65 -11 0 -14 -25
-14 -119z"
      />
      {/* Letter E */}
      <Path
        d="M839 495 c-56 -30 -73 -119 -34 -178 60 -92 200 -55 212 56 12 102
-88 171 -178 122z m106 -50 c32 -31 33 -80 3 -112 -21 -22 -62 -30 -84 -15
-18 11 -34 49 -34 77 0 31 41 75 70 75 12 0 32 -11 45 -25z"
      />
      {/* Letter R */}
      <Path
        d="M1059 508 c-1 -2 -3 -54 -4 -116 -2 -101 0 -114 17 -123 26 -14 32 7
26 92 -3 38 -4 69 -3 69 2 0 17 -22 34 -50 17 -27 36 -50 43 -50 7 0 25 21 40
48 l27 47 1 -72 c0 -62 3 -74 20 -83 28 -15 31 -3 28 126 -3 93 -5 109 -20
112 -12 2 -29 -16 -55 -57 -21 -34 -40 -61 -43 -61 -3 1 -22 28 -42 60 -21 33
-44 60 -53 60 -8 0 -16 -1 -16 -2z"
      />
      {/* Letter B */}
      <Path
        d="M1340 500 c-1 -5 -1 -55 -1 -110 0 -55 0 -104 1 -110 0 -6 34 -10 81
-10 71 0 80 2 77 18 -2 13 -15 18 -61 20 -56 3 -57 4 -57 32 0 29 1 30 48 30
27 0 52 3 55 7 15 14 -18 33 -59 33 -42 0 -44 1 -44 30 l0 30 61 0 c52 0 60 2
57 18 -3 14 -16 17 -81 20 -48 2 -77 -1 -77 -8z"
      />
      <Path
        d="M1572 494 c-81 -57 -62 -190 33 -223 80 -27 150 30 150 122 0 43 -4
52 -37 83 -31 28 -46 34 -81 34 -23 0 -53 -7 -65 -16z m113 -49 c47 -46 17
-135 -46 -135 -63 0 -91 79 -48 134 26 33 62 34 94 1z"
      />

      {/* Green sections - SOLUTIONS */}
      <Path
        d="M1832 494 c-32 -22 -30 -76 4 -103 15 -12 36 -21 48 -21 32 0 61 -24
53 -44 -8 -19 -54 -21 -92 -4 -20 9 -28 9 -38 -1 -9 -10 -7 -16 11 -31 73 -60
188 -16 168 63 -7 28 -50 57 -85 57 -11 0 -27 7 -36 16 -33 33 28 59 76 33 25
-13 51 -5 43 14 -13 36 -112 50 -152 21z"
        fill="#5cb800"
      />
      <Path
        d="M2062 494 c-52 -36 -67 -115 -32 -172 42 -69 130 -79 186 -21 25 26
29 38 29 85 0 51 -3 58 -37 90 -31 28 -46 34 -81 34 -23 0 -53 -7 -65 -16z
m109 -43 c18 -14 24 -29 24 -59 0 -52 -26 -82 -72 -82 -28 0 -36 5 -50 34 -21
44 -8 95 27 113 34 17 44 16 71 -6z"
        fill="#5cb800"
      />
      <Path
        d="M2510 491 c0 -22 19 -32 49 -24 20 5 21 2 21 -90 0 -84 2 -98 19
-106 35 -19 45 9 38 110 l-6 90 37 -3 c31 -3 37 0 37 17 0 18 -8 20 -97 23
-91 3 -98 1 -98 -17z"
        fill="#5cb800"
      />
      <Path
        d="M2740 396 c0 -87 3 -116 15 -126 23 -19 35 -2 35 49 l0 47 50 1 50 1
0 -43 c0 -45 22 -77 41 -58 6 6 8 58 7 124 -3 106 -4 114 -23 114 -17 0 -20
-8 -23 -47 l-3 -48 -50 0 -49 0 0 34 c0 47 -9 66 -31 66 -18 0 -19 -9 -19
-114z"
        fill="#5cb800"
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
          {/* Using the new SVG logo */}
          <CompanyLogo />
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
          <Text style={styles.companyName}>Homeo South Pharmacy</Text>
          <Text style={styles.addressText}>support@homeosouth.com</Text>
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
          support@homeosouth.com
        </Text>
      </View>
    </Page>
  </Document>
)

export default InvoicePDF
