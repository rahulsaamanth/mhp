"use client"

import React from "react"
import { getProducts } from "../_lib/queries"

import {
  DataTableAdvancedFilterField,
  DataTableFilterField,
  DataTableRowAction,
  ProductForTable,
} from "@/types"
import { getColumns } from "./products-table-columns"
import { useDataTable } from "@/hooks/use-data-table"
import { useFeatureFlags } from "./feature-flags-provider"
import { DataTable } from "@/components/data-table/data-table"
import { DataTableAdvancedToolbar } from "@/components/data-table/data-table-advanced-toolbar"
import { ProductsTableToolbarActions } from "./products-table-toobar-actions"
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar"
import { DeleteProductsDialog } from "./delete-products-dialog"

interface ProductTableProps {
  promise: Promise<Awaited<ReturnType<typeof getProducts>>>
}

export function ProductsTable({ promise }: ProductTableProps) {
  const { featureFlags } = useFeatureFlags()

  const { data, pageCount } = React.use(promise)
  console.log(data)

  const [rowAction, setRowAction] =
    React.useState<DataTableRowAction<ProductForTable> | null>(null)

  const columns = React.useMemo(
    () => getColumns({ setRowAction }),
    [setRowAction]
  )

  const filterFields: DataTableFilterField<ProductForTable>[] = [
    {
      id: "name",
      label: "Product Name",
      placeholder: "Filter products...",
    },
  ]

  const advancedFilterFields: DataTableAdvancedFilterField<ProductForTable>[] =
    [
      {
        id: "name",
        label: "Product Name",
        type: "text",
      },
      {
        id: "createdAt",
        label: "Created at",
        type: "date",
      },
    ]

  const enableAdvancedTable = featureFlags.includes("advancedTable")
  // const enableFloatingBar = featureFlags.includes("floatingBar")

  const { table } = useDataTable({
    data,
    columns,
    pageCount,
    filterFields,
    enableAdvancedFilter: enableAdvancedTable,
    initialState: {
      sorting: [{ id: "createdAt", desc: true }],
      columnPinning: { right: ["actions"] },
    },
    getRowId: (originalRow, index) => `${originalRow.id}-${index}`,
    shallow: false,
    clearOnDefault: true,
  })

  return (
    <>
      <DataTable table={table}>
        {enableAdvancedTable ? (
          <DataTableAdvancedToolbar
            table={table}
            filterFields={advancedFilterFields}
            shallow={false}
          >
            <ProductsTableToolbarActions table={table} />
          </DataTableAdvancedToolbar>
        ) : (
          <DataTableToolbar table={table} filterFields={filterFields}>
            <ProductsTableToolbarActions table={table} />
          </DataTableToolbar>
        )}
      </DataTable>
      <DeleteProductsDialog
        open={rowAction?.type === "delete"}
        onOpenChange={() => setRowAction(null)}
        products={rowAction?.row.original ? [rowAction?.row.original] : []}
        showTrigger={false}
        onSuccess={() => rowAction?.row.toggleSelected(false)}
      />
    </>
  )
}
