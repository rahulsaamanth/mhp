// /home/rahulsaamanth/Code0/mhp/app/admin/(protected)/invoices/_components/invoices-table-toolbar-actions.tsx
"use client"

import { Button } from "@/components/ui/button"
import { Table } from "@tanstack/react-table"
import { Download, Send } from "lucide-react"
import { InvoiceForTable } from "@/types"

interface InvoicesTableToolbarActionsProps<TData> {
  table: Table<TData>
}

export function InvoicesTableToolbarActions<TData>({
  table,
}: InvoicesTableToolbarActionsProps<TData>) {
  const isRowsSelected = table.getSelectedRowModel().rows.length > 0

  const handleDownloadSelected = () => {
    const selectedRows = table.getSelectedRowModel().rows
    const invoices = selectedRows.map(
      (row) => row.original
    ) as unknown as InvoiceForTable[]

    // Here you would implement the download functionality for multiple invoices
    console.log("Downloading selected invoices:", invoices)
  }

  const handleSendSelected = () => {
    const selectedRows = table.getSelectedRowModel().rows
    const invoices = selectedRows.map(
      (row) => row.original
    ) as unknown as InvoiceForTable[]

    // Here you would implement the send functionality for multiple invoices
    console.log("Sending selected invoices:", invoices)
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        className="h-8 gap-1"
        disabled={!isRowsSelected}
        onClick={handleDownloadSelected}
      >
        <Download className="h-3.5 w-3.5" />
        <span className="whitespace-nowrap">Download</span>
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="h-8 gap-1"
        disabled={!isRowsSelected}
        onClick={handleSendSelected}
      >
        <Send className="h-3.5 w-3.5" />
        <span className="whitespace-nowrap">Send</span>
      </Button>
    </div>
  )
}
