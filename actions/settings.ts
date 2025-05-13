"use server"

import * as z from "zod"

import { unstable_update as update } from "@/auth"

import { SettingsSchema } from "@/schemas"
import { getUserByEmail, getUserById } from "@/utils/user"
import { currentUser } from "@/lib/auth"
import { generateVerificationToken } from "@/lib/tokens"
import { sendVerificationEmail } from "@/lib/mail"
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3"
import { db } from "@/db/db"
import { user } from "@rahulsaamanth/mhp-schema"
import { eq } from "drizzle-orm"
import { comparePasswords, hashPassword } from "@/lib/passwords"

export const updateUser = async (values: z.infer<typeof SettingsSchema>) => {
  const _user = await currentUser()

  if (!_user) {
    return { error: "Unauthorized" }
  }

  const dbUser = await getUserById(_user.id!)

  if (!dbUser) {
    return { error: "Unauthorized" }
  }

  if (_user.isOAuth) {
    values.email = undefined
    values.password = undefined
    values.newPassword = undefined
    values.isTwoFactorEnabled = undefined
  }

  if (values.email && values.email !== _user.email) {
    const existingUser = await getUserByEmail(values.email)

    if (existingUser && existingUser.id !== _user.id) {
      return { error: "Email already in use!" }
    }

    const verificationToken = await generateVerificationToken(values.email)
    await sendVerificationEmail(
      verificationToken.identifier,
      verificationToken.token
    )

    return { success: "Verification email sent!" }
  }

  if (values.password && values.newPassword && dbUser.password) {
    const passwordsMatch = await comparePasswords(
      values.password,
      dbUser.password
    )

    if (!passwordsMatch) {
      return { error: "Incorrect password!" }
    }

    const hashedPassword = await hashPassword(values.newPassword)
    values.password = hashedPassword
    values.newPassword = undefined
  }

  const [updatedUser] = await db
    .update(user)
    .set({
      ...values,
    })
    .where(eq(user.id, dbUser.id))
    .returning()
    .execute()

  await update({
    user: {
      name: updatedUser?.name,
      email: updatedUser?.email,
      isTwoFactorEnabled: updatedUser?.isTwoFactorEnabled,
      role: updatedUser?.role,
      image: updatedUser?.image,
    },
  })

  return { success: "User Profile Updated!" }
}

const allowedFileTypes = [
  "image/jpeg",
  "image/png",
  "image/jpg",
  "image/webp",
  "image/svg+xml",
]

const MaxFileSize = 1024 * 1024 * 5

// type SignedURLResponse = Promise<
//   | { error: string; success?: undefined }
//   | { success: { url: string }; error?: undefined }
// >

// type GetSignedURLParams = {
//   fileType: string
//   fileSize: number
//   checksum: string
//   fileName: string
// }

const s3Client = new S3Client({
  region: process.env.S3_BUCKET_REGION!,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY!,
    secretAccessKey: process.env.S3_SECRET_KEY!,
  },
})

export async function uploadToS3(
  base64File: string,
  fileName: string,
  fileType: string
) {
  try {
    const user = await currentUser()
    if (!user) throw new Error("Unauthorized")
    const fileBuffer = Buffer.from(base64File, "base64")

    if (fileBuffer.length > MaxFileSize) {
      throw new Error("File size too large")
    }

    if (!allowedFileTypes.includes(fileType)) {
      throw new Error("File type not allowed")
    }

    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: fileName,
      Body: fileBuffer,
      ContentType: fileType,
    })

    await s3Client.send(command)
    return `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.S3_BUCKET_REGION}.amazonaws.com/${fileName}`
  } catch (error) {
    console.error("Error uploading to S3:", error)
    throw new Error("Failed to upload file")
  }
}
