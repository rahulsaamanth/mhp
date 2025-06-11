import { getValidFilters } from "@/lib/data-table"
import { type SearchParams } from "@/types"
import { getUsers } from "./_lib/queries"
import { searchParamsCache } from "./_lib/validations"

import { DateRangePicker } from "@/components/date-range-picker"
import * as React from "react"
import { FeatureFlagsProvider } from "./_components/feature-flags-provider"
import { UsersTable } from "./_components/users-table"

interface UsersPageProps {
  searchParams: Promise<SearchParams>
}

export default async function UsersPage(props: UsersPageProps) {
  const searchParams = await props.searchParams
  const search = searchParamsCache.parse(searchParams)

  const validFilters = getValidFilters(search.filters)

  const usersPromise = getUsers({
    ...search,
    filters: validFilters,
  })

  const promises = Promise.all([usersPromise])

  return (
    <div className="space-y-4">
      <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-6">
        <div className="flex items-center">
          <svg
            className="h-6 w-6 text-amber-500 mr-3"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
            />
          </svg>
          <div>
            <p className="font-medium text-amber-800">
              Warning: Users Page in Development
            </p>
            <p className="text-amber-700 text-sm mt-1">
              This page is currently under development and not all features are
              fully functional.
            </p>
          </div>
        </div>
      </div>
      <FeatureFlagsProvider>
        <DateRangePicker
          triggerSize="sm"
          triggerClassName="ml-auto w-56 sm:w-60"
          align="end"
          shallow={false}
        />
        <UsersTable promises={promises} />
      </FeatureFlagsProvider>
    </div>
  )
}
