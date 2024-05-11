import { auth } from "@/auth"
import { UserRole } from "@prisma/client"

export const currentUser = async () => {
  const session = await auth()

  return session?.user
}

export const currentRole = async () => {
  const session = await auth()

  return session?.user?.role
}

type update_session_user_props = {
  name: string
  email: string
  isTwoFactorEnabled: boolean
  role: UserRole
  image: string
}

export const update_session_user = async ({
  ...values
}: update_session_user_props) => {
  const user = currentUser()
}
