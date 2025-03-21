import NextAuth from "next-auth"

import { getAccountByUserId } from "./utils/account"
import { getTwoFactorConfirmationByUserId } from "./utils/two-factor-confirmation"
import { getUserById } from "./utils/user"

import { db } from "@/db/db"
import { eq } from "drizzle-orm"
import { user as User, UserRole, twoFactorConfirmation } from "./db/schema"

import { DrizzleAdapter } from "@auth/drizzle-adapter"
import authConfig from "./auth.config"

declare module "next-auth" {
  interface User {
    role: string
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

        // await db.twoFactorConfirmation.delete({
        //   where: { id: twoFactorConfirmation.id },
        // })
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
      if (token.sub && session.user) {
        session.user.id = token.sub
      }

      if (token.role && session.user) {
        session.user.role = token.role as UserRole
      }

      if (session.user) {
        session.user.isTwoFactorEnabled = token.isTwoFactorEnabled as boolean
      }

      if (session.user) {
        session.user.name = token.name
        session.user.email = token.email as string
        session.user.isOAuth = token.isOAuth as boolean
      }

      return session
    },

    async jwt({ token }) {
      if (!token.sub) return token

      const existingUser = await getUserById(token.sub)
      if (!existingUser) return token

      const existingAccount = await getAccountByUserId(existingUser.id)

      token.isOAuth = !!existingAccount
      token.name = existingUser.name
      token.email = existingUser.email
      token.role = existingUser.role
      token.isTwoFactorEnabled = existingUser.isTwoFactorEnabled
      return token
    },
  },
  adapter: DrizzleAdapter(db) as any,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  ...authConfig,
})
