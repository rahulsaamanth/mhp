import { ChartCard } from "@/components/chart-card"
import {
  OrdersByCategoryChart,
  OrdersByCategoryChartData,
} from "@/components/charts/OrdersByCategoryChart"
import { OrdersByDayChart } from "@/components/charts/OrdersbyDayChart"
import { UsersByDayChart } from "@/components/charts/UsersByDayChart"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { db } from "@/db/db"
import {
  category,
  manufacturer,
  order,
  orderDetails,
  product,
  productVariant,
  user,
} from "@/db/schema"
import { getChartDateArray } from "@/lib/chart-date-array"
import { getRangeOption, RANGE_OPTIONS } from "@/lib/rangeOptions"
import { startOfDay } from "date-fns"

import {
  count,
  eq,
  sql,
  sum,
  gte,
  lte,
  and,
  countDistinct,
  ne,
  desc,
  aliasedTable,
} from "drizzle-orm"
import { Boxes, LucideIcon, ShoppingCart, Users } from "lucide-react"

async function getSalesData({
  createdAfter,
  createdBefore,
}: {
  createdAfter: Date | null
  createdBefore: Date | null
}) {
  const whereClause = []
  if (createdAfter) whereClause.push(gte(order.orderDate, createdAfter))
  if (createdBefore) whereClause.push(lte(order.orderDate, createdBefore))

  const [salesData, salesChartData] = await Promise.all([
    db
      .select({
        salesCount: count(),
        totalAmount: sum(order.totalAmountPaid),
      })
      .from(order),
    db
      .select({
        createdAt: order.orderDate,
        totalAmountPaid: order.totalAmountPaid,
      })
      .from(order)
      .where(and(...whereClause))
      .orderBy(order.orderDate),
  ])

  const { array, format } = getChartDateArray(
    createdAfter || startOfDay(salesChartData[0]!.createdAt),
    createdBefore || new Date()
  )

  const dayArray = array.map((date) => {
    return {
      date: format(date),
      totalSales: 0,
    }
  })

  return {
    chartData: salesChartData.reduce((data, order) => {
      const formattedDate = format(order.createdAt)
      const entry = dayArray.find((day) => day.date === formattedDate)
      if (entry == null) return data
      entry.totalSales += order.totalAmountPaid
      return data
    }, dayArray),
    amount: salesData[0]?.totalAmount,
    numberOfSales: salesData[0]?.salesCount,
  }
}

async function getUserData({
  createdAfter,
  createdBefore,
}: {
  createdAfter: Date | null
  createdBefore: Date | null
}) {
  const whereClause = []
  if (createdAfter) whereClause.push(gte(user.createdAt, createdAfter))
  if (createdBefore) whereClause.push(lte(user.createdAt, createdBefore))

  const [userData, usersChartData] = await Promise.all([
    db
      .select({
        usersWithOrders: sql<number>`count(distinct case when ${order.id} is not null then ${user.id} end)`,
        totalUsers: count(),
      })
      .from(user)
      .where(eq(user.role, "USER"))
      .leftJoin(order, eq(user.id, order.userId)),

    db
      .select({ createdAt: user.createdAt })
      .from(user)
      .where(and(...whereClause))
      .orderBy(user.createdAt),
  ])

  const { array, format } = getChartDateArray(
    createdAfter || startOfDay(usersChartData[0]!.createdAt),
    createdBefore || new Date()
  )

  const dayArray = array.map((date) => {
    return {
      date: format(date),
      totalUsers: 0,
    }
  })

  return {
    chartData: usersChartData.reduce((data, user) => {
      const formattedDate = format(user.createdAt)
      const entry = dayArray.find((day) => day.date === formattedDate)
      if (entry == null) return data
      entry.totalUsers += 1
      return data
    }, dayArray),
    activeUsers: userData[0]?.usersWithOrders,
    inactiveUsers: userData[0]?.totalUsers! - userData[0]?.usersWithOrders!,
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
    activeProductCount: data?.activeProducts,
    inactiveProductCount: data?.totalProducts! - data?.activeProducts!,
  }
}

