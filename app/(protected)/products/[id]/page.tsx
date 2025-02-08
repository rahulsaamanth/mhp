"use client"

import { getProduct } from "../_lib/actions"
import { useQuery } from "@tanstack/react-query"
import React from "react"

function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params)

  const { data, isPending, isError, error } = useQuery({
    queryKey: ["product", id],
    queryFn: () => getProduct(id),
  })

  if (isPending) return <div>Loading...</div>
  if (isError) return <div>Error: {(error as Error).message}</div>
  if (!data) return <div>No product found</div>

  return <div>{JSON.stringify(data)}</div>
}

export default ProductPage
