"use client"

import { Loader } from "lucide-react"

export default function Loading() {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <Loader className="h-10 w-10 animate-spin text-foreground" />
      </div>
    </div>
  )
}
