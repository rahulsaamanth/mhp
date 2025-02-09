"use client"

import { useQuery } from "@tanstack/react-query"
import { Loader } from "lucide-react"
import React from "react"
import { getProduct } from "../_lib/actions"

function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params)

  const { data, isPending, isError, error } = useQuery({
    queryKey: ["product", id],
    queryFn: () => getProduct(id),
  })

  if (isPending)
    return (
      <div className="flex items-center justify-center gap-4 w-full h-full">
        <Loader className="size-8 animate-spin" />
        Loading...
      </div>
    )
  if (isError) return <div>Error: {(error as Error).message}</div>
  if (!data) return <div>No product found</div>

  return <div>{JSON.stringify(data)}</div>
}

export default ProductPage
