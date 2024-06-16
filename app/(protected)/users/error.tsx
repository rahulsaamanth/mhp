"use client"

import { Button } from "@/components/ui/button"
import { useEffect } from "react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])
  return (
    <div>
      Something went wrong!,
      <Button variant="link" onClick={() => reset()}>
        Try again
      </Button>
    </div>
  )
}
