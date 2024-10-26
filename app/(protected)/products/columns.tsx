"use client"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"

import { Icon } from "@iconify/react/dist/iconify.js"

import { ColumnDef } from "@tanstack/react-table"
import Link from "next/link"

export const columns: ColumnDef<any, any>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
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
    cell: ({ row }) => {
      return <span>{row.getValue("id")}</span>
    },
  },
  {
    accessorKey: "images",
    header: "Image",
    cell: ({ row }) => {
      const imageSrc: string[] = row.getValue("images")

      return (
        <img
          src={imageSrc[0]}
          alt="failed to load product image"
          className="w-[100px] h-[100px] object-cover"
        />
      )
    },
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
      const category = row.original.category
      return (
        <div className="flex-col flex">
          <Link
            href={`products/${row.getValue("id")}`}
            className="hover:underline font-semibold max-w-48"
          >
            {row.getValue("name")}
          </Link>
          <span className="text-sm text-muted-foreground">
            {category?.name}
          </span>
        </div>
      )
    },
    filterFn: "equalsString",
  },

  {
    accessorKey: "prices",
    header: "Price",
    cell: ({ row }) => {
      const prices: number[] = row.getValue("prices")
      const price1 = prices[0]
      const price2 = prices.at(-1)
      return prices.length > 1 ? (
        <span>
          {price1} - {price2}
        </span>
      ) : (
        <span>{price1}</span>
      )
    },
  },

  {
    accessorKey: "stock",
    header: "Stock",
    cell: ({ row }) => {
      return <span>{row.getValue("stock")}</span>
    },
  },

  {
    accessorKey: "manufacturer",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="p-0 cursor-default"
        >
          Manufacturer
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
      const brand: string = row.getValue("manufacturer")
      return <span>{brand}</span>
    },
  },
]
