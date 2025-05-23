import { type SearchParams } from "@/types"
import { searchParamsCache } from "./_lib/validations"
import { getValidFilters } from "@/lib/data-table"

import * as React from "react"
import { DateRangePicker } from "@/components/date-range-picker"
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
        <DateRangePicker
          triggerSize="sm"
          triggerClassName="ml-auto w-56 sm:w-60"
          align="end"
          shallow={false}
        />
        <OrdersTable promise={ordersPromise} />
      </FeatureFlagsProvider>
    </div>
    // </Shell>
  )
}
