// /home/rahulsaamanth/Code0/mhp/app/admin/(protected)/invoices/_components/invoices-table.tsx
"use client"

import React, { useEffect, useState } from "react"
import { getInvoices, InvoiceDetailedInfo } from "../_lib/queries"
import {
  DataTableAdvancedFilterField,
  DataTableFilterField,
  DataTableRowAction,
  InvoiceForTable,
} from "@/types"
import { getColumns } from "./invoices-table-columns"
import { useDataTable } from "@/hooks/use-data-table"
import { DataTableAdvancedToolbar } from "@/components/data-table/data-table-advanced-toolbar"
import { InvoicesTableToolbarActions } from "./invoices-toolbar-actions"
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar"
import { useMediaQuery } from "@/hooks/use-media-query"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { flexRender } from "@tanstack/react-table"
import { DataTablePagination } from "@/components/data-table/data-table-pagination"
import { InvoiceDetailsModal } from "./invoice-details-modal"

interface InvoiceTableProps {
  promise: Promise<Awaited<ReturnType<typeof getInvoices>>>
}

export function InvoicesTable({ promise }: InvoiceTableProps) {
  const isDesktop = useMediaQuery("(min-width: 1800px)")
  const isTablet = useMediaQuery("(min-width: 1440px)")

  const { data, pageCount } = React.use(promise)

  const [rowAction, setRowAction] =
    React.useState<DataTableRowAction<InvoiceForTable> | null>(null)

  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(
    null
  )
  const [invoiceDetails, setInvoiceDetails] = useState<
    Record<string, InvoiceDetailedInfo | null>
  >({})
  const [isModalOpen, setIsModalOpen] = useState(false)

  const columns = React.useMemo(
    () =>
      getColumns({
        setRowAction,
        onViewInvoice: (id) => {
          setSelectedInvoiceId(id)
          setIsModalOpen(true)
        },
      }),
    [setRowAction]
  )

  // Update invoice details when selectedInvoiceId changes or when new data loads
  useEffect(() => {
    if (selectedInvoiceId && data) {
      const invoice = data.find((invoice) => invoice.id === selectedInvoiceId)
      if (invoice) {
        setInvoiceDetails((prevDetails) => ({
          ...prevDetails,
          [selectedInvoiceId]: invoice as unknown as InvoiceDetailedInfo,
        }))
      }
    }
  }, [selectedInvoiceId, data])

  const filterFields: DataTableFilterField<InvoiceForTable>[] = [
    {
      id: "userName",
      label: "Customer Name",
      placeholder: "Filter invoices by customers...",
    },
    {
      id: "invoiceNumber",
      label: "Invoice Number",
      placeholder: "Filter by invoice number...",
    },
  ]

  const advancedFilterFields: DataTableAdvancedFilterField<InvoiceForTable>[] =
    [
      {
        id: "id",
        label: "OrderId",
        type: "text",
      },
      {
        id: "invoiceNumber",
        label: "Invoice Number",
        type: "text",
      },
    ]

  // Create a TableForData type that includes dummy invoiceDetails property to match InvoiceForTable type
  const tableData = data.map((invoice) => ({
    ...invoice,
    invoiceDetails: [], // Add empty invoiceDetails to satisfy the type
  }))

  const { table } = useDataTable({
    data: tableData as unknown as InvoiceForTable[],
    columns,
    pageCount,
    filterFields,
    enableAdvancedFilter: false,
    initialState: {
      sorting: [{ id: "orderDate", desc: true }],
      columnPinning: { right: ["actions"] },
    },
    getRowId: (originalRow, index) => `${originalRow.id}-${index}`,
    shallow: false,
    clearOnDefault: true,
  })

  useEffect(() => {
    const alwaysVisibleColumns = [
      "select",
      "userName",
      "totalAmountPaid",
      "invoiceNumber",
    ]

    const tabletColumns = [
      "userName",
      "totalAmountPaid",
      "invoiceNumber",
      "paymentStatus",
    ]

    const desktopColumns = ["id", "orderDate"]

    table.getAllColumns().forEach((column) => {
      const columnId = column.id

      if (alwaysVisibleColumns.includes(columnId)) {
        column.toggleVisibility(true)
        return
      }

      if (desktopColumns.includes(columnId)) {
        column.toggleVisibility(isDesktop)
        return
      }

      if (tabletColumns.includes(columnId)) {
        column.toggleVisibility(isTablet)
      }
    })
  }, [isDesktop, isTablet, table])

  // Handle row click to select an invoice
  const handleRowClick = (invoiceId: string) => {
    setSelectedInvoiceId(invoiceId)
    setIsModalOpen(true)

    // If we already have the invoice details, no need to fetch again
    if (!invoiceDetails[invoiceId]) {
      const invoice = data.find((invoice) => invoice.id === invoiceId)
      if (invoice) {
        setInvoiceDetails((prevDetails) => ({
          ...prevDetails,
          [invoiceId]: invoice as unknown as InvoiceDetailedInfo,
        }))
      }
    }
  }

  return (
    <div className="w-full space-y-4 overflow-auto">
      <DataTableToolbar table={table} filterFields={filterFields}>
        <InvoicesTableToolbarActions table={table} />
      </DataTableToolbar>

      <div className="overflow-hidden rounded-md border shadow-sm bg-white">
        <Table className="data-table w-full">
          <TableHeader className="bg-gray-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="border-b hover:bg-transparent"
              >
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="font-medium text-muted-foreground"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="cursor-pointer"
                  onClick={() => handleRowClick(row.original.id)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No invoices found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <DataTablePagination table={table} />

      {/* Invoice Details Modal */}
      {selectedInvoiceId && (
        <InvoiceDetailsModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          invoiceDetails={invoiceDetails[selectedInvoiceId] || null}
        />
      )}
    </div>
  )
}
