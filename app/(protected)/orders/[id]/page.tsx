import { db } from "@/db/db"
import { order } from "@/db/schema"
import { JsonViewer } from "@/utils/json-viewer"
import { eq } from "drizzle-orm"

export default async function EditOrderPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const _order = await db.query.order.findFirst({
    where: eq(order.id, id),
    with: {
      user: true,
      shippingAddres: true,
      billingAddress: true,
      orderDetails: true,
    },
  })

  return <JsonViewer data={_order} />
}
