import NextAuth from "next-auth"

import { getAccountByUserId } from "./utils/account"
import { getTwoFactorConfirmationByUserId } from "./utils/two-factor-confirmation"
import { getUserById } from "./utils/user"

import { db } from "@/db/db"
import { eq, is } from "drizzle-orm"
import {
  user as User,
  UserRole,
  twoFactorConfirmation,
} from "@rahulsaamanth/mhp_shared-schema"

// import { DrizzleAdapter } from "@auth/drizzle-adapter"
import authConfig from "./auth.config"

declare module "next-auth" {
  interface User {
    role: string
    isTwoFactorEnabled: boolean
  }
}

export const { handlers, auth, signIn, signOut, unstable_update } = NextAuth({
  pages: {
    signIn: "/admin/auth/login",
    error: "/admin/auth/error",
  },
  // events: {
  //   async linkAccount({ user }) {
  //     await db
  //       .update(User)
  //       .set({
  //         emailVerified: new Date(),
  //       })
  //       .where(eq(User.id, user.id!))
  //       .execute()
  //   },
  // },

  callbacks: {
    async redirect({ url, baseUrl }) {
      return url.startsWith(baseUrl) ? url : baseUrl
    },

    async signIn({ user, account }) {
      if (account?.provider !== "credentials") return true

      const existingUser = await getUserById(user.id!)

      if (!existingUser?.emailVerified) return false

      if (existingUser.role !== "ADMIN") return false

      if (existingUser.isTwoFactorEnabled) {
        const _twoFactorConfirmation = await getTwoFactorConfirmationByUserId(
          existingUser.id
        )

        if (!_twoFactorConfirmation) return false

        await db
          .delete(twoFactorConfirmation)
          .where(eq(twoFactorConfirmation.id, _twoFactorConfirmation.id))
          .execute()
      }
      await db
        .update(User)
        .set({ lastActive: new Date() })
        .where(eq(User.id, user.id!))

      return true
    },
    async session({ token, session }) {
      if (session.user) {
        session.user.id = token.sub!
        session.user.role = token.role as UserRole
        session.user.isTwoFactorEnabled = token.isTwoFactorEnabled as boolean
        session.user.isOAuth = token.isOAuth as boolean
        session.user.name = token.name as string
        session.user.email = token.email as string
        session.user.image = token.image as string | null
      }

      return session
    },

    async jwt({ token, user, account, trigger }) {
      if (trigger === "update") {
        const existingUser = await getUserById(token.sub!)
        if (existingUser) {
          return {
            ...token,
            name: existingUser.name,
            email: existingUser.email,
            role: existingUser.role,
            isTwoFactorEnabled: existingUser.isTwoFactorEnabled,
            isOAuth: token.isOAuth,
            image: existingUser.image,
          }
        }
      }
      if (user) {
        return {
          ...token,
          id: user.id,
          role: user.role,
          isTwoFactorEnabled: user.isTwoFactorEnabled,
          isOAuth: account?.provider !== "credentials",
          image: user.image,
        }
      }
      return token
    },
  },
  // adapter: DrizzleAdapter(db) as any,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },

  ...authConfig,
})
