import {
  pgTable,
  varchar,
  timestamp,
  text,
  uniqueIndex,
  boolean,
  foreignKey,
  doublePrecision,
  jsonb,
  index,
  pgEnum,
  integer,
} from "drizzle-orm/pg-core"

const ENTITY_PREFIX = {
  USER: "USR",
  PRODUCT: "PRD",
  ORDER: "ORD",
  CATEGORY: "CAT",
  MANUFACTURER: "MFR",
  REVIEW: "REV",
  ACCOUNT: "ACC",
  VERIFICATION: "VRF",
  PASSWORD_RESET: "PWD",
  TWO_FACTOR: "2FA",
  ORDER_DETAILS: "ODT",
  ADDRESS: "ADDR",
  PAYMENT: "PYMT",
  INVENTORY: "INV",
} as const

export const customId = (name: string, prefix: string) =>
  varchar(name, { length: 32 })
    .notNull()
    .primaryKey()
    .unique()
    .$defaultFn(() => {
      const timestamp = Date.now().toString(36)
      const random = Math.random().toString(36).substring(2, 6)
      const sequence = Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, "0")
      return `${prefix}_${timestamp}${random}${sequence}`
    })

export const orderType = pgEnum("OrderType", ["OFFLINE", "ONLINE"])

export const userRole = pgEnum("UserRole", ["ADMIN", "USER"])

export const movementType = pgEnum("MovementType", ["IN", "OUT", "ADJUSTMENT"])

export const deliveryStatus = pgEnum("DeliveryStatus", [
  "PROCESSING",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
  "RETURNED",
])

export const paymentType = pgEnum("PaymentType", [
  "CREDIT_CARD",
  "DEBIT_CARD",
  "UPI",
  "NET_BANKING",
  "WALLET",
])

export const addressType = pgEnum("AddressType", ["SHIPPING", "BILLING"])

export const productStatus = pgEnum("ProductStatus", [
  "ACTIVE",
  "DRAFT",
  "ARCHIVED",
])

export const skuLocation = pgEnum("SKULocation", [
  "MANGALORE-01",
  "MANGALORE-02",
  "KERALA-01",
])

export const productForm = pgEnum("ProductForm", [
  "NONE",
  "DILUTIONS(P)",
  "MOTHER_TINCTURES(Q)",
  "TRITURATIONS",
  "TABLETS",
  "GLOBULES",
  "BIO_CHEMIC",
  "BIO_COMBINATION",
  "OINTMENT",
  "GEL",
  "CREAM",
  "SYRUP/TONIC",
  "DROPS",
  "EYE_DROPS",
  "EAR_DROPS",
  "NASAL_DROPS",
  "INJECTIONS",
])

export const paymentStatus = pgEnum("PaymentStatus", [
  "PENDING",
  "AUTHORIZED",
  "PAID",
  "FAILED",
  "REFUNDED",
])

export const unitOfMeasure = pgEnum("UnitOfMeasure", [
  "NONE",
  "TABLETS",
  "ML",
  "GM(s)",
  "DROPS",
  "AMPOULES",
])

export const potency = pgEnum("potency", [
  "NONE",
  "1X",
  "2X",
  "3X",
  "6X",
  "12X",
  "30X",
  "200X",
  "3C",
  "6C",
  "12C",
  "30C",
  "200C",
  "1M",
  "10M",
  "50M",
  "CM",
  "3CH",
  "6CH",
  "9CH",
  "12CH",
  "15CH",
  "30CH",
  "200CH",
  "1M CH",
  "10M CH",
  "50M CH",
  "CM CH",
  "Q",
  "LM1",
  "LM2",
  "LM3",
  "LM4",
  "LM5",
  "LM6",
  "LM7",
  "LM8",
  "LM9",
  "LM10",
  "LM11",
  "LM12",
  "LM13",
  "LM14",
  "LM15",
  "LM16",
  "LM17",
  "LM18",
  "LM19",
  "LM20",
  "LM21",
  "LM22",
  "LM23",
  "LM24",
  "LM25",
  "LM26",
  "LM27",
  "LM28",
  "LM29",
  "LM30",
  "LM50",
])

export const discountType = pgEnum("discountType", ["PERCENTAGE", "FIXED"])

export type UserRole = (typeof userRole.enumValues)[number]

export type User = typeof user.$inferSelect
export type Order = typeof order.$inferSelect
export type Product = typeof product.$inferSelect

