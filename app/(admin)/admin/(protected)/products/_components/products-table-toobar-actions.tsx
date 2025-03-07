"use client"

import { type Table } from "@tanstack/react-table"
import { Download } from "lucide-react"

import { exportTableToCSV } from "@/lib/export"
import { Button } from "@/components/ui/button"

import { DeleteProductsDialog } from "./delete-products-dialog"
import { ProductForTable } from "@/types"
import Link from "next/link"

interface TasksTableToolbarActionsProps {
  table: Table<ProductForTable>
}

export function ProductsTableToolbarActions({
  table,
}: TasksTableToolbarActionsProps) {
  return (
    <div className="flex items-center gap-1 sm:gap-2">
      {table.getFilteredSelectedRowModel().rows.length > 0 ? (
        <DeleteProductsDialog
          products={table
            .getFilteredSelectedRowModel()
            .rows.map((row) => row.original)}
          onSuccess={() => table.toggleAllRowsSelected(false)}
        />
      ) : null}
      <Link href="/admin/products/new">
        <Button variant="default" className="sm:mr-4">
          Add New Product
        </Button>
      </Link>
      <Button
        variant="outline"
        size="sm"
        onClick={() =>
          exportTableToCSV(table, {
            filename: "products",
            excludeColumns: ["select", "actions"],
          })
        }
        className="gap-2"
      >
        <Download className="size-4" aria-hidden="true" />
        Export
      </Button>
      {/**
       * Other actions can be added here.
       * For example, import, view, etc.
       */}
    </div>
  )
}
