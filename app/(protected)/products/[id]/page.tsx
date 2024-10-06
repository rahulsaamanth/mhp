import { db } from "@/drizzle/db"
import { product } from "@/drizzle/schema"
import { eq } from "drizzle-orm"

const ProductPage = async ({ params }: { params: { id: string } }) => {
  const productDetails = await db.query.product.findFirst({
    where: eq(product.id, Number(params.id)),
    with: {
      category: true,
      brand: true,
      orderDetails: true,
    },
  })
  console.log(productDetails)
  return <p>{JSON.stringify({ productDetails })}</p>
}

export default ProductPage
