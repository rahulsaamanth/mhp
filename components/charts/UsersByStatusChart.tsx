"use client"

import {
  Cell,
  Label,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts"

type UsersByStatusChartProps = {
  data: {
    _count: number
    status: string
  }[]
}

export function UsersByStatusChart({ data }: UsersByStatusChartProps) {
  return (
    <ResponsiveContainer minHeight={300}>
      <PieChart>
        <Tooltip cursor={{ fill: "hsl(var(--muted)" }} />
        <Pie
          data={data}
          dataKey="_count"
          label={(item) => item.status}
          labelLine={false}
          nameKey="status"
          fill="hsl(var(--primary--foreground))"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  )
}
