import { getProducts } from "@/actions/products"
import { DataTable } from "@/components/tables/data-table"
import { columns } from "./columns"

const ProductsPage = async () => {
  const products = await getProducts()
  console.log(products)
  return (
    <div className="w-full py-10">
      {/* <DataTable data={products} columns={columns} /> */}
      {JSON.stringify(products)}
    </div>
  )
}
export default ProductsPage
