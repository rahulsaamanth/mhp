"use client"

import { Button } from "@/components/ui/button"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const router = useRouter()
  useEffect(() => {
    console.error(error)
  }, [error])
  return (
    <div>
      Something went wrong!,
      <Button variant="link" onClick={() => router.refresh()}>
        Try again
      </Button>
    </div>
  )
}
