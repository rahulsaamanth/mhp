import { db } from "@/db/db"

export default async function OrdersPage() {
  const orders = await db.query.order.findMany()
  const orderDetails = await db.query.orderDetails.findMany()

  console.log(orders, orderDetails)

  return <div></div>
}
