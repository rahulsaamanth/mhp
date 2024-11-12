import { type SearchParams } from "@/types"
import { searchParamsCache } from "./_lib/validations"
import { getValidFilters } from "@/lib/data-table"
import { getProducts } from "./_lib/queries"
import { Shell } from "@/components/shell"
import { FeatureFlagsProvider } from "./_components/feature-flags-provider"
import * as React from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { DateRangePicker } from "@/components/date-range-picker"
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton"
import { ProductsTable } from "./_components/products-table"
// import { getProductsWithFullDetials } from "@/actions/products"

interface ProductPageProps {
  searchParams: Promise<SearchParams>
}

export default async function ProductPage(props: ProductPageProps) {
  const searchParams = await props.searchParams
  const search = searchParamsCache.parse(searchParams)

  const validFilters = getValidFilters(search.filters)

  const productsPromise = getProducts({
    ...search,
    filters: validFilters,
  })

  return (
    <Shell className="gap-2">
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
          <ProductsTable promise={productsPromise} />
        </React.Suspense>
      </FeatureFlagsProvider>
    </Shell>
  )
}
