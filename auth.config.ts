import type { NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials"

import { getUserByEmail } from "@/actions/auth/user"
import { LoginSchema } from "./schemas"
import { comparePasswords } from "./lib/passwords"

// import Github from "next-auth/providers/github"

export default {
  // --------------- Required for the Oauth ---------------------
  // adapter: DrizzleAdapter(db) as any,
  // -----------------------------------------------------------
  providers: [
    // -------------------- Not for Admin --------------------
    // Google({
    //   clientId: process.env.GOOGLE_CLIENT_ID!,
    //   clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    // }),
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
          const passwordsMatch = await comparePasswords(password, user.password)
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
