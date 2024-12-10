import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { db } from "@/db/db"
import { order, user } from "@/db/schema"
import { count, eq, sql, sum } from "drizzle-orm"
import { Boxes, DollarSign, ShoppingCart, Users } from "lucide-react"

async function getSalesData() {
  const [data] = await db
    .select({
      salesCount: count(),
      totalAmount: sum(order.totalAmountPaid),
    })
    .from(order)

  return {
    amount: data?.totalAmount,
    numberOfSales: data?.salesCount,
  }
}

async function getUserData() {
  const [data] = await db
    .select({
      usersWithOrders: sql<number>`count(distinct case when ${order.id} is not null then ${user.id} end)`,
      totalUsers: count(),
    })
    .from(user)
    .where(eq(user.role, "USER"))
    .leftJoin(order, eq(user.id, order.userId))

  return {
    activeUsers: data?.usersWithOrders,
    totalUsers: data?.totalUsers,
  }
}

const DashboardPage = async () => {
  const salesData = await getSalesData()
  const userData = await getUserData()
  console.log(salesData, userData)
  return (
    <main className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">+2300</div>
          <p className="text-xs text-muted-foreground">
            +18.01% from last month
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Sales</CardTitle>
          <ShoppingCart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">+1200</div>
          <p className="text-xs text-muted-foreground">+19% from last month</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Products</CardTitle>
          <Boxes className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">4632</div>
          <p className="text-xs text-muted-foreground">+201 from last month</p>
        </CardContent>
      </Card>
    </main>
  )
}

export default DashboardPage
