// File: /app/admin/(protected)/orders/new/page.tsx
import { db } from "@/db/db"
import { OrderForm } from "../_components/order-form"
import { eq } from "drizzle-orm"

export default async function CreateOrderPage() {
  // Fetch stores for the form
  const stores = await db.query.store.findMany({
    where: (s) => eq(s.isActive, true),
  })

  // Fetch users for the form
  const users = await db.query.user.findMany({
    orderBy: (u) => u.name,
  })

  return (
    <div className="container mx-auto py-6">
      <OrderForm
        props={{
          stores,
          users,
        }}
        mode="create"
      />
    </div>
  )
}
