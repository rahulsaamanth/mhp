"use client"

import { Pie, PieChart, ResponsiveContainer, Tooltip, Cell } from "recharts"

const data01 = [{ name: "Homeopathy", value: 6 }]
const data02 = [
  { name: "Mothertinctures", value: 5 },
  { name: "Biochemics", value: 1 },
]

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

type ProductsSoldByMainCategory = {
  mainCategoryName: string
  totalItemsSold: number
}[]

type ProductsSoldBySubCategory = {
  subCategoryName: string
  totalItemsSold: number
}[]

export function OrdersByCategoryChart() {
  return (
    <ResponsiveContainer width="100%" minHeight={300}>
      <PieChart width={400} height={400}>
        <Pie data={data01} dataKey="value" cx={200} cy={200} outerRadius={60}>
          {data01.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Pie
          data={data02}
          dataKey="value"
          cx={200}
          cy={200}
          innerRadius={70}
          outerRadius={90}
          label
        >
          {data02.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  )
}
