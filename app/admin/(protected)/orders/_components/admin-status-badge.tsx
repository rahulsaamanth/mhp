"use client"

import { cn } from "@/lib/utils"

type AdminViewStatus = "NEW" | "OPENED" | "PROCESSING" | "CLOSED"

interface AdminStatusBadgeProps {
  status: AdminViewStatus
  className?: string
}

const statusConfig: Record<
  AdminViewStatus,
  { label: string; colorClass: string }
> = {
  NEW: {
    label: "New",
    colorClass: "bg-blue-100 text-blue-800",
  },
  OPENED: {
    label: "Opened",
    colorClass: "bg-purple-100 text-purple-800",
  },
  PROCESSING: {
    label: "Processing",
    colorClass: "bg-yellow-100 text-yellow-800",
  },
  CLOSED: {
    label: "Closed",
    colorClass: "bg-green-100 text-green-800",
  },
}

export function AdminStatusBadge({ status, className }: AdminStatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.NEW

  return (
    <span
      className={cn(
        "px-2 py-1 text-xs font-medium",
        config.colorClass,
        className
      )}
    >
      {config.label}
    </span>
  )
}
