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

const productVariantSchema = z.object({
  variantName: z.string().min(1, "Variant name is required"),
  potency: z.string().optional(),
  packSize: z.string().optional(),
  price: z.number().min(0, "Price must be positive"),
  stock: z.number().min(0, "Stock musn't be negative"),
  variantImage: z
    .array(
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
    )
    .min(1, "At least one image is required"),
})

export const createProductSchema = z.object({
  name: z.string().min(3, "Product name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  status: z.enum(["ACTIVE", "DRAFT", "ARCHIVED"]).default("ACTIVE"),
  categoryId: z.string().min(1, "Category is required"),
  manufacturerId: z.string().min(1, "Manufacturer is required"),
  tags: z.array(z.string()).optional().default([]),
  // variants: z
  //   .array(productVariantSchema)
  //   .min(1, "At least one variant is required"),
})
