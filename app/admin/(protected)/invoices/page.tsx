// /home/rahulsaamanth/Code0/mhp/app/admin/(protected)/invoices/page.tsx
import React from "react"
import { DateRangePicker } from "@/components/date-range-picker"
import { getValidFilters } from "@/lib/data-table"
import { SearchParams } from "@/types"
import { InvoicesTable } from "./_components/invoices-table"
import { searchParamsCache } from "./_lib/validations"
import { getInvoices } from "./_lib/queries"

interface InvoicePageProps {
  searchParams: Promise<SearchParams>
}

export default async function InvoicesPage(props: InvoicePageProps) {
  const searchParams = await props.searchParams
  const search = searchParamsCache.parse(searchParams)

  const validFilters = getValidFilters(search.filters)

  const invoicesPromise = getInvoices({
    ...search,
    filters: validFilters,
  })

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-4 md:gap-8 lg:grid-cols-1 xl:grid-cols-1 h-screen">
        <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-1 h-full overflow-auto">
          <div className="flex-1">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-bold">Invoices</h1>
              <DateRangePicker
                triggerSize="sm"
                triggerClassName="ml-auto w-56 sm:w-60"
                align="end"
                shallow={false}
              />
            </div>
            <div className="overflow-auto">
              <div className="w-full overflow-auto">
                <InvoicesTable promise={invoicesPromise} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
