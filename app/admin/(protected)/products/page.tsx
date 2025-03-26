import { getValidFilters } from "@/lib/data-table"
import { type SearchParams } from "@/types"
import {
  getCategoryCounts,
  getManufacturerCounts,
  getProducts,
  getStatusCounts,
} from "./_lib/queries"
import { searchParamsCache } from "./_lib/validations"

import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton"
import { DateRangePicker } from "@/components/date-range-picker"
import { Skeleton } from "@/components/ui/skeleton"
import { db } from "@/db/db"
import * as React from "react"
import { FeatureFlagsProvider } from "./_components/feature-flags-provider"
import { ProductsTable } from "./_components/products-table"

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
    db.query.category.findMany(),
    db.query.manufacturer.findMany(),
  ])

  const categoryCountsPromise = getCategoryCounts()
  const manufacturerCountsPromise = getManufacturerCounts()
  const statusCountsPromise = getStatusCounts()

  const promises = Promise.all([
    productsPromise,
    categoryCountsPromise,
    manufacturerCountsPromise,
    statusCountsPromise,
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
              filterableColumnCount={3}
              rowCount={20}
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
