"use client"

import { UsersWithOrders } from "@/actions/users"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatDate } from "@/lib/formatters"
import { cn } from "@/lib/utils"
import { User } from "@/types"
import { Icon } from "@iconify/react/dist/iconify.js"

import { ColumnDef } from "@tanstack/react-table"

export const columns: ColumnDef<UsersWithOrders, any>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        className="mb-3 mr-3"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        className="mb-3 mr-3"
      />
    ),

    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "id",
    header: "id",
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="p-0 cursor-default"
        >
          Name
          <Icon
            width="14"
            height="14"
            className="ml-2"
            icon="ph:caret-up-down"
          />
        </Button>
      )
    },
    cell: ({ row }) => {
      return <span className="text-nowrap">{row.getValue("name")}</span>
    },
    filterFn: "equalsString",
  },
  {
    accessorKey: "email",
    header: "Email",
    filterFn: "weakEquals",
  },
  {
    accessorKey: "phone",
    header: "Contact",
    cell: ({ row }) => (
      <span className="text-nowrap">{row.getValue("phone")}</span>
    ),
    filterFn: "equalsString",
  },
  // {
  //   accessorKey: "createdAt",
  //   header: ({ column }) => {
  //     return (
  //       <Button
  //         variant="ghost"
  //         onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
  //         className="p-0 cursor-default"
  //       >
  //         Joined
  //         <Icon
  //           width="14"
  //           height="14"
  //           className="ml-2"
  //           icon="ph:caret-up-down"
  //         />
  //       </Button>
  //     )
  //   },
  //   cell: ({ row }) => {
  //     const date: Date = row.getValue("createdAt")
  //     return <span className="text-nowrap">{formatDate(date)}</span>
  //   },
  // },
  // {
  //   accessorKey: "status",
  //   header: "Status",
  //   cell: ({ row }) => {
  //     const status = row.getValue("status")
  //     return (
  //       <div
  //         className={cn(
  //           "text-green-600 font-bold min-w-fit",

  //           { "text-red-600": status === "INACTIVE" }
  //         )}
  //       >
  //         {row.getValue("status")}
  //       </div>
  //     )
  //   },
  // },
  {
    accessorKey: "orders",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="p-0 cursor-default"
        >
          orders
          <Icon
            width="14"
            height="14"
            className="ml-2"
            icon="ph:caret-up-down"
          />
        </Button>
      )
    },
    cell: ({ row }) => {
      const orders: [] = row.getValue("orders")
      return <span>{orders.length}</span>
    },
  },
  {
    accessorKey: "total-spent",
    header: "Total Spent",
    cell: ({ row }) => {
      const orders: { totalAmountPaid: number }[] = row.getValue("orders") as {
        totalAmountPaid: number
      }[]
      const totalSpent = orders.reduce(
        (totalSpent, order) => totalSpent + order.totalAmountPaid,
        0
      )
      return <span>&#x20B9;{totalSpent}</span>
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const user = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0 outline-none">
              <span className="sr-only">Open menu</span>
              <Icon icon="material-symbols:more-horiz" width="24" height="24" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(String(user.id))}
            >
              Copy User ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View User</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
