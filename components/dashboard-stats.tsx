import React from "react"
import clsx from "clsx"
import { Sparkline } from "./sparkline"


type Stat = { label: string; value: string; change: string; icon: React.ReactNode; positive?: boolean }

export default function DashboardStats({ stats }: { stats: Stat[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {stats.map((s, i) => (
        <div
          key={i}
          className="p-6 rounded-2xl bg-gradient-to-br from-white/40 to-white/10 backdrop-blur-sm border border-white/6 shadow-lg hover:scale-102 transform transition"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-white/8">{s.icon}</div>
              <div>
                <div className="text-xs text-foreground-muted uppercase">{s.label}</div>
                <div className="text-2xl font-bold text-foreground mt-1">{s.value}</div>
              </div>
            </div>
            <div className={clsx(
              "text-sm font-medium px-3 py-1 rounded-full",
              s.positive ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
            )}>
              {s.change}
            </div>
          </div>

          {/* sparkline decorative small chart (optional) */}
          <div className="mt-4">
            <Sparkline />
          </div>
        </div>
      ))}
    </div>
  )
}