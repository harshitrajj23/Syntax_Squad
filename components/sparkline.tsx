"use client"

import React from "react"
import {
  LineChart,
  Line,
  ResponsiveContainer,
} from "recharts"

const data = [
  { value: 4 },
  { value: 6 },
  { value: 5 },
  { value: 7 },
  { value: 6.5 },
  { value: 8 },
  { value: 9 },
]

export function Sparkline() {
  return (
    <div className="w-full h-12">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line
            type="monotone"
            dataKey="value"
            stroke="#a855f7"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}