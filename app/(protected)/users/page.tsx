import { getUsers } from "@/actions/users"
import { DataTable } from "@/components/tables/data-table"
import { columns } from "./columns"
import { Prisma, User, UserStatus } from "@prisma/client"
import { OrdersByDayChart } from "@/components/charts/OrdersbyDayChart"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UsersByDayChart } from "@/components/charts/UsersByDayChart"
import db from "@/lib/db"

import { UsersByStatusChart } from "@/components/charts/UsersByStatusChart"
import { ChartCard } from "@/components/chart-card"
import { RANGE_OPTIONS, getRangeOption } from "@/lib/rangeOptions"
import { getChartDateArray } from "@/lib/chart-date-array"
import { startOfDay } from "date-fns"
import { ResponsiveContainer } from "recharts"
import { pause } from "@/utils/pause"

async function getUserData({
  createdAfter,
  createdBefore,
}: {
  createdAfter: Date | null
  createdBefore: Date | null
}) {
  const createdAtQuery: Prisma.UserWhereInput["createdAt"] = {}
  if (createdAfter) createdAtQuery.gte = createdAfter
  if (createdBefore) createdAtQuery.lte = createdBefore

  const [userCount, orderData, usersChartData, userCountByStatus] =
    await Promise.all([
      db.user.count(),
      db.order.aggregate({
        _sum: { totalAmountPaid: true },
      }),
      db.user.findMany({
        select: { createdAt: true },
        where: { createdAt: createdAtQuery },
        orderBy: { createdAt: "asc" },
      }),
      db.user.groupBy({
        by: ["status"],
        _count: true,
      }),
    ])

  const { array, format } = getChartDateArray(
    createdAfter || startOfDay(usersChartData[0].createdAt),
    createdBefore || new Date(),
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
    averageValuePerUser:
      userCount === 0
        ? 0
        : (orderData._sum.totalAmountPaid || 0) / userCount / 100,
    userCountByStatus,
  }
}

const UsersPage = async ({
  searchParams: {
    newCustomersRange,
    newCustomersRangeFrom,
    newCustomersRangeTo,
  },
}: {
  searchParams: {
    newCustomersRange?: string
    newCustomersRangeFrom?: string
    newCustomersRangeTo?: string
  }
}) => {
  const users = await getUsers()

  const columnData: User[] | [] = users

  const newCustomersRangeOption =
    getRangeOption(
      newCustomersRange,
      newCustomersRangeFrom,
      newCustomersRangeTo,
    ) || RANGE_OPTIONS.last_30_days

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
        <ChartCard title="Customer Count by Status">
          <UsersByStatusChart data={userData.userCountByStatus} />
        </ChartCard>
        <div className="col-span-1 lg:col-span-2 w-full">
          <DataTable data={columnData} columns={columns} />
        </div>
      </section>
    </div>
  )
}

export default UsersPage
