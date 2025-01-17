"use client"

import { usePathname, useSearchParams } from "next/navigation"
import { ReactNode, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { RANGE_OPTIONS } from "@/lib/rangeOptions"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import { useRouter } from "next/navigation"
import { Calendar } from "./ui/calendar"
import { DateRange } from "react-day-picker"
import { subDays } from "date-fns"

type ChartCardProps = {
  title: string
  children: ReactNode
  queryKey?: string
  selectedRangeLabel?: string
}

export function ChartCard({
  title,
  children,
  queryKey,
  selectedRangeLabel,
}: ChartCardProps) {
  const searchParams = useSearchParams() || new URLSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 29),
    to: new Date(),
  })

  function setRange(range: keyof typeof RANGE_OPTIONS | DateRange) {
    const params = new URLSearchParams(Array.from(searchParams.entries()))
    if (typeof range === "string") {
      params.set(queryKey as string, range)
      params.delete(`${queryKey}From`)
      params.delete(`${queryKey}To`)
    } else {
      if (range.from == null || range.to == null) return

      params.delete(queryKey as string)
      params.set(`${queryKey}From`, range.from.toISOString())
      params.set(`${queryKey}To`, range.to.toISOString())
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex gap-4 justify-between items-center">
          <CardTitle>{title}</CardTitle>
          {queryKey && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">{selectedRangeLabel}</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {Object.entries(RANGE_OPTIONS).map(([key, value]) => (
                  <DropdownMenuItem
                    key={key}
                    onClick={() => setRange(key as keyof typeof RANGE_OPTIONS)}
                  >
                    {value.label}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>custom</DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <div>
                      <Calendar
                        mode="range"
                        disabled={{ after: new Date() }}
                        selected={dateRange}
                        defaultMonth={dateRange?.from}
                        onSelect={setDateRange}
                        numberOfMonths={2}
                      />
                      <DropdownMenuItem className="hover:bg:auto">
                        <Button
                          disabled={dateRange == null}
                          className="w-full"
                          onClick={() => {
                            if (dateRange == null) return
                            setRange(dateRange)
                          }}
                        >
                          Submit
                        </Button>
                      </DropdownMenuItem>
                    </div>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}
