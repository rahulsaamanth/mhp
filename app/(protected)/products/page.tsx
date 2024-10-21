import { getProducts } from "@/actions/products"
import { DataTable } from "@/components/tables/data-table"
import { columns } from "./columns"

const ProductsPage = async () => {
  const products = await getProducts()

  return (
    <div className="w-full py-10">
      <DataTable data={products} columns={columns} />
    </div>
  )
}
export default ProductsPage
