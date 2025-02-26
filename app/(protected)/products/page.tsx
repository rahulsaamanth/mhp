import { type SearchParams } from "@/types"
import { searchParamsCache } from "./_lib/validations"
import { getValidFilters } from "@/lib/data-table"
import {
  getCategoryCounts,
  getManufacturerCounts,
  getProducts,
} from "./_lib/queries"

import { FeatureFlagsProvider } from "./_components/feature-flags-provider"
import * as React from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { DateRangePicker } from "@/components/date-range-picker"
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton"
import { ProductsTable } from "./_components/products-table"
import { getCategories, getManufacturers } from "../sku-options/_lib/queries"

interface ProductPageProps {
  searchParams: Promise<SearchParams>
}

export default async function ProductsPage(props: ProductPageProps) {
  const searchParams = await props.searchParams
  const search = searchParamsCache.parse(searchParams)

  const validFilters = getValidFilters(search.filters)

  const productsPromise = getProducts({
    ...search,
    filters: validFilters,
  })

  const [categories, manufacturers] = await Promise.all([
    getCategories(),
    getManufacturers(),
  ])

  const categoryCountsPromise = getCategoryCounts()
  const manufacturerCountsPromise = getManufacturerCounts()

  const promises = Promise.all([
    productsPromise,
    categoryCountsPromise,
    manufacturerCountsPromise,
  ])

  return (
    <div className="space-y-4">
      <FeatureFlagsProvider>
        <React.Suspense fallback={<Skeleton className="h-7 w-52" />}>
          <DateRangePicker
            triggerSize="sm"
            triggerClassName="ml-auto w-56 sm:w-60"
            align="end"
            shallow={false}
          />
        </React.Suspense>
        <React.Suspense
          fallback={
            <DataTableSkeleton
              columnCount={6}
              searchableColumnCount={1}
              filterableColumnCount={2}
              cellWidths={["10rem", "40rem", "12rem", "12rem", "8rem", "8rem"]}
              shrinkZero
            />
          }
        >
          <ProductsTable
            promises={promises}
            categories={categories}
            manufacturers={manufacturers}
          />
        </React.Suspense>
      </FeatureFlagsProvider>
    </div>
  )
}
