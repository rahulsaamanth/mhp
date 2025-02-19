"use client"

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { Checkbox } from "@/components/ui/checkbox"
import { DataTableRowAction, Order, OrderForTable } from "@/types"
import { ColumnDef } from "@tanstack/react-table"
import Link from "next/link"
import React from "react"

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
        <div className="py-4 text-wrap w-44 hover:underline">
          <Link href={`orders/${row.original.id}`}>{row.original.id}</Link>
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "userName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Customer Name" />
      ),
      cell: ({ row }) => <span>{row.original.userName}</span>,
      enableSorting: true,
      enableHiding: false,
      enableResizing: true,
    },
  ]
}
