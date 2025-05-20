import {
  deliveryStatus,
  discountType,
  orderType,
  paymentStatus,
  paymentType,
  potency,
} from "@rahulsaamanth/mhp-schema"
import * as z from "zod"

const ACCEPTED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/svg",
]
const MAX_UPLOAD_SIZE = 1024 * 1024 * 5

// const minStringLength = (min: number) => {
//   return z.string().refine((val) => val.length === 0 || val.length >= min, {
//     message: `Must be atleast ${min} characters.`,
//   })
// }

export const SettingsSchema = z
  .object({
    name: z.optional(z.string()),
    isTwoFactorEnabled: z.optional(z.boolean()),
    role: z.enum(["ADMIN", "USER"]),
    email: z.optional(z.string().email()),
    password: z.optional(z.string().min(8)),
    newPassword: z.optional(z.string().min(8)),
    image: z.optional(
      z
        .any()
        .refine(
          (files) => ACCEPTED_IMAGE_MIME_TYPES.includes(files?.[0].type),
          "Only .png, .jpg, .jpeg, and .webp formats are supported."
        )
        .refine(
          (files) => !files || files?.[0].size <= MAX_UPLOAD_SIZE,
          "Max upload size is 5MB"
        )
    ),
  })
  .refine(
    (data) => {
      if (data.newPassword && !data.password) {
        return false
      }

      return true
    },
    {
      message: "Password is required, as you are setting new password!",
      path: ["password"],
    }
  )
  .refine(
    (data) => {
      if (data.password && !data.newPassword) {
        return false
      }
      return true
    },
    {
      message: "New password is required!",
      path: ["newPassword"],
    }
  )

export const NewPasswordSchema = z.object({
  password: z.string().min(8, { message: "Minimum 8 characters required" }),
})

export const ResetSchema = z.object({
  email: z.string().email({
    message: "Email is required",
  }),
})

export const LoginSchema = z.object({
  email: z.string().email({
    message: "Email is required",
  }),
  password: z.string().min(1, { message: "Password is required" }),
  code: z.optional(z.string()),
})

export const RegisterSchema = z.object({
  email: z.string().email({
    message: "Email is required",
  }),
  password: z.string().min(8, { message: "Minimum 8 characters required!" }),
  name: z.string().min(3, { message: "Name is required" }),
})

// const productVariantSchema = z.object({
//   potency: z.enum(["NONE", ...potency.enumValues]),
//   packSize: z.number().optional(),
//   costPrice: z.number().min(0, "Price must be positive"),
//   sellingPrice: z.number().min(0, "Price must be positive"),
//   discountedPrice: z.number().min(0, "Price must be positive"),
//   stock: z.number().min(0, "Stock musn't be negative"),
//   variantImage: z
//     .array(
//       z
//         .any()
//         .refine(
//           (files) => ACCEPTED_IMAGE_MIME_TYPES.includes(files?.[0].type),
//           "Only .png, .jpg, .jpeg, and .webp formats are supported."
//         )
//         .refine(
//           (files) => !files || files?.[0].size <= MAX_UPLOAD_SIZE,
//           "Max upload size is 5MB"
//         )
//     )
//     .min(1, "At least one image is required"),

// })

export const productVariantSchema = z
  .object({
    id: z.string().optional(),
    potency: z.enum([...potency.enumValues]),
    packSize: z.number().min(1, "Pack size must be at least 1"),
    costPrice: z.number().min(0, "Price must be positive"),
    mrp: z.number().min(0, "MRP must be positive"),
    sku: z.string(),
    variantName: z.string(),
    sellingPrice: z.number().min(0, "Price must be positive"),
    discount: z.number().min(0, "discount musn't be negative"),
    discountType: z.enum(["PERCENTAGE", "FIXED"]).default("PERCENTAGE"),
    priceAfterTax: z.number().min(0, "Price must be positive"),
    stock_MANG1: z.number().min(0, "Stock must not be negative").default(0),
    stock_MANG2: z.number().min(0, "Stock must not be negative").default(0),
    stock_KERALA1: z.number().min(0, "Stock must not be negative").default(0),
    variantImage: z.array(z.any()),
  })
  .superRefine((data, ctx) => {
    if (data.mrp < data.sellingPrice) {
      // Changed from <= to <
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["mrp"],
        message: "MRP must be greater than or equal to selling price",
      })
    }
    if (data.discountType === "PERCENTAGE" && data.discount > 100) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["discount"],
        message: "Percentage discount cannot be more than 100%",
      })
    }
    if (data.discountType === "FIXED" && data.discount > data.mrp) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["discount"],
        message: "Fixed discount cannot be more than MRP",
      })
    }
  })

