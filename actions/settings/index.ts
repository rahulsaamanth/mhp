"use server"

import * as z from "zod"
import bcrypt from "bcryptjs"

import { unstable_update as update } from "@/auth"
import db from "@/lib/db"
import { SettingsSchema } from "@/schemas"
import { getUserByEmail, getUserById } from "@/utils/user"
import { currentUser } from "@/lib/auth"
import { generateVerificationToken } from "@/lib/tokens"
import { sendVerificationEmail } from "@/lib/mail"
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import crypto from "crypto"

export const updateUser = async (values: z.infer<typeof SettingsSchema>) => {
  const user = await currentUser()

  if (!user) {
    return { error: "Unauthorized" }
  }

  const dbUser = await getUserById(Number(user.id!))

  if (!dbUser) {
    return { error: "Unauthorized" }
  }

  if (user.isOAuth) {
    values.email = undefined
    values.password = undefined
    values.newPassword = undefined
    values.isTwoFactorEnabled = undefined
  }

  if (values.email && values.email !== user.email) {
    const existingUser = await getUserByEmail(values.email)

    if (existingUser && existingUser.id !== Number(user.id)) {
      return { error: "Email already in use!" }
    }

    const verificationToken = await generateVerificationToken(values.email)
    await sendVerificationEmail(
      verificationToken.email,
      verificationToken.token,
    )

    return { success: "Verification email sent!" }
  }

  if (values.password && values.newPassword && dbUser.password) {
    const passwordsMatch = await bcrypt.compare(
      values.password,
      dbUser.password,
    )

    if (!passwordsMatch) {
      return { error: "Incorrect password!" }
    }

    const hashedPassword = await bcrypt.hash(values.newPassword, 10)
    values.password = hashedPassword
    values.newPassword = undefined
  }

  const updatedUser = await db.user.update({
    where: { id: dbUser.id },
    data: {
      ...values,
    },
  })

  await update({
    user: {
      name: updatedUser.name,
      email: updatedUser.email,
      isTwoFactorEnabled: updatedUser.isTwoFactorEnabled,
      role: updatedUser.role,
      image: updatedUser.image,
    },
  })

  return { success: "User Profile Updated!" }
}

const generateFileName = (bytes = 32) =>
  crypto.randomBytes(bytes).toString("hex")

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
}

const s3Client = new S3Client({
  region: process.env.AWS_BUCKET_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY!,
    secretAccessKey: process.env.AWS_ACCESS_SECRET!,
  },
})

export const getSignedURL = async ({
  fileType,
  fileSize,
  checksum,
}: GetSignedURLParams): SignedURLResponse => {
  const user = currentUser()

  if (!user) return { error: "Unauthorized!" }

  if (!allowedFileTypes.includes(fileType))
    return { error: "File type not allowed" }

  if (fileSize > MaxFileSize) return { error: "File size too large" }

  const fileName = generateFileName()

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
