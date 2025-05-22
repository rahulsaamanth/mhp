import { type Row } from "@tanstack/react-table"
import { type SQL } from "drizzle-orm"
import { DataTableConfig } from "./config/data-table"
import {
  deliveryStatus,
  orderType,
  paymentStatus,
  Product as ProductFromSchema,
} from "@rahulsaamanth/mhp-schema"

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
export type UserStatus = "ACTIVE" | "INACTIVE"

// UserRole enum
export type UserRole = "ADMIN" | "USER"

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
  orders?: Order[]
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
  createdAt: Date
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

import type { ColumnSort } from "@tanstack/react-table"

import { type z } from "zod"
import { filterSchema } from "./lib/parsers"

export type Prettify<T> = {
  [K in keyof T]: T[K]
} & {}

export type StringKeyOf<TData> = Extract<keyof TData, string>

export interface SearchParams {
  [key: string]: string | string[] | undefined
}

export interface Option {
  label: string
  value: string
  icon?: React.ComponentType<{ className?: string }>
  count?: number
}

export interface ExtendedColumnSort<TData> extends Omit<ColumnSort, "id"> {
  id: StringKeyOf<TData>
}

export type ExtendedSortingState<TData> = ExtendedColumnSort<TData>[]

export type ColumnType = DataTableConfig["columnTypes"][number]

export type FilterOperator = DataTableConfig["globalOperators"][number]

export type JoinOperator = DataTableConfig["joinOperators"][number]["value"]

// export type ProductForTable = {
//   id: string
//   name: string
//   status: "ACTIVE" | "DRAFT" | "ARCHIVED"
//   createdAt: Date
//   image: string
//   sales: string | number
//   minPrice: number
//   maxPrice: number
// }

export interface DataTableFilterField<TData> {
  id: StringKeyOf<TData>
  label: string
  placeholder?: string
  options?: Option[]
}

export interface DataTableAdvancedFilterField<TData>
  extends DataTableFilterField<TData> {
  type: ColumnType
}

export type Filter<TData> = Prettify<
  Omit<z.infer<typeof filterSchema>, "id"> & {
    id: StringKeyOf<TData>
  }
>

export interface DataTableRowAction<TData> {
  row: Row<TData>
  type: "update" | "delete" | "download" | "send"
}

export interface QueryBuilderOpts {
  where?: SQL
  orderBy?: SQL
  distinct?: boolean
  nullish?: boolean
}

export interface ProductWithComputedFields
  extends Omit<ProductFromSchema, "createdAt"> {
  sales: number
  stock: number
  minPrice: number
  maxPrice: number
  image: string
  createdAt: string
  categoryName: string | null
  manufacturerName: string | null
}

export type ProductForTable = ProductWithComputedFields

export interface OrderWithComputedFields extends Order {
  paymentStatus: typeof paymentStatus
  deliveryStatus: typeof deliveryStatus
  orderType: typeof orderType
  userName: string
  // Add new columns that were added to getOrders query
  isGuestOrder: boolean
  customerName: string | null
  customerPhone: string | null
  customerEmail: string | null
  storeId: string
  discount: number
  tax: number
}

export type OrderForTable = OrderWithComputedFields

// Add these to your types.ts file

export interface InvoiceForTable {
  id: string
  invoiceNumber: string
  userName: string
  userEmail: string
  userPhone: string
  createdAt: string
  totalAmountPaid: number
  paymentStatus: string
  invoiceDetails: any[]
  isGuestOrder: boolean
  customerName: string
  customerEmail: string
  customerPhone: string
  storeId: string
}
