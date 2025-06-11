"use client"

import React, { useEffect } from "react"
import { getUsers } from "../_lib/queries"
import { UsersWithOrders } from "@/actions/users"
import { getColumns } from "./users-table-columns"

import {
  DataTableAdvancedFilterField,
  DataTableFilterField,
  DataTableRowAction,
} from "@/types"

import { DataTable } from "@/components/data-table/data-table"
import { DataTableAdvancedToolbar } from "@/components/data-table/data-table-advanced-toolbar"
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar"
import { useDataTable } from "@/hooks/use-data-table"
import { useFeatureFlags } from "./feature-flags-provider"
import { useMediaQuery } from "@/hooks/use-media-query"

type UsersTableProps = {
  promises: Promise<[Awaited<ReturnType<typeof getUsers>>]>
}

export function UsersTable({ promises }: UsersTableProps) {
  const isDesktop = useMediaQuery("(min-width: 1440px)")
  const isTablet = useMediaQuery("(min-width: 1024px)")
  const isMobile = useMediaQuery("(min-width: 768px)")

  const { featureFlags } = useFeatureFlags()

  const [{ data, pageCount }] = React.use(promises)

  const [rowAction, setRowAction] =
    React.useState<DataTableRowAction<UsersWithOrders> | null>(null)

  const columns = React.useMemo(
    () => getColumns({ setRowAction }),
    [setRowAction]
  )

  const filterFields: DataTableFilterField<UsersWithOrders>[] = [
    {
      id: "name",
      label: "Name",
      placeholder: "Filter users...",
    },
  ]

  if (isMobile) {
    filterFields.push({
      id: "email",
      label: "Email",
      placeholder: "Filter by email...",
    })
  }

  if (isTablet) {
    filterFields.push({
      id: "phone",
      label: "Phone",
      placeholder: "Filter by phone...",
    })
  }

  const advancedFilterFields: DataTableAdvancedFilterField<UsersWithOrders>[] = [
    {
      id: "name",
      label: "User Name",
      type: "text",
    },
    {
      id: "email",
      label: "Email",
      type: "text",
    },
    {
      id: "phone",
      label: "Phone",
      type: "text",
    },
    {
      id: "createdAt",
      label: "Joined At",
      type: "date",
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
      sorting: [{ id: "createdAt", desc: true }],
      columnPinning: { right: ["actions"] },
      columnVisibility: {
        createdAt: false,
      },
    },
    getRowId: (originalRow, index) => `${originalRow.id}-${index}`,
    shallow: false,
    clearOnDefault: true,
  })

  useEffect(() => {
    const alwaysVisibleColumns = ["select", "name", "email", "actions"]

    const tabletColumns = ["orders", "total-spent", "phone"]

    const desktopColumns = ["id", "createdAt", "emailVerified"]

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
    <>
      <DataTable table={table}>
        {enableAdvancedTable ? (
          <DataTableAdvancedToolbar
            table={table}
            filterFields={advancedFilterFields}
            shallow={false}
          />
        ) : (
          <DataTableToolbar table={table} filterFields={filterFields} />
        )}
      </DataTable>
    </>
  )
}
