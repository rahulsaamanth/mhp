import NextAuth, { type DefaultSession } from "next-auth"
import { userRole } from "./drizzle/schema"

export type ExtendedUser = DefaultSession["user"] & {
  role: UserRole
  isTwoFactorEnabled: boolean
  isOAuth: boolean
  image: string | null
}
declare module "next-auth" {
  interface Session {
    user: ExtendedUser
  }
}
