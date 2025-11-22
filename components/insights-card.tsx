// components/insights-card.tsx
"use client"

import React, { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"

/**
 * Lightweight count-up (no extra deps).
 * from -> to in ms duration
 */
function useCountUp(to: number, duration = 900) {
  const [value, setValue] = useState(0)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    const start = performance.now()
    const from = 0
    const animate = (now: number) => {
      const elapsed = now - start
      const t = Math.min(1, elapsed / duration)
      // easeOutCubic
      const eased = 1 - Math.pow(1 - t, 3)
      const current = from + (to - from) * eased
      setValue(Number(current.toFixed(2)))
      if (t < 1) rafRef.current = requestAnimationFrame(animate)
    }
    rafRef.current = requestAnimationFrame(animate)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [to, duration])

  return value
}

export default function InsightsCard({
  balance = 12543.5,
  last7Days = 742.3,
  avgPerDay = 106.04,
}: {
  balance?: number
  last7Days?: number
  avgPerDay?: number
}) {
  const display = useCountUp(balance, 1000)

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 120, damping: 16 }}
      className="rounded-2xl p-6 bg-gradient-to-br from-white/6 to-white/3 border border-white/6 shadow-lg"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm text-foreground-muted">Total balance</div>
          <div className="mt-2 flex items-baseline gap-3">
            <div className="text-3xl md:text-4xl font-bold text-foreground">
              {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(display)}
            </div>
            <div className="text-xs text-foreground-muted">Updated just now</div>
          </div>

          <div className="mt-4 flex gap-3">
            <div className="px-3 py-1 rounded-full bg-white/6 text-sm">
              Last 7d:{" "}
              <span className="font-semibold">
                {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(last7Days)}
              </span>
            </div>
            <div className="px-3 py-1 rounded-full bg-white/6 text-sm">
              Avg/day:{" "}
              <span className="font-semibold">
                {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(avgPerDay)}
              </span>
            </div>
          </div>
        </div>

        {/* Mini sparkline-like bar (pure css + small SVG for style) */}
        <div className="hidden sm:flex flex-col items-end gap-2">
          <svg width="96" height="56" viewBox="0 0 96 56" className="rounded-md bg-gradient-to-b from-white/3 to-white/6 p-2">
            {/* simple bars visual */}
            <rect x="6" y="28" width="8" height="20" rx="2" fill="#f472b6" />
            <rect x="22" y="18" width="8" height="30" rx="2" fill="#c084fc" />
            <rect x="38" y="8" width="8" height="40" rx="2" fill="#7c3aed" />
            <rect x="54" y="22" width="8" height="26" rx="2" fill="#a78bfa" />
            <rect x="70" y="12" width="8" height="36" rx="2" fill="#ec4899" />
            <rect x="86" y="30" width="4" height="18" rx="2" fill="#7c3aed" />
          </svg>

          <div className="text-right text-xs text-foreground-muted">
            Income <span className="font-semibold text-green-600">₹4,200</span> • Expense <span className="font-semibold text-foreground">₹2,341</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}