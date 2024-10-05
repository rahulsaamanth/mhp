"use client"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"

import { formatDate } from "@/lib/formatters"

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
      return (
        <Link
          href={`products/${row.getValue("id")}`}
          className="hover:underline font-bold text-blue-400"
        >
          #{row.getValue("id")}
        </Link>
      )
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
      return (
        <span className="text-nowrap inline-block w-[200px] overflow-hidden text-ellipsis">
          {row.getValue("name")}
        </span>
      )
    },
    filterFn: "equalsString",
  },

  {
    accessorKey: "price",
    header: "Price",

    filterFn: "equalsString",
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="p-0 cursor-default"
        >
          Created
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
      const date: Date = row.getValue("createdAt")
      return <span className="text-nowrap">{formatDate(date)}</span>
    },
  },
  {
    accessorKey: "stock",
    header: "Stock",
  },
  {
    accessorKey: "category",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="p-0 cursor-default"
        >
          Category
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
      const category: { id: number; name: string; parentId: number } =
        row.getValue("category")
      return <span>{category.name}</span>
    },
  },
  {
    accessorKey: "brand",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="p-0 cursor-default"
        >
          Brand
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
      const brand: { id: number; name: string } = row.getValue("brand")
      return <span>{brand.name}</span>
    },
  },
]
