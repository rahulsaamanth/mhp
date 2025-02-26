"use client"

import { DataTableRowAction, ProductForTable } from "@/types"

import { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"

import { formatDate } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Copy, Edit } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Icon } from "@iconify/react/dist/iconify.js"

import { useRouter } from "next/navigation"

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
      accessorKey: "image",
      header: ({ column }) => <></>,
      cell: ({ row }) => (
        <div className="size-40 flex items-center justify-center overflow-hidden">
          <img
            alt="failed to load"
            className="aspect-square rounded-md object-contain w-full h-full"
            src={row.getValue("image")}
          />
        </div>
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
        <div className="py-4 text-wrap w-44">
          <Link
            href={`products/${row.original.id}`}
            className="hover:underline"
          >
            {row.getValue("name")}
          </Link>
        </div>
      ),
      enableSorting: true,
      enableHiding: false,
    },
    {
      accessorKey: "categoryName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Category" />
      ),
      cell: ({ row }) => (
        <span className="pl-4">{row.getValue("categoryName")}</span>
      ),
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: "manufacturerName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Manufacturer" />
      ),
      cell: ({ row }) => (
        <span className="pl-4">{row.getValue("manufacturerName")}</span>
      ),
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const status = row.getValue("status")
        return (
          <Badge variant={status === "ACTIVE" ? "secondary" : "outline"}>
            {status as string}
          </Badge>
        )
      },
      enableSorting: false,
      enableHiding: true,
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
      accessorKey: "stock",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Stock" />
      ),
      cell: ({ row }) => {
        const stock = row.getValue("stock") as number
        return <span className="pl-4">{stock}</span>
      },
      enableHiding: true,
      enableSorting: true,
    },
    {
      accessorKey: "sales",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Sales" />
      ),
      cell: ({ row }) => <span className="pl-4">{row.getValue("sales")}</span>,

      enableHiding: true,
      enableSorting: true,
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Created At" />
      ),
      cell: ({ cell }) => (
        <span className="pr-4">{formatDate(cell.getValue() as Date)}</span>
      ),
      enableSorting: true,
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
                <Icon
                  icon="material-symbols:more-horiz"
                  width="24"
                  height="24"
                />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(String(user.id))}
                className="cursor-copy"
              >
                <Copy className="size-4 mr-2" /> Copy ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>View Product</DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setRowAction({ row, type: "delete" })}
              >
                Delete Product
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
      enableSorting: false,
      enableHiding: false,
    },
  ]
}
