import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type DashboardRecentOrdersShortTableProps = {
  data: {
    order_id: string
    user_name: string | null
    user_email: string | null

    order_amount: number
  }[]
}

export const DashboardRecentOrdersShortTable = ({
  data,
}: DashboardRecentOrdersShortTableProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Sales</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-8 pt-4">
        {data.map((order) => (
          <div className="flex items-center gap-4" key={order.order_id}>
            <Avatar className="hidden h-9 w-9 sm:flex">
              <AvatarImage src="" alt="Avatar" />
              <AvatarFallback>
                {order
                  .user_name!.trim()
                  .split(" ")
                  .map((word) => word[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="grid gap-1">
              <p className="text-sm font-medium leading-none">
                {order.user_name}
              </p>
              <p className="text-sm text-muted-foreground">
                {order.user_email}
              </p>
            </div>
            <div className="ml-auto font-medium">+₹{order.order_amount}</div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
