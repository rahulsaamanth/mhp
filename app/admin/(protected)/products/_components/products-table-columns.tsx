"use client"

import { DataTableRowAction, ProductForTable } from "@/types"

import { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"

import { formatDate } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Copy, Delete, Edit, Square, Trash } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Icon } from "@iconify/react/dist/iconify.js"

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
      cell: ({ row }) => {
        const imageUrl = row.getValue("image") as string
        return (
          <div className="size-40 flex items-center justify-center overflow-hidden">
            {imageUrl ? (
              <img
                alt={`${row.getValue("name")}`}
                className="aspect-square rounded-md object-contain w-full h-full"
                src={imageUrl}
                onError={(e) => {
                  // Fallback if image fails to load
                  ;(e.target as HTMLImageElement).src = "/placeholder-image.jpg"
                }}
              />
            ) : (
              <div className="aspect-square rounded-md bg-muted w-full h-full flex items-center justify-center text-muted-foreground">
                No image
              </div>
            )}
          </div>
        )
      },
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
      cell: ({ row }) => (
        <div className="w-[150px] sm:w-full">
          <Link
            href={`products/${row.original.id}`}
            className="hover:underline block  truncate sm:overflow-visible sm:whitespace-normal"
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
        <DataTableColumnHeader
          column={column}
          title="Category"
          className="ml-2"
        />
      ),
      cell: ({ row }) => (
        <span className="text-nowrap px-2">{row.getValue("categoryName")}</span>
      ),
      enableSorting: false,
      enableHiding: true,
    },
    {
      accessorKey: "manufacturerName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Manufacturer" />
      ),
      cell: ({ row }) => (
        <span className="px-4 text-center">
          {row.getValue("manufacturerName")}
        </span>
      ),
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
      enableHiding: true,
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const status = row.getValue("status")
        const variants = {
          ACTIVE: "default",
          ARCHIVED: "secondary",
          DRAFT: "outline",
        }
        return (
          <Badge
            variant={
              variants[status as keyof typeof variants] as
                | "default"
                | "secondary"
                | "outline"
            }
            className="cursor-default"
          >
            {status as string}
          </Badge>
        )
      },
      enableSorting: false,
      enableHiding: true,
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
      enableHiding: true,
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
              <Link
                href={`https://homeosouth.com/product/${row.original.id}`}
                target="_blank"
              >
                <DropdownMenuItem>
                  <Square className="size-4 mr-2" />
                  View
                </DropdownMenuItem>
              </Link>
              <DropdownMenuItem
                onClick={() => setRowAction({ row, type: "delete" })}
              >
                <Trash className="size-4 mr-2" />
                Delete
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
