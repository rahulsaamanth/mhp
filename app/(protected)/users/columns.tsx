"use client"

import { ColumnDef } from "@tanstack/react-table"

export type UserColumn = {
  id: string
  name: string | null
  email: string | null
  emailVerified: Date | null
  image: string | null
  password?: string | null
  role: "ADMIN" | "USER"
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED"
  isTwoFactorEnabled: boolean
  phone: string | null
  shippingAddress: string | null
  billingAddress: string | null
}

export const columns: ColumnDef<UserColumn>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "role",
    header: "Role",
  },
  {
    accessorKey: "phone",
    header: "Contact",
  },
  {
    accessorKey: "status",
    header: "Status",
  },
]
