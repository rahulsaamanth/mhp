import { getUsers } from "@/actions/users"
// import { DataTable } from "@/components/client/data-table"
import { columns } from "./columns"

import { OrdersByDayChart } from "@/components/charts/OrdersbyDayChart"

import { UsersByDayChart } from "@/components/charts/UsersByDayChart"

import { UsersByStatusChart } from "@/components/charts/UsersByStatusChart"
import { ChartCard } from "@/components/chart-card"
import { RANGE_OPTIONS, getRangeOption } from "@/lib/rangeOptions"
import { getChartDateArray } from "@/lib/chart-date-array"
import { startOfDay } from "date-fns"

import { and, count, gte, lte, sum } from "drizzle-orm"
import { order, user } from "@/db/schema"
import { db } from "@/db/db"

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

  const [userCount, orderData, usersChartData] = await Promise.all([
    db.select({ count: count() }).from(user),
    db.select({ totalAmountPaid: sum(order.totalAmountPaid) }).from(order),
    db
      .select({ createdAt: user.createdAt })
      .from(user)
      .where(and(...whereClause))
      .orderBy(user.createdAt),
  ])

  const startDate =
    createdAfter ||
    (usersChartData.length > 0
      ? startOfDay(usersChartData[0]!.createdAt)
      : new Date())

  const { array, format } = getChartDateArray(
    startDate,
    createdBefore || new Date()
  )

  const dayArray = array.map((date) => {
    return {
      date: format(date),
      totalUsers: 0,
    }
  })

  return {
    chartData: usersChartData.reduce((data: any, user: { createdAt: Date }) => {
      const formattedDate = format(user.createdAt)
      const entry = dayArray.find((day) => day.date === formattedDate)
      if (entry == null) return data
      entry.totalUsers += 1
      return data
    }, dayArray),
    userCount,
  }
}

const UsersPage = async ({
  searchParams,
}: {
  searchParams: {
    newCustomersRange?: string
    newCustomersRangeFrom?: string
    newCustomersRangeTo?: string
  }
}) => {
  // const columnData = await getUsers()

  const { newCustomersRange, newCustomersRangeFrom, newCustomersRangeTo } =
    await searchParams
  const newCustomersRangeOption =
    getRangeOption(
      newCustomersRange,
      newCustomersRangeFrom,
      newCustomersRangeTo
    ) || RANGE_OPTIONS.last_365_days

  const userData = await getUserData({
    createdAfter: newCustomersRangeOption.startDate,
    createdBefore: newCustomersRangeOption.endDate,
  })

  return (
    <div className="w-full py-10">
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 gap-y-10">
        <ChartCard
          title="New Customers"
          queryKey="newCustomersRange"
          selectedRangeLabel={newCustomersRangeOption.label}
        >
          <UsersByDayChart data={userData.chartData} />
        </ChartCard>
        {/* <ChartCard title="Customer Count by Status">
          <UsersByStatusChart data={userData.userCountByStatus} />
        </ChartCard> */}
        <div className="col-span-1 lg:col-span-2 w-full">
          {/* <DataTable data={columnData} columns={columns} /> */}
        </div>
      </section>
    </div>
  )
}

export default UsersPage
