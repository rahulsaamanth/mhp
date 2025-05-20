"use client"

import React, { useTransition } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { toggleDiscountCodeStatus } from "../_lib/actions"
import { PowerOff, Power, Loader } from "lucide-react"

interface ToggleDiscountCodeStatusProps {
  discountCodeId: string
  isActive: boolean
}

export function ToggleDiscountCodeStatus({
  discountCodeId,
  isActive,
}: ToggleDiscountCodeStatusProps) {
  const [isPending, startTransition] = useTransition()

  const handleToggle = () => {
    startTransition(async () => {
      try {
        const result = await toggleDiscountCodeStatus(discountCodeId)
        if (result.success) {
          toast.success(
            `Discount code ${isActive ? "deactivated" : "activated"} successfully`
          )
        } else {
          toast.error(result.error || "Failed to update discount code status")
        }
      } catch (error) {
        console.error("Error updating discount code status:", error)
        toast.error("An unexpected error occurred")
      }
    })
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      disabled={isPending}
      className={
        isActive
          ? "text-green-600 hover:text-red-600 hover:bg-red-50"
          : "text-red-600 hover:text-green-600 hover:bg-green-50"
      }
      title={isActive ? "Deactivate discount code" : "Activate discount code"}
    >
      {isPending ? (
        <Loader className="h-4 w-4 animate-spin" />
      ) : isActive ? (
        <PowerOff className="h-4 w-4" />
      ) : (
        <Power className="h-4 w-4" />
      )}
      <span className="sr-only">
        {isActive ? "Deactivate" : "Activate"} discount code
      </span>
    </Button>
  )
}
