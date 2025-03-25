import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LucideIcon } from "lucide-react"

type DashboardCardProps = {
  title: string
  body: string | number | React.ReactNode
  Icon: LucideIcon
  footerTitle: string
  footerValue: string | number | undefined
}

export const DashboardCard = ({
  title,
  body,
  Icon,
  footerTitle,
  footerValue,
}: DashboardCardProps) => {
  return (
    <Card className="bg-white shadow-zinc-200 shadow-md rounded-sm">
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
