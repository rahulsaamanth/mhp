"use server"

import * as z from "zod"
import bcrypt from "bcryptjs"

import { unstable_update as update } from "@/auth"

import { SettingsSchema } from "@/schemas"
import { getUserByEmail, getUserById } from "@/utils/user"
import { currentUser } from "@/lib/auth"
import { generateVerificationToken } from "@/lib/tokens"
import { sendVerificationEmail } from "@/lib/mail"
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { db } from "@/db/db"
import { user } from "@/db/schema"
import { eq } from "drizzle-orm"

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
      verificationToken.email,
      verificationToken.token
    )

    return { success: "Verification email sent!" }
  }

  if (values.password && values.newPassword && dbUser.password) {
    const passwordsMatch = await bcrypt.compare(
      values.password,
      dbUser.password
    )

    if (!passwordsMatch) {
      return { error: "Incorrect password!" }
    }

    const hashedPassword = await bcrypt.hash(values.newPassword, 10)
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

type SignedURLResponse = Promise<
  | { error: string; success?: undefined }
  | { success: { url: string }; error?: undefined }
>

type GetSignedURLParams = {
  fileType: string
  fileSize: number
  checksum: string
  fileName: string
}

const s3Client = new S3Client({
  region: process.env.AWS_BUCKET_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

export const getSignedURL = async ({
  fileType,
  fileSize,
  checksum,
  fileName,
}: GetSignedURLParams): SignedURLResponse => {
  const user = currentUser()

  if (!user) return { error: "Unauthorized!" }

  if (!allowedFileTypes.includes(fileType))
    return { error: "File type not allowed" }

  if (fileSize > MaxFileSize) return { error: "File size too large" }

  const putObjectCommand = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME!,
    Key: fileName,
    ContentType: fileType,
    ContentLength: fileSize,
    ChecksumSHA256: checksum,
  })

  const signedUrl = await getSignedUrl(s3Client, putObjectCommand, {
    expiresIn: 60, //3600
  })

  return { success: { url: signedUrl } }
}
