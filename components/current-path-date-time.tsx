"use client"

import { usePathname } from "next/navigation"
import React, { useEffect, useState } from "react"

export const CurrentPathAndDateTime = () => {
  const path = usePathname()

  const [date, setDate] = React.useState(new Date())

  const [showDateTime, setShowDateTime] = useState(false)

  useEffect(() => {
    setShowDateTime(true)
  }, [])

  useEffect(() => {
    let timer = setInterval(() => setDate(new Date()), 1000)
    return () => clearInterval(timer)
  })

  return (
    <section className="flex w-full items-center justify-between rounded-md border bg-white px-6 py-4 shadow-lg shadow-zinc-200">
      <span className="text-xl sm:text-2xl">
        <span className="text-gray-400">admin&nbsp;/&nbsp;</span>
        {path.replace("/", "").replaceAll("/", " / ")}
      </span>
      {showDateTime && (
        <div className="w-max space-x-3 border-2 border-[#069307] px-2 py-2 font-bold text-[#069307] max-sm:hidden sm:px-4">
          <span>{date.toLocaleDateString()}</span>
          <span>{date.toLocaleTimeString()}</span>
        </div>
      )}
    </section>
  )
}
