import { db } from "@/db/db"
import { OrderForm } from "../_components/order-form"
import { eq } from "drizzle-orm"

export default async function CreateOrderPage() {
  const stores = await db.query.store.findMany({
    where: (s) => eq(s.isActive, true),
  })

  const users = await db.query.user.findMany({
    orderBy: (u) => u.name,
  })

  // Fetch products, categories, and manufacturers for the search component
  const products = await db.query.product.findMany({
    orderBy: (p) => p.name,
    limit: 100,
  })

  const categories = await db.query.category.findMany({
    orderBy: (c) => c.name,
  })

  const manufacturers = await db.query.manufacturer.findMany({
    orderBy: (m) => m.name,
  })

  return (
    <div className="container mx-auto py-6">
      <OrderForm
        props={{
          stores,
          users,
          products,
          categories,
          manufacturers,
        }}
        mode="create"
      />
    </div>
  )
}
