import { type SearchParams } from "@/types"
import { searchParamsCache } from "./_lib/validations"
import { getValidFilters } from "@/lib/data-table"

import * as React from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { DateRangePicker } from "@/components/date-range-picker"
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton"
import { getOrders } from "./_lib/queries"
import { FeatureFlagsProvider } from "./_components/feature-flags-provider"
import { OrdersTable } from "./_components/orders-table"

interface OrderPageProps {
  searchParams: Promise<SearchParams>
}

export default async function OrdersPage(props: OrderPageProps) {
  const searchParams = await props.searchParams
  const search = searchParamsCache.parse(searchParams)

  const validFilters = getValidFilters(search.filters)

  const ordersPromise = getOrders({
    ...search,
    filters: validFilters,
  })

  return (
    // <Shell className="gap-2">
    <div className="w-full py-2 sm:px-6">
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
          <OrdersTable promise={ordersPromise} />
        </React.Suspense>
      </FeatureFlagsProvider>
    </div>
    // </Shell>
  )
}
