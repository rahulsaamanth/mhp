"use client"

import React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { AdminStatusBadge } from "./admin-status-badge"
import { updateOrderAdminStatus } from "../_lib/actions"
import { toast } from "sonner"

type AdminViewStatus = "NEW" | "OPENED" | "PROCESSING" | "CLOSED"

const statuses: { value: AdminViewStatus; label: string }[] = [
  { value: "NEW", label: "New" },
  { value: "OPENED", label: "Opened" },
  { value: "PROCESSING", label: "Processing" },
  { value: "CLOSED", label: "Closed" },
]

interface AdminStatusSelectorProps {
  orderId: string
  currentStatus: AdminViewStatus
  onStatusChange?: (newStatus: AdminViewStatus) => void
  className?: string
}

export function AdminStatusSelector({
  orderId,
  currentStatus,
  onStatusChange,
  className,
}: AdminStatusSelectorProps) {
  const [open, setOpen] = React.useState(false)
  const [value, setValue] = React.useState<AdminViewStatus>(currentStatus)

  // Update value when currentStatus changes (e.g., when selecting a different order)
  React.useEffect(() => {
    setValue(currentStatus)
  }, [currentStatus, orderId])

  const handleStatusChange = async (status: AdminViewStatus) => {
    setValue(status)
    setOpen(false)

    try {
      // Call an API to update the status in the database
      await updateOrderAdminStatus(orderId, status)

      if (onStatusChange) {
        onStatusChange(status)
      }

      toast.success("Order status updated successfully")
    } catch (error) {
      console.error("Failed to update order status:", error)
      toast.error("Failed to update order status")
      setValue(currentStatus) // Revert to previous status on error
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("justify-between", className)}
        >
          <AdminStatusBadge status={value} />
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search status..." />
          <CommandEmpty>No status found.</CommandEmpty>
          <CommandGroup>
            {statuses.map((status) => (
              <CommandItem
                key={status.value}
                value={status.value}
                onSelect={() =>
                  handleStatusChange(status.value as AdminViewStatus)
                }
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === status.value ? "opacity-100" : "opacity-0"
                  )}
                />
                <AdminStatusBadge status={status.value as AdminViewStatus} />
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
