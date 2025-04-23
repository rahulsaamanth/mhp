"use client"

import * as React from "react"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
  /**
   * The selected date.
   */
  date?: Date | undefined
  /**
   * The function to set the date.
   */
  setDateAction: (date: Date | undefined) => void
  /**
   * The placeholder text of the calendar trigger button.
   */
  placeholder?: string
}

export function DatePicker({
  date,
  setDateAction,
  placeholder = "Select date",
}: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDateAction}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}
