"use client"

import { useParams } from "next/navigation"

function ProductPage() {
  const { id } = useParams<{ id: string }>()
  console.log(id)

  return <></>
}

export default ProductPage
