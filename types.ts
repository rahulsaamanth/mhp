import { UserRole } from "@prisma/client"

export type SideNavItem = {
  title: string
  path: string
  icon?: string
  submenu?: boolean
  subMenuItems?: SideNavItem[]
}

export type MenuItemWithSubMenuProps = {
  item: SideNavItem
  toggleOpen: () => void
}

export type User = {
  id: string
  name: string | null
  email: string | null
  emailVerified: Date | null
  image: string | null
  password: string | null
  role: UserRole
  isTwoFactorEnabled: boolean
}
