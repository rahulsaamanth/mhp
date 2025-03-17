import type { NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"

import { LoginSchema } from "./schemas"
import { getUserByEmail } from "@/actions/auth/user"

// import Github from "next-auth/providers/github"
import Google from "next-auth/providers/google"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import { db } from "./db/db"
import { account, user, verificationToken } from "./db/schema"

export default {
  adapter: DrizzleAdapter(db),
  providers: [
    // -------------------- Not for Admin --------------------
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    // Github({
    //   clientId: process.env.GITHUB_CLIENT_ID,
    //   clientSecret: process.env.GITHUB_CLIENT_SECRET,
    // }),
    // -------------------------------------------------------
    Credentials({
      async authorize(credentials) {
        const validatedFields = LoginSchema.safeParse(credentials)
        if (validatedFields.success) {
          const { email, password } = validatedFields.data
          const user = await getUserByEmail(email)

          if (!user || !user.password) return null
          const passwordsMatch = await bcrypt.compare(password, user.password)
          if (passwordsMatch)
            return {
              ...user,
              id: user.id.toString(),
            }
        }
        return null
      },
    }),
  ],
  trustHost: true,
} satisfies NextAuthConfig
