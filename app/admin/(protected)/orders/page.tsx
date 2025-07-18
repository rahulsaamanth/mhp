import React from "react"
import { DateRangePicker } from "@/components/date-range-picker"
import { Card } from "@/components/ui/card"
import { getValidFilters } from "@/lib/data-table"
import { SearchParams } from "@/types"
import { FeatureFlagsProvider } from "./_components/feature-flags-provider"
import { getOrders } from "./_lib/queries"
import { searchParamsCache } from "./_lib/validations"
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
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-2 h-screen">
        <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2 h-full overflow-auto">
          <div className="flex-1">
            <FeatureFlagsProvider>
              <div className="flex justify-end mb-4">
                <DateRangePicker
                  triggerSize="sm"
                  triggerClassName="ml-auto w-56 sm:w-60"
                  align="end"
                  shallow={false}
                />
              </div>
              <div className="overflow-auto">
                <div className="w-full overflow-auto">
                  <OrdersTable promise={ordersPromise} />
                </div>
              </div>
            </FeatureFlagsProvider>
          </div>
        </div>
      </main>
    </div>
  )
}
