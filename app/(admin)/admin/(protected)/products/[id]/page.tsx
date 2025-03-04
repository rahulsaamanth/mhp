import { useQuery } from "@tanstack/react-query"
import { Loader } from "lucide-react"
import React from "react"
import { getProduct } from "../_lib/actions"
import { ProductsForm } from "../_components/product-form"
import { notFound } from "next/navigation"
import {
  getCategories,
  getManufacturers,
  getTags,
} from "../../sku-options/_lib/queries"

async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const product = await getProduct(id)

  if (!product || "error" in product) notFound()

  const [categories, manufacturers, tags = []] = await Promise.all([
    getCategories(),
    getManufacturers(),
    getTags(),
  ])

  const categoryMap = Object.fromEntries(
    categories.map(({ id, name }) => [id, name])
  )

  const formattedCategories = categories
    .map(({ id, name, parentId }) => ({
      id,
      name,
      parentId,
      formattedName: parentId ? `${categoryMap[parentId]}/${name}` : name,
    }))
    .sort((a, b) => a.formattedName.localeCompare(b.formattedName))

  return (
    <ProductsForm
      mode="edit"
      productData={product}
      props={{
        categories: formattedCategories,
        manufacturers,
        tags,
      }}
    />
  )
}

export default EditProductPage
