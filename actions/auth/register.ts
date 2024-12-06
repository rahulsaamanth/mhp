"use server"

import * as z from "zod"
import bcrypt from "bcryptjs"

import { RegisterSchema } from "@/schemas"
import { db } from "@/db/db"
import { getUserByEmail } from "@/utils/user"
import { generateVerificationToken } from "@/lib/tokens"
import { sendVerificationEmail } from "@/lib/mail"
import { user } from "@/db/schema"

export const register = async (values: z.infer<typeof RegisterSchema>) => {
  const validatedFields = RegisterSchema.safeParse(values)

  if (!validatedFields.success) return { error: "Invalid fields!" }

  const { email, password, name } = validatedFields.data
  const hashedPassword = await bcrypt.hash(password, 10)

  const existingUser = await getUserByEmail(email)

  if (existingUser) return { error: "Email already in use!" }

  // await db.user.create({
  //   data: {
  //     name,
  //     email,
  //     password: hashedPassword,
  //   },
  // })
  await db
    .insert(user)
    .values({
      name,
      email,
      password: hashedPassword,
      updatedAt: new Date(),
    })
    .execute()

  const verificationToken = await generateVerificationToken(email)

  await sendVerificationEmail(verificationToken.email, verificationToken.token)

  return { success: "Confirmation email sent!" }
}
