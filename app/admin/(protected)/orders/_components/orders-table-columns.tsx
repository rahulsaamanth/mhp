"use client"

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { DataTableRowAction, Order, OrderForTable } from "@/types"
import { ColumnDef } from "@tanstack/react-table"
import Link from "next/link"
import React from "react"
import { AdminStatusBadge } from "./admin-status-badge"

interface GetColumnProps {
  setRowAction: React.Dispatch<
    React.SetStateAction<DataTableRowAction<OrderForTable> | null>
  >
}

export function getColumns({
  setRowAction,
}: GetColumnProps): ColumnDef<OrderForTable>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsAllPageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="translate-y-0.5 ml-8"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Selected row"
          className="translate-y-0.5 m-8"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "id",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="OrderId" />
      ),
      cell: ({ row }) => (
        <div className="py-4 text-wrap hover:underline">
          <Link href={`orders/${row.original.id}`}>{row.original.id}</Link>
        </div>
      ),
      enableSorting: false,
      enableHiding: true,
    },
    {
      accessorKey: "userName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Customer Name" />
      ),
      cell: ({ row }) => (
        <span>
          {row.original.isGuestOrder
            ? row.original.customerName
            : row.original.userName}
        </span>
      ),
      enableSorting: true,
      enableHiding: false,
    },
    {
      accessorKey: "totalAmountPaid",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Total Amount" />
      ),
      cell: ({ row }) => (
        <span>₹{row.original.totalAmountPaid.toFixed(2)}</span>
      ),
      enableSorting: true,
      enableHiding: false,
    },
    {
      accessorKey: "orderType",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Order Type" />
      ),
      cell: ({ row }) => (
        <span className="cursor-default">
          <Badge
            variant={
              row.original.orderType.toString() === "OFFLINE"
                ? "secondary"
                : "default"
            }
          >
            {row.original.orderType.toString()}
          </Badge>
        </span>
      ),
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Order Date" />
      ),
      cell: ({ row }) => {
        const date = new Date(row.original.createdAt)
        return <span>{date.toLocaleDateString()}</span>
      },
      enableSorting: true,
      enableHiding: false,
    },
    {
      accessorKey: "paymentStatus",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Payment Status" />
      ),
      cell: ({ row }) => <span>{row.original.paymentStatus.toString()}</span>,
      enableSorting: false,
      enableHiding: true,
    },
    {
      accessorKey: "adminViewStatus",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Admin Status" />
      ),
      cell: ({ row }) => {
        const status = row.original.adminViewStatus || "NEW"
        return (
          <div className="flex items-center justify-center">
            <AdminStatusBadge status={status} />
          </div>
        )
      },
      enableSorting: true,
      enableHiding: false,
    },
  ]
}
