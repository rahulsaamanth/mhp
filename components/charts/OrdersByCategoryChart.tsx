"use client"

import {
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  Cell,
  Legend,
} from "recharts"

const colors = [
  "#8884d8",
  "#83a6ed",
  "#8dd1e1",
  "#82ca9d",
  "#a4de6c",
  "#d0ed57",
  "#ffc658",
  "#ff8042",
  "#ffbb28",
  "#ff7300",
  "#ea5455",
  "#9b59b6",
]

export type OrdersByCategoryChartData = {
  name: string
  value: number
}[]

export function OrdersByCategoryChart({
  data1,
  data2,
}: {
  data1: OrdersByCategoryChartData
  data2: OrdersByCategoryChartData
}) {
  return (
    <div className="flex items-center justify-center">
      <ResponsiveContainer width={400} height={400}>
        <PieChart className="size-full w-full h-full" margin={{ top: -30 }}>
          <Pie data={data1} dataKey="value" cx={200} cy={200} outerRadius={90}>
            {data1.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={colors[index % colors.length]}
              />
            ))}
          </Pie>
          <Pie
            data={data2}
            dataKey="value"
            cx={200}
            cy={200}
            innerRadius={100}
            outerRadius={120}
            label
          >
            {data2.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={colors[index % colors.length]}
              />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