export type Category = typeof category.$inferSelect
export type Variant = typeof productVariant.$inferSelect
export type Manufacturer = typeof manufacturer.$inferSelect
export type Tag = typeof tag.$inferSelect

export type StockByLocation = {
  location: (typeof skuLocation.enumValues)[number]
  stock: number
}

export const verificationToken = pgTable(
  "VerificationToken",
  {
    id: customId("id", ENTITY_PREFIX.VERIFICATION),
    email: text("email").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { precision: 3, mode: "date" }).notNull(),
  },
  (table) => {
    return {
      emailTokenKey: uniqueIndex("VerificationToken_email_token_key").using(
        "btree",
        table.email.asc().nullsLast(),
        table.token.asc().nullsLast()
      ),
      tokenKey: uniqueIndex("VerificationToken_token_key").using(
        "btree",
        table.token.asc().nullsLast()
      ),
    }
  }
)

export const passwordResetToken = pgTable(
  "PasswordResetToken",
  {
    id: customId("id", ENTITY_PREFIX.PASSWORD_RESET),
    email: text("email").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { precision: 3, mode: "date" }).notNull(),
  },
  (table) => {
    return {
      emailTokenKey: uniqueIndex("PasswordResetToken_email_token_key").using(
        "btree",
        table.email.asc().nullsLast(),
        table.token.asc().nullsLast()
      ),
      tokenKey: uniqueIndex("PasswordResetToken_token_key").using(
        "btree",
        table.token.asc().nullsLast()
      ),
    }
  }
)

export const twoFactorToken = pgTable(
  "TwoFactorToken",
  {
    id: customId("id", ENTITY_PREFIX.TWO_FACTOR),
    email: text("email").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { precision: 3, mode: "date" }).notNull(),
  },
  (table) => {
    return {
      emailTokenKey: uniqueIndex("TwoFactorToken_email_token_key").using(
        "btree",
        table.email.asc().nullsLast(),
        table.token.asc().nullsLast()
      ),
      tokenKey: uniqueIndex("TwoFactorToken_token_key").using(
        "btree",
        table.token.asc().nullsLast()
      ),
    }
  }
)

