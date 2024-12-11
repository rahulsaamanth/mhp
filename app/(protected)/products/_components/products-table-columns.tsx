"use client"

import { DataTableRowAction, ProductForTable } from "@/types"

import { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"

import { formatDate } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

interface GetColumnProps {
  setRowAction: React.Dispatch<
    React.SetStateAction<DataTableRowAction<ProductForTable> | null>
  >
}
export function getColumns({
  setRowAction,
}: GetColumnProps): ColumnDef<ProductForTable>[] {
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
          className="translate-y-0.5"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Selected row"
          className="translate-y-0.5"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "image",
      header: ({ column }) => <></>,
      cell: ({ row }) => (
        <img
          alt="Product image"
          className="aspect-square rounded-md object-cover"
          height="64"
          width="64"
          src={row.getValue("image")}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
      cell: ({ row }) => (
        <div className="py-4 text-wrap w-44">{row.getValue("name")}</div>
      ),
      enableSorting: true,
      enableHiding: false,
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const status = row.getValue("status")
        return (
          <Badge variant={status === "ACTIVE" ? "default" : "secondary"}>
            {status as string}
          </Badge>
        )
      },
    },
    {
      accessorKey: "minPrice",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Price" />
      ),
      cell: ({ row }) => {
        const minPrice = row.getValue("minPrice") as number
        const maxPrice = row.original.maxPrice as number

        if (minPrice === maxPrice) return `₹${minPrice}`

        return `₹${minPrice} - ₹${maxPrice}`
      },
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "sales",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Sales" />
      ),
      cell: ({ row }) => row.getValue("sales"),
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Created At" />
      ),
      cell: ({ cell }) => formatDate(cell.getValue() as Date),
    },
  ]
}
