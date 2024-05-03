// import { UserRole } from "@prisma/client"
import * as z from "zod"

const ACCEPTED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]
const MAX_UPLOAD_SIZE = 1024 * 1024 * 5

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
  .refine(
    (data) => {
      if (data.newPassword && !data.password) {
        return false
      }

      return true
    },
    {
      message: "Password is required!",
      path: ["password"],
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
