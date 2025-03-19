"use client"

import React, { useEffect } from "react"
import { getOrders } from "../_lib/queries"
import {
  DataTableAdvancedFilterField,
  DataTableFilterField,
  DataTableRowAction,
  OrderForTable,
} from "@/types"
import { getColumns } from "./orders-table-columns"
import { useDataTable } from "@/hooks/use-data-table"
import { useFeatureFlags } from "./feature-flags-provider"
import { DataTable } from "@/components/data-table/data-table"
import { DataTableAdvancedToolbar } from "@/components/data-table/data-table-advanced-toolbar"
import { OrdersTableToolbarActions } from "./orders-table-toobar-actions"
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar"
import { useMediaQuery } from "@/hooks/use-media-query"

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

  const columns = React.useMemo(
    () => getColumns({ setRowAction }),
    [setRowAction]
  )

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

  const { table } = useDataTable({
    data,
    columns,
    pageCount,
    filterFields,
    enableAdvancedFilter: enableAdvancedTable,
    initialState: {
      sorting: [{ id: "orderDate", desc: true }],
      columnPinning: { right: ["actions"] },
    },
    getRowId: (originalRow, index) => `${originalRow.id}-${index}`,
    shallow: false,
    clearOnDefault: true,
  })

  useEffect(() => {
    const alwaysVisibleColumns = ["select", "userName", "totalAmountPaid"]

    const tabletColumns = [
      "userName",
      "totalAmountPaid",
      "orderType",
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

  return (
    <section>
      <DataTable table={table}>
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
      </DataTable>
    </section>
  )
}
