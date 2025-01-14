"use client"

import React from "react"

function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params)

  const [productDetails, setProductDetails] = React.useState({})

  React.useEffect(() => {
    async function getProductDetails(id: string) {
      const res = await fetch(`/api/products/${id}`)
      const data = await res.json()
      setProductDetails(data)
    }
    getProductDetails(id)
  }, [id])

  console.log(productDetails)

  return <>{JSON.stringify(productDetails)}</>
}

export default ProductPage
