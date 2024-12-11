import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { db } from "@/db/db"
import { order, product, user } from "@/db/schema"

import { count, eq, sql, sum } from "drizzle-orm"
import {
  Boxes,
  DollarSign,
  LucideIcon,
  ShoppingCart,
  Users,
} from "lucide-react"

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

async function getProdcutsData() {
  const [data] = await db
    .select({
      totalProducts: count(),
      activeProducts: sql<number>`count(case when ${product.status} = 'ACTIVE' then 1 end)`,
    })
    .from(product)

  return {
    totalProductCount: data?.totalProducts,
    activeProuductCount: data?.activeProducts,
  }
}

export default async function DashboardPage() {
  const [salesData, userData, productData] = await Promise.all([
    getSalesData(),
    getUserData(),
    getProdcutsData(),
  ])

  return (
    <div>
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <DashboardCard
          title="Sales"
          body={
            <span className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
              >
                <path
                  fill="currentColor"
                  d="M13.725 21L7 14v-2h3.5q1.325 0 2.288-.862T13.95 9H6V7h7.65q-.425-.875-1.263-1.437T10.5 5H6V3h12v2h-3.25q.35.425.625.925T15.8 7H18v2h-2.025q-.2 2.125-1.75 3.563T10.5 14h-.725l6.725 7z"
                />
              </svg>
              {salesData.amount}
            </span>
          }
          Icon={ShoppingCart}
          footerTitle="Total orders"
          footerValue={salesData.numberOfSales}
        />
        <DashboardCard
          title="Customers"
          body={userData.activeUsers ?? 0}
          Icon={Users}
          footerTitle="Total users"
          footerValue={userData.totalUsers}
        />

        <DashboardCard
          title="Active Products"
          body={productData.activeProuductCount ?? 0}
          Icon={Boxes}
          footerTitle="Total products"
          footerValue={productData.totalProductCount}
        />
      </section>
    </div>
  )
}

type DashboardCardProps = {
  title: string
  body: string | number | React.ReactNode
  Icon: LucideIcon
  footerTitle: string
  footerValue: string | number | undefined
}

const DashboardCard = ({
  title,
  body,
  Icon,
  footerTitle,
  footerValue,
}: DashboardCardProps) => {
  return (
    <Card className="bg-white shadow-zinc-200 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 ">
        <CardTitle className="text-base font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{body}</div>
        <p className="text-sm text-muted-foreground">
          {footerTitle} {footerValue}
        </p>
      </CardContent>
    </Card>
  )
}
