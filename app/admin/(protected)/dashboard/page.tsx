import { ChartCard } from "@/components/chart-card"
import {
  OrdersByCategoryChart,
  OrdersByCategoryChartData,
} from "@/components/charts/OrdersByCategoryChart"
import { OrdersByDayChart } from "@/components/charts/OrdersbyDayChart"
import { UsersByDayChart } from "@/components/charts/UsersByDayChart"
import { db, sql as d_sql } from "@/db/db"
import {
  category,
  manufacturer,
  order,
  orderDetails,
  product,
  productVariant,
  user,
} from "@rahulsaamanth/mhp-schema"
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
import { Boxes, ShoppingCart, Users } from "lucide-react"
import { DashboardRecentOrdersShortTable } from "./_components/recent-orders-table"
import { DashboardCard } from "./_components/dashboard-card"
import {
  DashboardLatestProductsShortTable,
  DashboardPopularProductsShortTable,
  DashboardPopularProductsShortTableProps,
} from "./_components/popular-and-recent-products"
import { unstable_noStore } from "next/cache"

async function getSalesData({
  createdAfter,
  createdBefore,
}: {
  createdAfter: Date | null
  createdBefore: Date | null
}) {
  unstable_noStore()
  const whereClause = []
  if (createdAfter) whereClause.push(gte(order.createdAt, createdAfter))
  if (createdBefore) whereClause.push(lte(order.createdAt, createdBefore))

  const [salesData, salesChartData]: [
    { salesCount: number; totalAmount: number }[],
    { createdAt: Date; totalAmountPaid: number }[],
  ] = await Promise.all([
    db
      .select({
        salesCount: count(),
        totalAmount: sql<number>`coalesce(sum(${order.totalAmountPaid}), 0)`,
      })
      .from(order),
    db
      .select({
        createdAt: order.createdAt,
        totalAmountPaid: order.totalAmountPaid,
      })
      .from(order)
      .where(and(...whereClause))
      .orderBy(order.createdAt),
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
  unstable_noStore()
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
  unstable_noStore()
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
  unstable_noStore() // This ensures the data is always fresh and never cached

  try {
    const whereClause = []
    if (createdAfter) whereClause.push(gte(order.createdAt, createdAfter))
    if (createdBefore) whereClause.push(lte(order.createdAt, createdBefore))

    const mainCategory = aliasedTable(category, "mainCategory")

    const data = await db
      .select({
        mainCategoryId: mainCategory.id,
        mainCategoryName: mainCategory.name,
        subCategoryId: category.id,
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
      .where(whereClause.length > 0 ? and(...whereClause) : sql`1=1`)
      .groupBy(mainCategory.id, mainCategory.name, category.id, category.name)
      .orderBy(desc(sum(order.totalAmountPaid)))

    // Process main categories data
    const mainCategoryMap = data.reduce((acc: any, item) => {
      if (!acc[item.mainCategoryId]) {
        acc[item.mainCategoryId] = {
          name: item.mainCategoryName,
          value: 0,
        }
      }
      acc[item.mainCategoryId].value += item.totalItemsSold
      return acc
    }, {})

    // Process sub categories data
    const subCategoryArray = data.map((item) => ({
      name: item.subCategoryName,
      value: item.totalItemsSold,
      mainCategoryId: item.mainCategoryId, // Adding reference to parent category for potential relationship visualization
    }))

    return {
      mainCategoryArray: Object.values(
        mainCategoryMap
      ) as OrdersByCategoryChartData,
      subCategoryArray: subCategoryArray,
    }
  } catch (error) {
    console.error("Error fetching product category data:", error)
    // Return empty arrays as fallback to prevent UI breaking
    return {
      mainCategoryArray: [] as OrdersByCategoryChartData,
      subCategoryArray: [] as OrdersByCategoryChartData,
    }
  }
}

async function getLatestOrders() {
  unstable_noStore()
  const data = await db
    .select({
      order_id: order.id,
      user_name: user.name,
      user_email: user.email,

      order_amount: order.totalAmountPaid,
    })
    .from(order)
    .leftJoin(user, eq(order.userId, user.id))
    .orderBy(desc(order.createdAt))
    .limit(5)
  return data
}

async function getPopularProducts() {
  unstable_noStore()

  const popularProductsData = (await d_sql`
  WITH SalesRanking AS (
    SELECT 
      p."id",
      COUNT(DISTINCT od."orderId") as "sales"
    FROM "Product" p
    JOIN "ProductVariant" pv ON pv."productId" = p."id"
    LEFT JOIN "OrderDetails" od ON od."productVariantId" = pv."id"
    GROUP BY p."id"
    ORDER BY "sales" DESC
    LIMIT 5
  )
  SELECT 
    p."id",
    p."name",
    sr."sales",
    (SELECT pv."variantImage" FROM "ProductVariant" pv WHERE pv."productId" = p."id" LIMIT 1) as "image"
  FROM "Product" p
  JOIN SalesRanking sr ON p."id" = sr."id"
  ORDER BY sr."sales" DESC
`) as DashboardPopularProductsShortTableProps["data"]

  return popularProductsData
}

async function getRecentProducts() {
  unstable_noStore()
  const data = await db
    .select({
      productVariantId: productVariant.id,
      productName: product.name,
      productPotency: productVariant.potency,
      productPackSize: productVariant.packSize,
      dateAdded: product.createdAt,
      category: category.name,
      // stock: productVariant.stock,
    })
    .from(product)
    .innerJoin(productVariant, eq(productVariant.productId, product.id))
    .innerJoin(manufacturer, eq(manufacturer.id, product.manufacturerId))
    .innerJoin(category, eq(category.id, product.categoryId))
    .where(eq(product.status, "ACTIVE"))
    .orderBy(desc(product.createdAt))
    .limit(5)
  return data
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{
    newCustomersRange?: string
    newCustomersRangeFrom?: string
    newCustomersRangeTo?: string
    totalSalesRange?: string
    totalSalesRangeFrom?: string
    totalSalesRangeTo?: string
    productsSoldByCategoryRange?: string
    productsSoldByCategoryRangeFrom?: string
    productsSoldByCategoryRangeTo?: string
  }>
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
    getRangeOption(
      totalSalesRange as string,
      totalSalesRangeFrom as string,
      totalSalesRangeTo as string
    ) || RANGE_OPTIONS.last_90_days

  const newCustomersRangeOption =
    getRangeOption(
      newCustomersRange as string,
      newCustomersRangeFrom as string,
      newCustomersRangeTo as string
    ) || RANGE_OPTIONS.last_90_days

  const productsSoldByCategoryRangeOption =
    getRangeOption(
      productsSoldByCategoryRange as string,
      productsSoldByCategoryRangeFrom as string,
      productsSoldByCategoryRangeTo as string
    ) || RANGE_OPTIONS.all_time

  const [
    salesData,
    userData,
    productData,
    productsSoldByCategory,
    recentOrders,
    popularProducts,
    recentProducts,
  ] = await Promise.all([
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
    getLatestOrders(),
    getPopularProducts(),
    getRecentProducts(),
  ])

  return (
    <div className="w-full py-2 sm:px-6 space-y-8">
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
      <section className="grid grid-cols-1 lg:grid-cols-2  gap-4 gap-y-8">
        <ChartCard
          title="New Customers"
          queryKey="newCustomersRange"
          selectedRangeLabel={newCustomersRangeOption.label}
        >
          <UsersByDayChart data={userData.chartData} />
        </ChartCard>
        <ChartCard
          title="Products sold by Category"
          queryKey="productsSoldByCategoryRange"
          selectedRangeLabel={productsSoldByCategoryRangeOption.label}
        >
          <OrdersByCategoryChart
            data1={productsSoldByCategory.mainCategoryArray}
            data2={productsSoldByCategory.subCategoryArray}
          />
        </ChartCard>
      </section>
      <section className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3  gap-4 gap-y-8">
        <div className="2xl:col-span-2">
          <ChartCard
            title="Total Sales"
            queryKey="totalSalesRange"
            selectedRangeLabel={totalSalesRangeOption.label}
          >
            <OrdersByDayChart data={salesData.chartData} />
          </ChartCard>
        </div>
        <DashboardRecentOrdersShortTable data={recentOrders} />
      </section>
      <section className="grid grid-cols-1 lg:grid-cols-2  gap-4 gap-y-8">
        <DashboardPopularProductsShortTable data={popularProducts} />
        <DashboardLatestProductsShortTable data={recentProducts} />
      </section>
    </div>
  )
}
