import { Many, relations } from "drizzle-orm/relations"
import {
  user,
  account,
  twoFactorConfirmation,
  category,
  product,
  manufacturer,
  order,
  orderDetails,
  review,
  productVariant,
} from "./schema"

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}))

export const userRelations = relations(user, ({ many }) => ({
  accounts: many(account),
  twoFactorConfirmations: many(twoFactorConfirmation),
  orders: many(order),
  reviews: many(review),
}))

export const twoFactorConfirmationRelations = relations(
  twoFactorConfirmation,
  ({ one }) => ({
    user: one(user, {
      fields: [twoFactorConfirmation.userId],
      references: [user.id],
    }),
  })
)

export const categoryRelations = relations(category, ({ one, many }) => ({
  category: one(category, {
    fields: [category.parentId],
    references: [category.id],
    relationName: "category_parentId_category_id",
  }),
  categories: many(category, {
    relationName: "category_parentId_category_id",
  }),
  products: many(product),
}))

export const productRelations = relations(product, ({ one, many }) => ({
  category: one(category, {
    fields: [product.categoryId],
    references: [category.id],
  }),
  manufacturer: one(manufacturer, {
    fields: [product.manufacturerId],
    references: [manufacturer.id],
  }),

  reviews: many(review),
  variants: many(productVariant),
}))

export const productVariantRelations = relations(
  productVariant,
  ({ one, many }) => ({
    product: one(product, {
      fields: [productVariant.productId],
      references: [product.id],
    }),
    orderDetails: many(orderDetails),
  })
)

export const manufacturerRelations = relations(manufacturer, ({ many }) => ({
  products: many(product),
}))

export const orderRelations = relations(order, ({ one, many }) => ({
  user: one(user, {
    fields: [order.userId],
    references: [user.id],
  }),
  orderDetails: many(orderDetails),
}))

export const orderDetailsRelations = relations(orderDetails, ({ one }) => ({
  order: one(order, {
    fields: [orderDetails.orderId],
    references: [order.id],
  }),
  product: one(productVariant, {
    fields: [orderDetails.productVariantId],
    references: [productVariant.id],
  }),
}))

export const reviewRelations = relations(review, ({ one }) => ({
  user: one(user, {
    fields: [review.userId],
    references: [user.id],
  }),
  product: one(product, {
    fields: [review.productId],
    references: [product.id],
  }),
}))
