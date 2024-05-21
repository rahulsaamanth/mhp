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

// UserStatus enum
export type UserStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED"

// UserRole enum
// export type UserRole = "ADMIN" | "USER";

// User model
export type User = {
  id: string
  name?: string | null
  email?: string | null
  emailVerified?: Date | null
  image?: string | null
  password?: string | null
  role: UserRole
  status: UserStatus
  isTwoFactorEnabled: boolean
  phone: string | null
  shippingAddress?: string | null
  billingAddress?: string | null
  orders?: []
}

// Product model
export type Product = {
  id: string
  name: string
  description: string
  price: number
  stock: number
  category: Category
  categoryId: string
  brand: Brand
  brandId: string
  orderDetails: OrderDetails[]
}

// Category model
export type Category = {
  id: string
  name: string
  parent?: Category | null
  parentId?: string | null
  subCategories: Category[]
  products: Product[]
}

// Brand model
export type Brand = {
  id: string
  name: string
  products: Product[]
}

// Order model
export type Order = {
  id: string
  user: User
  userId: string
  orderDate: Date
  totalAmountPaid: number
  orderDetails: OrderDetails[]
}

// OrderDetails model
export type OrderDetails = {
  id: string
  order: Order
  orderId: string
  product: Product
  productId: string
  quantity: number
  unitPrice: number
}
