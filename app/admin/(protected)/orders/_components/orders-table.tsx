"use client"

import React, { useEffect, useState } from "react"
import { getOrders, OrderDetailedInfo } from "../_lib/queries"
import {
  DataTableAdvancedFilterField,
  DataTableFilterField,
  DataTableRowAction,
  OrderForTable,
} from "@/types"
import { getColumns } from "./orders-table-columns"
import { useDataTable } from "@/hooks/use-data-table"
import { useFeatureFlags } from "./feature-flags-provider"
import { DataTableAdvancedToolbar } from "@/components/data-table/data-table-advanced-toolbar"
import { OrdersTableToolbarActions } from "./orders-table-toobar-actions"
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
import { Card } from "@/components/ui/card"
import { OrderDetailsCard } from "./order-details-card"

interface OrderTableProps {
  promise: Promise<Awaited<ReturnType<typeof getOrders>>>
}

export function OrdersTable({ promise }: OrderTableProps) {
  const isDesktop = useMediaQuery("(min-width: 1800px)")
  const isTablet = useMediaQuery("(min-width: 1440px)")

  const { featureFlags } = useFeatureFlags()
  const { data, pageCount } = React.use(promise)

  const [rowAction, setRowAction] =
    React.useState<DataTableRowAction<OrderForTable> | null>(null)

  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [orderDetails, setOrderDetails] = useState<
    Record<string, OrderDetailedInfo | null>
  >({})

  const columns = React.useMemo(
    () => getColumns({ setRowAction }),
    [setRowAction]
  )

  // Select first order by default on initial render
  useEffect(() => {
    if (data && data.length > 0 && !selectedOrderId) {
      const firstOrder = data[0]
      const orderId = firstOrder?.id
      if (orderId && typeof orderId === "string") {
        setSelectedOrderId(orderId)

        // Initialize the order details map with the first order
        setOrderDetails((prevDetails) => ({
          ...prevDetails,
          [orderId]: firstOrder as OrderDetailedInfo,
        }))
      }
    }
  }, [data, selectedOrderId])

  // Update order details when selectedOrderId changes or when new data loads
  useEffect(() => {
    if (selectedOrderId && data) {
      const order = data.find((order) => order.id === selectedOrderId)
      if (order) {
        setOrderDetails((prevDetails) => ({
          ...prevDetails,
          [selectedOrderId]: order as OrderDetailedInfo,
        }))
      }
    }
  }, [selectedOrderId, data])

  const filterFields: DataTableFilterField<OrderForTable>[] = [
    {
      id: "userName",
      label: "Customer Name",
      placeholder: "Filter orders by customers...",
    },
  ]

  const advancedFilterFields: DataTableAdvancedFilterField<OrderForTable>[] = [
    {
      id: "id",
      label: "OrderId",
      type: "text",
    },
  ]

  const enableAdvancedTable = featureFlags.includes("advancedTable")

  // Pass the data directly without modifying it since the Order type from the schema already has the required fields
  const { table } = useDataTable({
    data: data as unknown as OrderForTable[],
    columns,
    pageCount,
    filterFields,
    enableAdvancedFilter: enableAdvancedTable,
    initialState: {
      sorting: [{ id: "createdAt", desc: true }],
      columnPinning: { right: ["actions"] },
    },
    getRowId: (originalRow) => originalRow.id,
    shallow: false,
    clearOnDefault: true,
  })

  useEffect(() => {
    const alwaysVisibleColumns = [
      "select",
      "userName",
      "totalAmountPaid",
      "adminViewStatus",
    ]

    const tabletColumns = [
      "userName",
      "totalAmountPaid",
      "orderType",
      "paymentStatus",
    ]

    const desktopColumns = ["id", "createdAt"]

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

  // Handle row click to select an order
  const handleRowClick = (orderId: string) => {
    setSelectedOrderId(orderId)

    // If we already have the order details, no need to fetch again
    if (!orderDetails[orderId]) {
      const order = data.find((order) => order.id === orderId)
      if (order) {
        setOrderDetails((prevDetails) => ({
          ...prevDetails,
          [orderId]: order as OrderDetailedInfo,
        }))
      }
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      <div className="lg:col-span-3 w-full space-y-4 overflow-auto">
        {enableAdvancedTable ? (
          <DataTableAdvancedToolbar
            table={table}
            filterFields={advancedFilterFields}
            shallow={false}
          >
            <OrdersTableToolbarActions table={table} />
          </DataTableAdvancedToolbar>
        ) : (
          <DataTableToolbar table={table} filterFields={filterFields}>
            <OrdersTableToolbarActions table={table} />
          </DataTableToolbar>
        )}
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
                    data-state={
                      row.original.id === selectedOrderId
                        ? "selected"
                        : undefined
                    }
                    className={`
                      cursor-pointer border-b hover:bg-gray-50 transition-colors
                      ${row.original.id === selectedOrderId ? "bg-accent/10" : ""}
                    `}
                    onClick={() => handleRowClick(row.original.id)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-3">
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
                    colSpan={table.getAllColumns().length}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No orders found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <DataTablePagination table={table} />
      </div>

      {/* Order details panel */}
      <div className="lg:col-span-2">
        <OrderDetailsCard
          selectedOrderId={selectedOrderId}
          orders={data as unknown as OrderForTable[]}
          orderDetails={orderDetails}
          setSelectedOrderIdAction={setSelectedOrderId}
        />
      </div>
    </div>
  )
}
