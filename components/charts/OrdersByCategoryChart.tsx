"use client"

import {
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  Cell,
  Legend,
  Sector,
} from "recharts"
import { useState } from "react"

const MAIN_CATEGORY_COLORS = [
  "#8884d8", // purple
  "#83a6ed", // light blue
  "#8dd1e1", // teal
  "#82ca9d", // green
  "#a4de6c", // light green
  "#d0ed57", // lime
]

const SUB_CATEGORY_COLORS = [
  "#ffc658", // yellow
  "#ff8042", // orange
  "#ffbb28", // amber
  "#ff7300", // dark orange
  "#ea5455", // red
  "#9b59b6", // violet
]

export type OrdersByCategoryChartData = {
  name: string
  value: number
}[]

const renderActiveShape = (props: any) => {
  const RADIAN = Math.PI / 180
  const {
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
    payload,
    percent,
    value,
  } = props
  const sin = Math.sin(-RADIAN * midAngle)
  const cos = Math.cos(-RADIAN * midAngle)
  const sx = cx + (outerRadius + 10) * cos
  const sy = cy + (outerRadius + 10) * sin
  const mx = cx + (outerRadius + 30) * cos
  const my = cy + (outerRadius + 30) * sin
  const ex = mx + (cos >= 0 ? 1 : -1) * 22
  const ey = my
  const textAnchor = cos >= 0 ? "start" : "end"

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
      <path
        d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`}
        stroke={fill}
        fill="none"
      />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text
        x={ex + (cos >= 0 ? 1 : -1) * 12}
        y={ey}
        textAnchor={textAnchor}
        fill="#333"
        fontSize={12}
      >{`${payload.name}`}</text>
      <text
        x={ex + (cos >= 0 ? 1 : -1) * 12}
        y={ey}
        dy={18}
        textAnchor={textAnchor}
        fill="#999"
        fontSize={12}
      >
        {`${value} items (${(percent * 100).toFixed(2)}%)`}
      </text>
    </g>
  )
}

// Custom Legend that differentiates between main and sub categories
const CustomLegend = (props: any) => {
  const { payload } = props

  // Split the legend into two groups - main and sub categories
  const mainCategories = payload.slice(0, payload.length / 2)
  const subCategories = payload.slice(payload.length / 2)

  return (
    <div className="flex flex-col gap-2 text-xs">
      <div>
        <h4 className="font-semibold mb-1">Main Categories</h4>
        <ul className="flex flex-wrap gap-x-4 gap-y-1">
          {mainCategories.map((entry: any, index: number) => (
            <li key={`main-item-${index}`} className="flex items-center">
              <div
                className="w-3 h-3 mr-1 rounded-sm"
                style={{ backgroundColor: entry.color }}
              />
              <span>{entry.value}</span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h4 className="font-semibold mb-1">Sub Categories</h4>
        <ul className="flex flex-wrap gap-x-4 gap-y-1">
          {subCategories.map((entry: any, index: number) => (
            <li key={`sub-item-${index}`} className="flex items-center">
              <div
                className="w-3 h-3 mr-1 rounded-sm"
                style={{ backgroundColor: entry.color }}
              />
              <span>{entry.value}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-2 border border-gray-200 shadow-md rounded-md">
        <p className="font-medium">{payload[0].name}</p>
        <p className="text-sm text-gray-600">{`Items sold: ${payload[0].value}`}</p>
      </div>
    )
  }

  return null
}

export function OrdersByCategoryChart({
  data1,
  data2,
}: {
  data1: OrdersByCategoryChartData
  data2: OrdersByCategoryChartData
}) {
  const [activeIndex1, setActiveIndex1] = useState<number>(-1)
  const [activeIndex2, setActiveIndex2] = useState<number>(-1)

  const onPieEnter1 = (_: any, index: number) => {
    setActiveIndex1(index)
  }

  const onPieLeave1 = () => {
    setActiveIndex1(-1)
  }

  const onPieEnter2 = (_: any, index: number) => {
    setActiveIndex2(index)
  }

  const onPieLeave2 = () => {
    setActiveIndex2(-1)
  }

  return (
    <div className="flex flex-col items-center justify-center w-full h-full">
      <div className="text-center mb-2">
        <div className="flex items-center justify-center gap-8">
          <div className="flex items-center">
            <div
              className="w-3 h-3 rounded-full mr-2"
              style={{ backgroundColor: MAIN_CATEGORY_COLORS[0] }}
            ></div>
            <span className="text-sm"> Main Categories</span>
          </div>
          <div className="flex items-center">
            <div
              className="w-3 h-3 rounded-full mr-2"
              style={{ backgroundColor: SUB_CATEGORY_COLORS[0] }}
            ></div>
            <span className="text-sm"> Sub Categories</span>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
          {/* Main Categories (Inner Pie) */}
          <Pie
            activeIndex={activeIndex1}
            activeShape={renderActiveShape}
            data={data1}
            dataKey="value"
            cx="50%"
            cy="50%"
            innerRadius={0}
            outerRadius={90}
            onMouseEnter={onPieEnter1}
            onMouseLeave={onPieLeave1}
          >
            {data1.map((entry, index) => (
              <Cell
                key={`main-cell-${index}`}
                fill={MAIN_CATEGORY_COLORS[index % MAIN_CATEGORY_COLORS.length]}
              />
            ))}
          </Pie>

          {/* Sub Categories (Outer Pie) */}
          <Pie
            activeIndex={activeIndex2}
            activeShape={renderActiveShape}
            data={data2}
            dataKey="value"
            cx="50%"
            cy="50%"
            innerRadius={100}
            outerRadius={130}
            onMouseEnter={onPieEnter2}
            onMouseLeave={onPieLeave2}
          >
            {data2.map((entry, index) => (
              <Cell
                key={`sub-cell-${index}`}
                fill={SUB_CATEGORY_COLORS[index % SUB_CATEGORY_COLORS.length]}
              />
            ))}
          </Pie>

          <Tooltip content={<CustomTooltip />} />
          <Legend content={<CustomLegend />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
