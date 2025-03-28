"use client"

import { db } from "@/db/db"
import { order } from "@rahulsaamanth/mhp-schema"
import { JsonViewer } from "@/utils/json-viewer"
import { useQuery } from "@tanstack/react-query"
import { eq } from "drizzle-orm"
import React from "react"
import { getOrder } from "../_lib/actions"
import { notFound } from "next/navigation"

export default function EditOrderPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = React.use(params)

  const { data, isPending, isError } = useQuery({
    queryKey: ["orders", id],
    queryFn: () => getOrder(id),
  })

  if (isError) notFound()

  if (isPending) return <div>Loading...</div>

  return <JsonViewer data={data} />
}
