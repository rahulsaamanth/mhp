import { db } from "@/lib/db"
import { UserRole } from "@prisma/client"

export const getUsers = async () => {
  try {
    const data = await db.user.findMany({
      where: {
        role: UserRole.USER,
      },
    })

    return { data }
  } catch (error) {
    return { error: error }
  }
}
