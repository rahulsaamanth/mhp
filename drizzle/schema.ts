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
import { InferSelectModel, sql } from "drizzle-orm"

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
} as const

export const customId = (name: string, prefix: string) =>
  varchar(name, { length: 32 })
    .notNull()
    .primaryKey()
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

export type UserRole = (typeof userRole.enumValues)[number]
export type User = InferSelectModel<typeof user>
export type Order = InferSelectModel<typeof order>

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
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    isTwoFactorEnabled: boolean("isTwoFactorEnabled").default(false).notNull(),
    phone: text("phone"),
    shippingAddress: text("shippingAddress"),
    billingAddress: text("billingAddress"),
    createdAt: timestamp("createdAt", { precision: 3, mode: "date" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updatedAt", { precision: 3, mode: "date" }).notNull(),
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
    image: text("image").array().notNull(),
    tags: text("tags").array(),
    categoryId: varchar("categoryId", { length: 32 }).notNull(),
    manufacturerId: varchar("manufacturerId", { length: 32 }).notNull(),
    properties: jsonb("properties"),
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
    }
  }
)

export const productVariant = pgTable(
  "ProductVariant",
  {
    id: customId("id", ENTITY_PREFIX.PRODUCT + "VAR"),
    productId: varchar("productId", { length: 32 }).notNull(),
    variantName: text("variantName").notNull(),
    potency: varchar("potency"),
    packSize: varchar("packSize"),
    price: doublePrecision("price").notNull(),
    stock: integer("stock").notNull(),
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
    }).notNull(),
    orderType: orderType("orderType").default("ONLINE").notNull(),
    totalAmountPaid: doublePrecision("totalAmountPaid").notNull(),
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
    }
  }
)

export const orderDetails = pgTable(
  "OrderDetails",
  {
    id: customId("id", ENTITY_PREFIX.ORDER_DETAILS),
    orderId: varchar("orderId", { length: 32 }).notNull(),
    productVariantId: varchar("productVariantId", { length: 32 }).notNull(),
    quantity: integer("quantity").notNull(),
    unitPrice: doublePrecision("unitPrice").notNull(),
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
        .onDelete("restrict"),
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
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updatedAt", {
      precision: 3,
      mode: "date",
    }).notNull(),
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
