"use client"

import React from "react"
import {
  getCategoryCounts,
  getManufacturerCounts,
  getProducts,
  getStatusCounts,
} from "../_lib/queries"

import {
  DataTableAdvancedFilterField,
  DataTableFilterField,
  DataTableRowAction,
  ProductForTable,
  ProductWithComputedFields,
} from "@/types"

import { DataTable } from "@/components/data-table/data-table"
import { DataTableAdvancedToolbar } from "@/components/data-table/data-table-advanced-toolbar"
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar"
import { Category, Manufacturer, productStatus } from "@/db/schema"
import { useDataTable } from "@/hooks/use-data-table"
import { DeleteProductsDialog } from "./delete-products-dialog"
import { useFeatureFlags } from "./feature-flags-provider"
import { getColumns } from "./products-table-columns"
import { ProductsTableToolbarActions } from "./products-table-toobar-actions"

type ProductTableProps = {
  promises: Promise<
    [
      Awaited<ReturnType<typeof getProducts>>,
      Awaited<ReturnType<typeof getCategoryCounts>>,
      Awaited<ReturnType<typeof getManufacturerCounts>>,
      Awaited<ReturnType<typeof getStatusCounts>>,
    ]
  >
  categories: Category[]
  manufacturers: Manufacturer[]
}

export function ProductsTable({
  promises,
  categories,
  manufacturers,
}: ProductTableProps) {
  const { featureFlags } = useFeatureFlags()

  const [
    { data, pageCount },
    categoryCounts,
    manufacturerCounts,
    statusCounts,
  ] = React.use(promises)

  const [rowAction, setRowAction] =
    React.useState<DataTableRowAction<ProductForTable> | null>(null)

  const columns = React.useMemo(
    () => getColumns({ setRowAction }),
    [setRowAction]
  )

  const filterFields: DataTableFilterField<ProductWithComputedFields>[] = [
    {
      id: "name",
      label: "Product Name",
      placeholder: "Filter products...",
    },
    {
      id: "categoryName",
      label: "Category",
      options: categories.map((category) => ({
        label: category.name,
        value: category.name,
        count: categoryCounts[category.name],
      })),
    },
    {
      id: "manufacturerName",
      label: "Manufacturer",
      options: manufacturers.map((manufacturer) => ({
        label: manufacturer.name,
        value: manufacturer.name,
        count: manufacturerCounts[manufacturer.name],
      })),
    },
    {
      id: "status",
      label: "Status",
      options: productStatus.enumValues.map((status) => ({
        label: status,
        value: status,
        count: statusCounts[status],
      })),
    },
  ]

  const advancedFilterFields: DataTableAdvancedFilterField<ProductWithComputedFields>[] =
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