async function getProductsSoldByCategory({
  createdAfter,
  createdBefore,
}: {
  createdAfter: Date | null
  createdBefore: Date | null
}) {
  const whereClause = []
  if (createdAfter) whereClause.push(gte(order.orderDate, createdAfter))
  if (createdBefore) whereClause.push(lte(order.orderDate, createdBefore))

  const mainCategory = aliasedTable(category, "mainCategory")

  const data = await db
    .select({
      // mainCategoryId: mainCategory.id,
      mainCategoryName: mainCategory.name,
      // subCategoryId: category.id,
      subCategoryName: category.name,
      totalOrders: countDistinct(order.id).mapWith(Number),
      totalRevenue: sum(order.totalAmountPaid).mapWith(Number),
      totalItemsSold: sum(orderDetails.quantity).mapWith(Number),
    })
    .from(order)
    .innerJoin(orderDetails, sql`${orderDetails.orderId} = ${order.id}`)
    .innerJoin(
      productVariant,
      sql`${productVariant.id} = ${orderDetails.productVariantId}`
    )
    .innerJoin(product, sql`${product.id} = ${productVariant.productId}`)
    .innerJoin(category, sql`${category.id} = ${product.categoryId}`)
    .innerJoin(mainCategory, sql`${category.parentId} = ${mainCategory.id}`)
    .where(and(...whereClause))
    .groupBy(mainCategory.id, mainCategory.name, category.id, category.name)
    .orderBy(desc(sum(order.totalAmountPaid)))

  const mainCategoryMap = data.reduce((acc: any, item) => {
    if (!acc[item.mainCategoryName]) {
      acc[item.mainCategoryName] = {
        name: item.mainCategoryName,
        value: 0,
      }
    }
    acc[item.mainCategoryName].value += item.totalItemsSold
    return acc
  }, {})

  return {
    mainCategoryArray: Object.values(
      mainCategoryMap
    ) as OrdersByCategoryChartData,
    subCategoryArray: data.map((item) => ({
      name: item.subCategoryName,
      value: item.totalItemsSold,
    })),
  }
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: {
    totalSalesRange?: string
    totalSalesRangeFrom?: string
    totalSalesRangeTo?: string
    newCustomersRange?: string
    newCustomersRangeFrom?: string
    newCustomersRangeTo?: string
    productsSoldByCategoryRange?: string
    productsSoldByCategoryRangeFrom?: string
    productsSoldByCategoryRangeTo?: string
  }
}) {
  const {
    newCustomersRange,
    newCustomersRangeFrom,
    newCustomersRangeTo,
    totalSalesRange,
    totalSalesRangeFrom,
    totalSalesRangeTo,
    productsSoldByCategoryRange,
    productsSoldByCategoryRangeFrom,
    productsSoldByCategoryRangeTo,
  } = await searchParams

  const totalSalesRangeOption =
    getRangeOption(totalSalesRange, totalSalesRangeFrom, totalSalesRangeTo) ||
    RANGE_OPTIONS.last_90_days

  const newCustomersRangeOption =
    getRangeOption(
      newCustomersRange,
      newCustomersRangeFrom,
      newCustomersRangeTo
    ) || RANGE_OPTIONS.last_90_days

  const productsSoldByCategoryRangeOption =
    getRangeOption(
      productsSoldByCategoryRange,
      productsSoldByCategoryRangeFrom,
      productsSoldByCategoryRangeTo
    ) || RANGE_OPTIONS.last_90_days

  const [salesData, userData, productData, productsSoldByCategory] =
    await Promise.all([
      getSalesData({
        createdAfter: totalSalesRangeOption.startDate,
        createdBefore: totalSalesRangeOption.endDate,
      }),
      getUserData({
        createdAfter: newCustomersRangeOption.startDate,
        createdBefore: newCustomersRangeOption.endDate,
      }),
      getProdcutsData(),
      getProductsSoldByCategory({
        createdAfter: productsSoldByCategoryRangeOption.startDate,
        createdBefore: productsSoldByCategoryRangeOption.endDate,
      }),
    ])

  return (
    <div className="w-full py-2 space-y-8">
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <DashboardCard
          title="Sales"
          body={<span className="flex items-center">₹ {salesData.amount}</span>}
          Icon={ShoppingCart}
          footerTitle="Total orders"
          footerValue={salesData.numberOfSales}
        />
        <DashboardCard
          title="Customers"
          body={userData.activeUsers}
          Icon={Users}
          footerTitle="Total inactive customers"
          footerValue={userData.inactiveUsers}
        />

        <DashboardCard
          title="Active Products"
          body={productData.activeProductCount}
          Icon={Boxes}
          footerTitle="Total inactive products"
          footerValue={productData.inactiveProductCount}
        />
      </section>
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 gap-y-8">
        <ChartCard
          title="New Customers"
          queryKey="newCustomersRange"
          selectedRangeLabel={newCustomersRangeOption.label}
        >
          <UsersByDayChart data={userData.chartData} />
        </ChartCard>
        <ChartCard
          title="Total Sales"
          queryKey="totalSalesRange"
          selectedRangeLabel={totalSalesRangeOption.label}
        >
          <OrdersByDayChart data={salesData.chartData} />
        </ChartCard>
        <ChartCard
          title="Products sold by Category"
          queryKey="productsSoldByCategory"
          selectedRangeLabel={productsSoldByCategoryRangeOption.label}
        >
          <OrdersByCategoryChart
            data1={productsSoldByCategory.mainCategoryArray}
            data2={productsSoldByCategory.subCategoryArray}
          />
        </ChartCard>
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
    <Card className="bg-white shadow-zinc-200 shadow-md">
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
