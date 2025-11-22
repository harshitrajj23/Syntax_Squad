import React from "react"
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

export default function SpendingChart({ data }: { data: { month: string; spent: number }[] }) {
  return (
    <div className="w-full h-64 p-4 rounded-2xl bg-background border border-border">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorSpend" x1="0" x2="0" y1="0" y2="1">
              <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#f472b6" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <XAxis dataKey="month" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Area type="monotone" dataKey="spent" stroke="#7c3aed" fill="url(#colorSpend)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}