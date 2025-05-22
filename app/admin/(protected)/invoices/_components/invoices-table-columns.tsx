// /home/rahulsaamanth/Code0/mhp/app/admin/(protected)/invoices/_components/invoices-table-columns.tsx
"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { DataTableRowAction, InvoiceForTable } from "@/types"
import { Eye, Download, Send } from "lucide-react"
import { formatCurrency } from "@/lib/formatters"

interface GetColumnsOptions {
  setRowAction: React.Dispatch<
    React.SetStateAction<DataTableRowAction<InvoiceForTable> | null>
  >
  onViewInvoice: (id: string) => void
}

export function getColumns({ setRowAction, onViewInvoice }: GetColumnsOptions) {
  const columns: ColumnDef<InvoiceForTable>[] = [
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
          className="translate-y-[2px]"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="translate-y-[2px]"
          onClick={(e) => e.stopPropagation()}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "invoiceNumber",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Invoice Number" />
      ),
      cell: ({ row }) => {
        return (
          <div className="font-medium">
            {row.original.invoiceNumber || "N/A"}
          </div>
        )
      },
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: "id",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Order ID" />
      ),
      cell: ({ row }) => {
        return <div className="font-medium">{row.original.id}</div>
      },
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: "userName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Customer" />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex flex-col">
            <span className="font-medium">
              {row.original.isGuestOrder
                ? row.original.customerName
                : row.original.userName}
            </span>
            <span className="text-xs text-muted-foreground">
              {row.original.isGuestOrder
                ? row.original.customerEmail
                : row.original.userEmail}
            </span>
          </div>
        )
      },
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Date" />
      ),
      cell: ({ row }) => {
        return (
          <div>{new Date(row.original.createdAt).toLocaleDateString()}</div>
        )
      },
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: "totalAmountPaid",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Amount" />
      ),
      cell: ({ row }) => {
        return (
          <div className="font-medium">
            {formatCurrency(row.original.totalAmountPaid)}
          </div>
        )
      },
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: "paymentStatus",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Payment Status" />
      ),
      cell: ({ row }) => {
        const status = row.original.paymentStatus

        let variant: "outline" | "secondary" | "destructive" = "outline"

        if (status === "PAID") {
          variant = "secondary"
        } else if (status === "FAILED") {
          variant = "destructive"
        }

        return (
          <Badge variant={variant} className="capitalize">
            {status.toLowerCase().replace("_", " ")}
          </Badge>
        )
      },
      enableSorting: true,
      enableHiding: true,
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const invoice = row.original

        return (
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onViewInvoice(invoice.id)}
              title="View Invoice"
            >
              <Eye className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setRowAction({
                  row,
                  type: "download",
                })
              }}
              title="Download Invoice"
            >
              <Download className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setRowAction({
                  row,
                  type: "send",
                })
              }}
              title="Send to Customer"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        )
      },
    },
  ]

  return columns
}
