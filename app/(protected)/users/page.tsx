import { getUsers } from "@/actions/users"
import { DataTable } from "@/components/data-table"
import { columns } from "./columns"
import { Prisma, User, UserStatus } from "@prisma/client"
import { OrdersByDayChart } from "@/components/charts/OrdersbyDayChart"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UsersByDayChart } from "@/components/charts/UsersByDayChart"
import { db } from "@/lib/db"
import {
  differenceInDays,
  differenceInMonths,
  differenceInWeeks,
  eachDayOfInterval,
  eachMonthOfInterval,
  eachWeekOfInterval,
  eachYearOfInterval,
  endOfWeek,
  interval,
  max,
  min,
  startOfDay,
  startOfWeek,
  subDays,
} from "date-fns"
import { formatDate } from "@/lib/formatters"
import { UsersByStatusChart } from "@/components/charts/UsersByStatusChart"
import { ChartCard } from "@/components/chart-card"
import { RANGE_OPTIONS, getRangeOption } from "@/lib/rangeOptions"

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
  // const columnData: User[] | [] = users

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
    <div className="w-full py-10 space-y-10">
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard
          title="New Customers"
          queryKey="newCustomersRange"
          selectedRangeLabel={newCustomersRangeOption.label}
        >
          <UsersByDayChart data={userData.chartData} />
        </ChartCard>
        <Card>
          <CardHeader>
            <CardTitle>Customer Count By Status</CardTitle>
            <CardContent>
              <UsersByStatusChart data={userData.userCountByStatus} />
            </CardContent>
          </CardHeader>
        </Card>
      </section>
      {/* <DataTable columns={columns} data={columnData} /> */}
    </div>
  )
}

export default UsersPage

function getChartDateArray(startDate: Date, endDate: Date = new Date()) {
  const days = differenceInDays(endDate, startDate)

  if (days < 30) {
    return {
      array: eachDayOfInterval(interval(startDate, endDate)),
      format: formatDate,
    }
  }

  const weeks = differenceInWeeks(endDate, startDate)
  if (weeks < 30) {
    return {
      array: eachWeekOfInterval(interval(startDate, endDate)),
      format: (date: Date) => {
        const start = max([startOfWeek(date), startDate])
        const end = min([endOfWeek(date), endDate])
        return `${formatDate(start)} - ${formatDate(end)}`
      },
    }
  }

  const months = differenceInMonths(endDate, startDate)
  if (months < 30) {
    return {
      array: eachMonthOfInterval(interval(startDate, endDate)),
      format: new Intl.DateTimeFormat("en", { month: "long", year: "numeric" })
        .format,
    }
  }
  return {
    array: eachYearOfInterval(interval(startDate, endDate)),
    format: new Intl.DateTimeFormat("en", { year: "numeric" }).format,
  }
}
