import { getUsers } from "@/actions/users"
import { DataTable } from "@/components/data-table"
import { columns } from "./columns"
import { User } from "@prisma/client"
import { OrdersByDayChart } from "@/components/charts/OrdersbyDayChart"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const UsersPage = async () => {
  const users = await getUsers()
  const columnData: User[] | [] = users

  return (
    <div className="w-full py-10 space-y-10">
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Montly Users</CardTitle>
          </CardHeader>
          <CardContent>
            <OrdersByDayChart />
          </CardContent>
        </Card>
      </section>
      <DataTable columns={columns} data={columnData} />
    </div>
  )
}

export default UsersPage
