"use client"

import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { RefreshCcw } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { revalidateProducts } from "../_lib/revalidate-action"

export function RevalidateProductsButton() {
  const [isLoading, setIsLoading] = useState(false)

  const handleRevalidate = async () => {
    setIsLoading(true)
    try {
      const result = await revalidateProducts()

      if (result.success) {
        toast.success(result.message)
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error("An error occurred while revalidating products cache")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRevalidate}
            disabled={isLoading}
            className="gap-2"
          >
            <RefreshCcw
              className={`size-4 ${isLoading ? "animate-spin" : ""}`}
              aria-hidden="true"
            />
            Refresh Cache
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Manually refresh products data</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
