"use client"

import React, { useEffect } from "react"
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
import {
  Category,
  Manufacturer,
  productStatus,
} from "@rahulsaamanth/mhp_shared-schema"
import { useDataTable } from "@/hooks/use-data-table"
import { DeleteProductsDialog } from "./delete-products-dialog"
import { useFeatureFlags } from "./feature-flags-provider"
import { getColumns } from "./products-table-columns"
import { ProductsTableToolbarActions } from "./products-table-toobar-actions"
import { useMediaQuery } from "@/hooks/use-media-query"

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
  const isDesktop = useMediaQuery("(min-width: 1440px)")
  const isTablet = useMediaQuery("(min-width: 1024px)")
  const isMobile = useMediaQuery("(min-width: 768px)")

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

  const getResponsiveFilterFields = () => {
    const baseFields: DataTableFilterField<ProductWithComputedFields>[] = [
      {
        id: "name",
        label: "Product Name",
        placeholder: "Filter products...",
      },
    ]

    if (isMobile) {
      baseFields.push({
        id: "categoryName",
        label: "Category",
        options: categories.map((category) => ({
          label: category.name,
          value: category.name,
          count: categoryCounts[category.name],
        })),
      })
    }

    if (isTablet) {
      baseFields.push({
        id: "manufacturerName",
        label: "Manufacturer",
        options: manufacturers.map((manufacturer) => ({
          label: manufacturer.name,
          value: manufacturer.name,
          count: manufacturerCounts[manufacturer.name],
        })),
      })
    }

    if (isDesktop) {
      baseFields.push({
        id: "status",
        label: "Status",
        options: productStatus.enumValues.map((status) => ({
          label: status,
          value: status,
          count: statusCounts[status],
        })),
      })
    }

    return baseFields
  }

  const filterFields: DataTableFilterField<ProductWithComputedFields>[] =
    getResponsiveFilterFields()

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

  useEffect(() => {
    const alwaysVisibleColumns = ["select", "image", "name", "actions"]

    const tabletColumns = ["status", "minPrice", "stock"]

    const desktopColumns = [
      "categoryName",
      "manufacturerName",
      "sales",
      "createdAt",
    ]

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
