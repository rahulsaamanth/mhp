"use client"

import { type Table } from "@tanstack/react-table"
import { Download } from "lucide-react"

import { Button } from "@/components/ui/button"
import { exportTableToCSV } from "@/lib/export"

import { DeleteOrdersDialog } from "./delete-orders-dialog"
import { OrderForTable } from "@/types"
import Link from "next/link"

interface TasksTableToolbarActionsProps {
  table: Table<OrderForTable>
}

export function OrdersTableToolbarActions({
  table,
}: TasksTableToolbarActionsProps) {
  return (
    <div className="flex items-center gap-1 sm:gap-2">
      {table.getFilteredSelectedRowModel().rows.length > 0 ? (
        <DeleteOrdersDialog
          orders={table
            .getFilteredSelectedRowModel()
            .rows.map((row) => row.original)}
          onSuccess={() => table.toggleAllRowsSelected(false)}
        />
      ) : null}
      <Link href="/admin/orders/new">
        <Button variant="default" className="sm:mr-4">
          Add New Order
        </Button>
      </Link>
      <Button
        variant="outline"
        size="sm"
        onClick={() =>
          exportTableToCSV(table, {
            filename: "orders",
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
