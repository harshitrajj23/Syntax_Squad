"use client"

import React from "react"

export type BudgetGoal = {
  id: string
  name: string
  target: number
  duration: number
  unit: "months" | "weeks"
  startDate?: string
  note?: string
  saved?: number // optional, future persistence
}

export default function BudgetGoalList({
  goals,
  onRemove,
}: {
  goals: BudgetGoal[]
  onRemove?: (id: string) => void
}) {
  if (!goals || goals.length === 0)
    return <div className="mt-4 text-sm text-foreground-muted">No goals yet — create one above.</div>

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n)

  return (
    <div className="mt-4 space-y-3">
      {goals.map((g) => {
        const saved = g.saved ?? 0
        const remaining = Math.max(0, g.target - saved)
        const monthlyNeeded =
          g.unit === "months" ? remaining / Math.max(1, g.duration) : (remaining / Math.max(1, g.duration)) * 4.345 // approx weeks->months
        const weeklyNeeded =
          g.unit === "weeks" ? remaining / Math.max(1, g.duration) : (remaining / Math.max(1, g.duration)) / 4.345
        const percent = Math.min(100, Math.round((saved / g.target) * 100))

        return (
          <div key={g.id} className="p-4 rounded-lg border border-border bg-background-secondary">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <div className="text-lg font-semibold">{g.name}</div>
                  <div className="text-sm text-foreground-muted">• target {formatCurrency(g.target)}</div>
                </div>

                <div className="mt-2 text-sm text-foreground-muted">
                  Duration: {g.duration} {g.unit} • Start: {g.startDate ?? "—"}
                </div>

                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs text-foreground-muted mb-1">
                    <span>Progress</span>
                    <span>{percent}%</span>
                  </div>

                  <div className="w-full h-2 bg-white/6 rounded-full overflow-hidden">
                    <div
                      className="h-2 bg-gradient-to-r from-pink-500 to-purple-600"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>

                <div className="mt-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div className="text-sm">
                    <div>
                      Monthly (approx): <span className="font-semibold">{formatCurrency(Math.ceil(monthlyNeeded))}</span>
                    </div>
                    <div>
                      Weekly (approx): <span className="font-semibold">{formatCurrency(Math.ceil(weeklyNeeded))}</span>
                    </div>
                  </div>

                  {g.note && <div className="text-sm text-foreground-muted">{g.note}</div>}
                </div>
              </div>

              <div className="flex-shrink-0 ml-4 self-start">
                <button
                  onClick={() => onRemove?.(g.id)}
                  className="px-2 py-1 rounded-md bg-red-50 text-red-600 text-sm"
                  title="Remove goal"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}