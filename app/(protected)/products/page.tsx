import { getProducts } from "@/actions/products"
import { DataTable } from "@/components/tables/data-table"
import { columns } from "./columns"

const ProductsPage = async () => {
  const products = await getProducts()
  const tableData = products.map((product) => {
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      tags: product.tags,
      category: product.category.name,
      manufacturer: product.manufacturer.name,
      prices: product.variants.map((variant) => variant.price),
      stock: product.variants.reduce((acc, variant) => acc + variant.stock, 0),
      potencies: product.variants.map((variant) => variant.potency),
      images: product.variants.map((variant) => variant.variantImage),
    }
  })
  return (
    <div className="w-full py-10">
      <DataTable data={tableData} columns={columns} />
    </div>
  )
}
export default ProductsPage
