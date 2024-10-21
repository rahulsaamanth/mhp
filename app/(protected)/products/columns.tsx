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
    accessorKey: "image",
    header: "Image",
    cell: ({ row }) => {
      return (
        <img
          src={row.getValue("image")}
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
    accessorKey: "variants",
    header: "Price",
    cell: ({ row }) => {
      const varaints = row.original.variants
      const price1 = varaints[0].price
      const price2 = varaints.at(-1).price
      return varaints.length > 1 ? (
        <span>
          {price1} - {price2}
        </span>
      ) : (
        <span>{price1}</span>
      )
    },
  },

  {
    accessorKey: "variants",
    header: "Stock",
    cell: ({ row }) => {
      const variants = row.original.variants
      const stocks = variants.map((variant: { stock: number }) => {
        return variant.stock
      })

      return (
        <div className="relative group cursor-default hover:underline">
          <span>
            {stocks.reduce((acc: number, stock: number) => acc + stock, 0)}
          </span>
          <div className="absolute bottom-8 hidden w-auto text-wrap group-hover:block">
            <span>[{stocks.join(",")}]</span>
          </div>
        </div>
      )
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
      const brand: { id: number; name: string } = row.getValue("manufacturer")
      return <span>{brand.name}</span>
    },
  },
]
