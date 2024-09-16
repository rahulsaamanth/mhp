import {
  pgTable,
  varchar,
  timestamp,
  text,
  integer,
  uniqueIndex,
  serial,
  boolean,
  foreignKey,
  doublePrecision,
  jsonb,
  index,
  pgEnum,
} from "drizzle-orm/pg-core"
import { InferSelectModel, sql } from "drizzle-orm"

export const orderType = pgEnum("OrderType", ["OFFLINE", "ONLINE"])
export const userRole = pgEnum("UserRole", ["ADMIN", "USER"])
export const userStatus = pgEnum("UserStatus", ["ACTIVE", "INACTIVE"])

export type UserRole = (typeof userRole.enumValues)[number]

export type User = InferSelectModel<typeof user>
export type Order = InferSelectModel<typeof order>

export const prismaMigrations = pgTable("_prisma_migrations", {
  id: varchar("id", { length: 36 }).primaryKey().notNull(),
  checksum: varchar("checksum", { length: 64 }).notNull(),
  finishedAt: timestamp("finished_at", { withTimezone: true, mode: "string" }),
  migrationName: varchar("migration_name", { length: 255 }).notNull(),
  logs: text("logs"),
  rolledBackAt: timestamp("rolled_back_at", {
    withTimezone: true,
    mode: "string",
  }),
  startedAt: timestamp("started_at", { withTimezone: true, mode: "string" })
    .defaultNow()
    .notNull(),
  appliedStepsCount: integer("applied_steps_count").default(0).notNull(),
})

export const verificationToken = pgTable(
  "VerificationToken",
  {
    id: serial("id").primaryKey().notNull(),
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
    id: serial("id").primaryKey().notNull(),
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
    id: serial("id").primaryKey().notNull(),
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
    id: serial("id").primaryKey().notNull(),
    name: text("name"),
    email: text("email"),
    emailVerified: timestamp("emailVerified", { precision: 3, mode: "date" }),
    image: text("image"),
    password: text("password"),
    role: userRole("role").default("USER").notNull(),
    status: userStatus("status").default("ACTIVE").notNull(),
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
    id: serial("id").primaryKey().notNull(),
    userId: integer("userId").notNull(),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refreshToken: text("refresh_token"),
    accessToken: text("access_token"),
    expiresAt: integer("expires_at"),
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
    id: serial("id").primaryKey().notNull(),
    userId: integer("userId").notNull(),
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
    id: serial("id").primaryKey().notNull(),
    name: text("name").notNull(),
    parentId: integer("parentId"),
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

export const product = pgTable(
  "Product",
  {
    id: serial("id").primaryKey().notNull(),
    name: text("name").notNull(),
    description: text("description").notNull(),
    price: doublePrecision("price").notNull(),
    stock: integer("stock").notNull(),
    image: text("image").notNull(),
    tags: text("tags").array(),
    type: text("type").notNull(),
    categoryId: integer("categoryId").notNull(),
    brandId: integer("brandId").notNull(),
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
      productBrandIdFkey: foreignKey({
        columns: [table.brandId],
        foreignColumns: [brand.id],
        name: "Product_brandId_fkey",
      })
        .onUpdate("cascade")
        .onDelete("restrict"),
    }
  }
)

export const brand = pgTable("Brand", {
  id: serial("id").primaryKey().notNull(),
  name: text("name").notNull(),
})

export const order = pgTable(
  "Order",
  {
    id: serial("id").primaryKey().notNull(),
    userId: integer("userId").notNull(),
    orderDate: timestamp("orderDate", {
      precision: 3,
      mode: "string",
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
    id: serial("id").primaryKey().notNull(),
    orderId: integer("orderId").notNull(),
    productId: integer("productId").notNull(),
    quantity: integer("quantity").notNull(),
    unitPrice: doublePrecision("unitPrice").notNull(),
  },
  (table) => {
    return {
      orderId: index("orderId").using("btree", table.orderId.asc().nullsLast()),
      productId: index("productId").using(
        "btree",
        table.productId.asc().nullsLast()
      ),
      orderDetailsOrderIdFkey: foreignKey({
        columns: [table.orderId],
        foreignColumns: [order.id],
        name: "OrderDetails_orderId_fkey",
      })
        .onUpdate("cascade")
        .onDelete("cascade"),
      orderDetailsProductIdFkey: foreignKey({
        columns: [table.productId],
        foreignColumns: [product.id],
        name: "OrderDetails_productId_fkey",
      })
        .onUpdate("cascade")
        .onDelete("restrict"),
    }
  }
)

export const review = pgTable(
  "Review",
  {
    id: serial("id").primaryKey().notNull(),
    rating: integer("rating").default(0).notNull(),
    comment: text("comment"),
    userId: integer("userId").notNull(),
    productId: integer("productId").notNull(),
    createdAt: timestamp("createdAt", { precision: 3, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updatedAt", {
      precision: 3,
      mode: "string",
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
