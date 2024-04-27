"use client"

import { usePathname } from "next/navigation"

export const CurrentPage = () => {
  const path = usePathname()

  return (
    <div className="w-full">
      <span>{path}</span>
    </div>
  )
}