export const createProductSchema = z.object({
  name: z.string().min(3, "Product name must be at least 3 characters"),
  description: z.string().min(17, "Description must be at least 10 characters"),
  status: z.enum(["ACTIVE", "DRAFT", "ARCHIVED"]).default("ACTIVE"),
  categoryId: z.string().min(1, "Category is required"),
  manufacturerId: z.string().min(1, "Manufacturer is required"),
  isFeatured: z.boolean().default(false),
  tags: z.array(z.string()).optional().default([]),
  form: z.enum([
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
  ]),
  unit: z.enum(["NONE", "TABLETS", "ML", "GM(s)", "DROPS", "AMPOULES"]),
  hsnCode: z.string().default("30049014"),
  tax: z
    .number()
    .min(0, "Tax musn't be negative")
    .max(28, "Tax musn't excee the tax slab 28")
    .default(0),
  taxInclusive: z.boolean().optional(),
  variants: z
    .array(productVariantSchema)
    .min(1, "At least one variant is required"),
})

export type ProductCreateInput = Omit<
  z.infer<typeof createProductSchema>,
  "taxInclusive"
>

// Schema for order item/product
const orderItemSchema = z.object({
  productVariantId: z.string().min(1, "Product variant is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  unitPrice: z.number().min(0, "Unit price must be positive"),
  originalPrice: z.number().min(0, "Original price must be positive"),
  discountAmount: z.number().min(0, "Discount must not be negative").default(0),
  taxAmount: z.number().min(0, "Tax amount must not be negative").default(0),
  productName: z.string().optional(),
  variantName: z.string().optional(),
  potency: z.string().optional(),
  packSize: z.number().optional(),
  imageUrl: z.string().optional(),
})

// Address schema
const addressSchema = z.object({
  street: z.string().min(1, "Street is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  postalCode: z.string().min(1, "Postal code is required"),
  country: z.string().default("India"),
})

// Main order schema
export const createOrderSchema = z.object({
  // Customer information
  userId: z.string().optional(),
  customerName: z.string().min(1, "Customer name is required"),
  customerPhone: z.string().min(10, "Valid phone number is required"),
  customerEmail: z.string().email("Valid email is required").optional(),
  isGuestOrder: z.boolean().default(false),

  // Store information
  storeId: z.string().min(1, "Store is required"),

  // Order details
  orderType: z.enum(orderType.enumValues).default("OFFLINE"),
  orderItems: z.array(orderItemSchema).min(1, "At least one item is required"),

  // Financial details
  subtotal: z.number().min(0, "Subtotal must be positive"),
  shippingCost: z
    .number()
    .min(0, "Shipping cost must not be negative")
    .default(0),
  discount: z.number().min(0, "Discount must not be negative").default(0),
  tax: z.number().min(0, "Tax must not be negative").default(0),
  totalAmountPaid: z.number().min(0, "Total amount must be positive"),

  // Status
  deliveryStatus: z.enum(deliveryStatus.enumValues).default("PROCESSING"),
  paymentStatus: z.enum(paymentStatus.enumValues).default("PENDING"),

  // Payment information
  paymentMethodId: z.string().optional(),
  paymentType: z.enum(paymentType.enumValues).optional(),
  paymentIntentId: z.string().optional(),

  // Address information
  shippingAddress: addressSchema,

  // Notes
  customerNotes: z.string().optional(),
  adminNotes: z.string().optional(),

  // Dates
  estimatedDeliveryDate: z.date().optional(),
})

export type OrderCreateInput = z.infer<typeof createOrderSchema>

export const addDiscountCodeSchema = z.object({
  code: z
    .string()
    .min(3, "Code must be at least 3 characters")
    .max(50, "Code cannot exceed 50 characters")
    .trim(),
  description: z.string().nullable().optional(),
  discountAmount: z.number().positive("Discount amount must be positive"),
  discountType: z.enum(["PERCENTAGE", "FIXED"]),
  isActive: z.boolean().default(true),
  allProducts: z.boolean().default(true),
  minimumOrderValue: z.number().nullable().optional(),
  limit: z.number().nullable().optional(),
  expiresAt: z.date().nullable().optional(),
})