export const user = pgTable(
  "User",
  {
    id: customId("id", ENTITY_PREFIX.USER),
    name: text("name"),
    email: text("email"),
    emailVerified: timestamp("emailVerified", { precision: 3, mode: "date" }),
    image: text("image"),
    password: text("password"),
    role: userRole("role").default("USER").notNull(),
    lastActive: timestamp("lastActive", { precision: 3, mode: "date" })
      .defaultNow()
      .notNull(),
    isTwoFactorEnabled: boolean("isTwoFactorEnabled").default(false).notNull(),
    phone: text("phone"),
    createdAt: timestamp("createdAt", { precision: 3, mode: "date" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updatedAt", { precision: 3, mode: "date" })
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => {
    return {
      emailKey: uniqueIndex("User_email_key").using(
        "btree",
        table.email.asc().nullsLast()
      ),
    }
  }
)

export const account = pgTable(
  "Account",
  {
    id: customId("id", ENTITY_PREFIX.ACCOUNT),
    userId: varchar("userId", { length: 32 }).notNull(),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refreshToken: text("refresh_token"),
    accessToken: text("access_token"),
    expiresAt: varchar("expires_at", { length: 32 }),
    tokenType: text("token_type"),
    scope: text("scope"),
    idToken: text("id_token"),
    sessionState: text("session_state"),
  },
  (table) => {
    return {
      providerProviderAccountIdKey: uniqueIndex(
        "Account_provider_providerAccountId_key"
      ).using(
        "btree",
        table.provider.asc().nullsLast(),
        table.providerAccountId.asc().nullsLast()
      ),
      accountUserIdFkey: foreignKey({
        columns: [table.userId],
        foreignColumns: [user.id],
        name: "Account_userId_fkey",
      })
        .onUpdate("cascade")
        .onDelete("cascade"),
    }
  }
)

export const twoFactorConfirmation = pgTable(
  "TwoFactorConfirmation",
  {
    id: customId("id", ENTITY_PREFIX.TWO_FACTOR),
    userId: varchar("userId", { length: 32 }).notNull(),
  },
  (table) => {
    return {
      userIdKey: uniqueIndex("TwoFactorConfirmation_userId_key").using(
        "btree",
        table.userId.asc().nullsLast()
      ),
      twoFactorConfirmationUserIdFkey: foreignKey({
        columns: [table.userId],
        foreignColumns: [user.id],
        name: "TwoFactorConfirmation_userId_fkey",
      })
        .onUpdate("cascade")
        .onDelete("cascade"),
    }
  }
)

export const category = pgTable(
  "Category",
  {
    id: customId("id", ENTITY_PREFIX.CATEGORY),
    name: text("name").notNull(),
    parentId: varchar("parentId", { length: 32 }),
  },
  (table) => {
    return {
      categoryParentIdFkey: foreignKey({
        columns: [table.parentId],
        foreignColumns: [table.id],
        name: "Category_parentId_fkey",
      })
        .onUpdate("cascade")
        .onDelete("set null"),
    }
  }
)

export const manufacturer = pgTable("Manufacturer", {
  id: customId("id", ENTITY_PREFIX.MANUFACTURER),
  name: text("name").notNull(),
})

export const product = pgTable(
  "Product",
  {
    id: customId("id", ENTITY_PREFIX.PRODUCT),
    name: text("name").notNull(),
    description: text("description").notNull(),
    form: productForm("form").notNull(),
    unit: unitOfMeasure("unit").notNull(),
    status: productStatus("status").default("ACTIVE").notNull(),
    tags: text("tags").array(),
    categoryId: varchar("categoryId", { length: 32 }).notNull(),
    manufacturerId: varchar("manufacturerId", { length: 32 }).notNull(),

    hsnCode: varchar("hsnCode", { length: 8 }).default("30049014"),
    tax: integer("tax").default(0).notNull(),

    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt")
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => {
    return {
      productCategoryIdFkey: foreignKey({
        columns: [table.categoryId],
        foreignColumns: [category.id],
        name: "Product_categoryId_fkey",
      })
        .onUpdate("cascade")
        .onDelete("restrict"),
      productManufacturerIdFkey: foreignKey({
        columns: [table.manufacturerId],
        foreignColumns: [manufacturer.id],
        name: "Product_manufacturerId_fkey",
      })
        .onUpdate("cascade")
        .onDelete("restrict"),
      productNameIndex: index("product_name_idx").on(table.name),
      productStatusIndex: index("product_status_idx").on(table.status),
      productCategoryIndex: index("product_category_idx").on(table.categoryId),
      productCreatedAtIndex: index("product_created_at_idx").on(
        table.createdAt
      ),
      productFormUnitIndex: index("product_form_unit_idx").on(
        table.unit,
        table.form
      ),
    }
  }
)

export const productVariant = pgTable(
  "ProductVariant",
  {
    id: customId("id", ENTITY_PREFIX.PRODUCT + "VAR"),
    productId: varchar("productId", { length: 32 }).notNull(),
    sku: varchar("sku", { length: 50 }).notNull().unique(),
    variantName: text("variantName").notNull(),
    variantImage: text("variantImage").array().notNull(),
    potency: potency("potency").default("NONE").notNull(),
    packSize: integer("packSize"),
    stockByLocation: jsonb("stockByLocation")
      .$type<StockByLocation[]>()
      .notNull()
      .default([]),
    costPrice: doublePrecision("costPrice"),
    mrp: doublePrecision("mrp").notNull(),

    discount: integer("discount").default(0),
    discountType: discountType("discountType").default("PERCENTAGE"),

    sellingPrice: doublePrecision("sellingPrice").notNull(),
  },
  (table) => {
    return {
      productVariantProductIdFkey: foreignKey({
        columns: [table.productId],
        foreignColumns: [product.id],
        name: "ProductVariant_productId_fkey",
      })
        .onDelete("cascade")
        .onUpdate("cascade"),
      variantSkuIdx: index("idx_variant_sku").on(table.sku),
      variantCostPriceIdx: index("idx_variant_costPrice").on(table.costPrice),
      variantSellingPriceIdx: index("idx_variant_sellingPrice").on(
        table.sellingPrice
      ),
      variantStockLocationIdx: index("idx_variant_stock_location").on(
        table.stockByLocation
      ),

      variantSearchIdx: index("idx_variant_search").on(
        table.productId,
        table.potency,
        table.packSize
      ),
    }
  }
)

export const paymentMethod = pgTable(
  "PaymentMethod",
  {
    id: customId("id", ENTITY_PREFIX.PAYMENT),
    userId: varchar("userId", { length: 32 }).notNull(),
    paymentType: paymentType("paymentType").notNull(),
    isDefault: boolean("isDefault").default(false).notNull(),
    paymentDetails: jsonb("paymentDetails").notNull(),
    displayDetails: jsonb("displayDetails").notNull(),
    createdAt: timestamp("createdAt", { precision: 3, mode: "date" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updatedAt", { precision: 3, mode: "date" })
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => {
    return {
      paymentMethodUserIdFkey: foreignKey({
        columns: [table.userId],
        foreignColumns: [user.id],
        name: "PaymentMethod_userId_fkey",
      })
        .onDelete("cascade")
        .onUpdate("cascade"),
      userPaymentMethodIndex: index("PaymentMethod_userId_index").on(
        table.userId
      ),
    }
  }
)

export const order = pgTable(
  "Order",
  {
    id: customId("id", ENTITY_PREFIX.ORDER),
    userId: varchar("userId", { length: 32 }).notNull(),
    orderDate: timestamp("orderDate", {
      precision: 3,
      mode: "date",
    })
      .defaultNow()
      .notNull(),

    subtotal: doublePrecision("subtotal").notNull(),
    shippingCost: doublePrecision("shippingCost").default(0).notNull(),
    discount: doublePrecision("discount").default(0).notNull(),
    tax: doublePrecision("tax").default(0).notNull(),
    totalAmountPaid: doublePrecision("totalAmountPaid").notNull(),

    orderType: orderType("orderType").default("ONLINE").notNull(),
    deliveryStatus: deliveryStatus("deliveryStatus")
      .default("PROCESSING")
      .notNull(),
    shippingAddressId: varchar("shippingAddressId", { length: 32 }).notNull(),
    billingAddressId: varchar("billingAddressId", { length: 32 }).notNull(),

    paymentStatus: paymentStatus("paymentStatus").default("PENDING").notNull(),
    paymentIntentId: varchar("paymentIntentId", { length: 100 }),
    invoiceNumber: varchar("invoiceNumber", { length: 50 }),

    customerNotes: text("customerNotes"),
    adminNotes: text("adminNotes"),
    cancellationReason: text("cancellationReason"),

    estimatedDeliveryDate: timestamp("estimatedDeliveryDate", { mode: "date" }),
    deliveredAt: timestamp("deliveredAt", { mode: "date" }),
    // payment method is mandatory, but not required for now.
    paymentMethodId: varchar("paymentMethodId", { length: 32 }),
  },
  (table) => {
    return {
      orderUserIdFkey: foreignKey({
        columns: [table.userId],
        foreignColumns: [user.id],
        name: "Order_userId_fkey",
      })
        .onUpdate("cascade")
        .onDelete("cascade"),
      orderShippingAddressFkey: foreignKey({
        columns: [table.shippingAddressId],
        foreignColumns: [address.id],
        name: "Order_shippingAddress_fkey",
      })
        .onUpdate("cascade")
        .onDelete("restrict"),
      orderBillingAddressFkey: foreignKey({
        columns: [table.billingAddressId],
        foreignColumns: [address.id],
        name: "Order_billingAddress_fkey",
      })
        .onUpdate("cascade")
        .onDelete("restrict"),
      orderPaymentMethodFkey: foreignKey({
        columns: [table.paymentMethodId],
        foreignColumns: [paymentMethod.id],
        name: "Order_paymentMethod_fkey",
      })
        .onUpdate("cascade")
        .onDelete("restrict"),
      orderDateStatusIdx: index("order_date_status_idx").on(
        table.orderDate,
        table.deliveryStatus
      ),
      orderUserDateIdx: index("order_user_date_idx").on(
        table.userId,
        table.orderDate
      ),
      orderPaymentStatusIdx: index("order_payment_status_idx").on(
        table.paymentStatus
      ),
      orderInvoiceNumberIdx: index("order_invoice_number_idx").on(
        table.invoiceNumber
      ),
    }
  }
)

export const orderDetails = pgTable(
  "OrderDetails",
  {
    id: customId("id", ENTITY_PREFIX.ORDER_DETAILS),
    orderId: varchar("orderId", { length: 32 }).notNull(),
    productVariantId: varchar("productVariantId", { length: 32 }).notNull(),
    originalPrice: doublePrecision("originalPrice").notNull(),
    discountAmount: doublePrecision("discountAmount").default(0).notNull(),
    taxAmount: doublePrecision("taxAmount").default(0).notNull(),
    unitPrice: doublePrecision("unitPrice").notNull(),
    quantity: integer("quantity").notNull(),

    itemStatus: deliveryStatus("itemStatus").default("PROCESSING").notNull(),
    returnReason: text("returnReason"),
    returnedAt: timestamp("returnedAt", { mode: "date" }),
    refundAmount: doublePrecision("refundAmount"),

    fulfilledFromLocation: skuLocation("fulfilledFromLocation"),
  },
  (table) => {
    return {
      orderDetailsOrderIdFkey: foreignKey({
        columns: [table.orderId],
        foreignColumns: [order.id],
        name: "OrderDetails_orderId_fkey",
      })
        .onUpdate("cascade")
        .onDelete("cascade"),
      orderDetailsProductVariantIdFkey: foreignKey({
        columns: [table.productVariantId],
        foreignColumns: [productVariant.id],
        name: "OrderDetails_productVariantId_fkey",
      })
        .onUpdate("cascade")
        .onDelete("cascade"),
      orderDetailsStatusIdx: index("order_details_status_idx").on(
        table.itemStatus
      ),
      orderDetailsFulfillmentIdx: index("order_details_fulfillment_idx").on(
        table.fulfilledFromLocation
      ),
    }
  }
)

export const review = pgTable(
  "Review",
  {
    id: customId("id", ENTITY_PREFIX.REVIEW),
    rating: doublePrecision("rating").default(0).notNull(),
    comment: text("comment"),
    userId: varchar("userId", { length: 32 }).notNull(),
    productId: varchar("productId", { length: 32 }).notNull(),
    createdAt: timestamp("createdAt", { precision: 3, mode: "date" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updatedAt", { precision: 3, mode: "date" })
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => {
    return {
      reviewUserIdFkey: foreignKey({
        columns: [table.userId],
        foreignColumns: [user.id],
        name: "Review_userId_fkey",
      })
        .onUpdate("cascade")
        .onDelete("cascade"),
      reviewProductIdFkey: foreignKey({
        columns: [table.productId],
        foreignColumns: [product.id],
        name: "Review_productId_fkey",
      })
        .onUpdate("cascade")
        .onDelete("cascade"),
    }
  }
)

export const address = pgTable(
  "Address",
  {
    id: customId("id", ENTITY_PREFIX.ADDRESS),
    userId: varchar("userId", { length: 32 }).notNull(),
    street: varchar("street", { length: 255 }).notNull(),
    city: varchar("city", { length: 100 }).notNull(),
    state: varchar("state", { length: 100 }).notNull(),
    postalCode: varchar("postalCode", { length: 10 }).notNull(),
    country: varchar("country", { length: 50 }).default("India").notNull(),
    type: addressType("addressType").default("SHIPPING").notNull(),
    createdAt: timestamp("createdAt", { precision: 3, mode: "date" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updatedAt", { precision: 3, mode: "date" })
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => {
    return {
      addressUserIdFkey: foreignKey({
        columns: [table.userId],
        foreignColumns: [user.id],
        name: "Address_userId_fkey",
      })
        .onDelete("cascade")
        .onUpdate("cascade"),
      userAddressIndex: index("Adress_userId_index").on(table.userId),
    }
  }
)

export const inventoryManagement = pgTable(
  "InventoryManagement",
  {
    id: customId("id", ENTITY_PREFIX.INVENTORY),
    productVariantId: varchar("productVariantId", { length: 32 }).notNull(),
    orderId: varchar("orderId", { length: 32 }),
    type: movementType("type").notNull(),
    quantity: integer("quantity").notNull(),
    reason: text("reason").notNull(),
    location: skuLocation("location").notNull(),
    previousStock: integer("previousStock").notNull(),
    newStock: integer("newStock").notNull(),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
    createdBy: varchar("createdBy", { length: 32 }).notNull(),
  },
  (table) => ({
    inventoryManagementVariantFkey: foreignKey({
      columns: [table.productVariantId],
      foreignColumns: [productVariant.id],
    })
      .onDelete("restrict")
      .onUpdate("cascade"),
    inventoryMovementOrderFkey: foreignKey({
      columns: [table.orderId],
      foreignColumns: [order.id],
    })
      .onDelete("set null")
      .onUpdate("cascade"),

    inventoryMovementUserFkey: foreignKey({
      columns: [table.createdBy],
      foreignColumns: [user.id],
    })
      .onDelete("restrict")
      .onUpdate("cascade"),

    productVariantIdx: index("idx_inventory_movement_variant").on(
      table.productVariantId
    ),
    dateIdx: index("idx_inventory_movement_date").on(table.createdAt),
    orderIdx: index("idx_inventory_movement_order").on(table.orderId),
    locationIdx: index("idx_inventory_movement_location").on(table.location),
  })
)

export const tag = pgTable("Tags", {
  id: customId("id", "TAG"),
  name: text("name").notNull(),
})
