"use client"

import React, { useMemo, useState } from "react"
import { Calendar, Target } from "lucide-react"

export type BudgetGoal = {
  id?: string
  name: string
  target: number
  duration: number
  unit: "months" | "weeks"
  startDate?: string | null
  note?: string | null
  createdAt?: string
}

export default function BudgetGoal({
  onSave,
  defaultValues,
}: {
  onSave?: (g: BudgetGoal) => void
  defaultValues?: Partial<BudgetGoal>
}) {
  const [name, setName] = useState(defaultValues?.name ?? "")
  const [target, setTarget] = useState<string>((defaultValues?.target ?? "").toString())
  const [duration, setDuration] = useState<string>((defaultValues?.duration ?? 3).toString())
  const [unit, setUnit] = useState<"months" | "weeks">(defaultValues?.unit ?? "months")
  const [startDate, setStartDate] = useState<string | undefined>(defaultValues?.startDate ?? undefined)
  const [note, setNote] = useState<string>(defaultValues?.note ?? "")
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const targetNum = Number(target || 0)
  const durationNum = Math.max(1, Math.floor(Number(duration) || 0))

  // computed values
  const perPeriod = useMemo(() => {
    if (!targetNum || !durationNum) return 0
    return targetNum / durationNum
  }, [targetNum, durationNum])

  const friendlyUnit = unit === "months" ? "month" : "week"
  const perMonthIfWeeks = useMemo(() => {
    // If user chose weeks, show equivalent per-month estimate: weeks -> months approximated (4.345 weeks per month)
    if (unit === "weeks" && perPeriod > 0) {
      const perMonth = perPeriod * (52 / 12) // per week -> per month approx
      return perMonth
    }
    return null
  }, [unit, perPeriod])

  function validate() {
    setError(null)
    if (!name.trim()) return setError("Please give the goal a name.")
    if (!targetNum || targetNum <= 0) return setError("Enter a positive target amount.")
    if (!durationNum || durationNum <= 0) return setError("Enter a duration (>=1).")
    return true
  }

  async function handleSave() {
    if (!validate()) return
    setSaving(true)
    try {
      const goal: BudgetGoal = {
        id: `local-${Date.now()}`,
        name: name.trim(),
        target: Number(parseFloat(String(targetNum)).toFixed(2)),
        duration: durationNum,
        unit,
        startDate: startDate || null,
        note: note || null,
        createdAt: new Date().toISOString(),
      }
      // callback for parent to store (DB/local)
      onSave?.(goal)
    } catch (err) {
      console.error(err)
      setError("Save failed.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="rounded-2xl bg-background border border-border p-6 shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">Create a Savings Goal</h3>
          <p className="text-sm text-foreground-muted mt-1">Plan how much to save per {friendlyUnit} to reach your target.</p>
        </div>
        <div className="hidden sm:block">
          {/* optional preview image */}
          <img src={"/mnt/data/Screenshot 2025-11-21 at 11.33.43 AM.png"} alt="preview" className="w-20 h-12 rounded-md object-cover" />
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <div>
          <label className="block text-sm text-foreground-muted">Goal name</label>
          <input className="w-full mt-1 px-3 py-2 rounded-md border" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. New shirt" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-foreground-muted">Target amount</label>
            <div className="mt-1 relative">
              <input type="number" min="0" step="0.01" className="w-full px-3 py-2 rounded-md border" value={target} onChange={(e) => setTarget(e.target.value)} placeholder="₹ 1500" />
            </div>
          </div>

          <div>
            <label className="block text-sm text-foreground-muted">Duration</label>
            <div className="mt-1 flex gap-2">
              <input type="number" min="1" className="w-24 px-3 py-2 rounded-md border" value={duration} onChange={(e) => setDuration(e.target.value)} />
              <select className="px-3 py-2 rounded-md border" value={unit} onChange={(e) => setUnit(e.target.value as "months" | "weeks")}>
                <option value="months">Months</option>
                <option value="weeks">Weeks</option>
              </select>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm text-foreground-muted">Start date (optional)</label>
          <div className="mt-1">
            <input type="date" value={startDate ?? ""} onChange={(e) => setStartDate(e.target.value)} className="px-3 py-2 rounded-md border" />
          </div>
        </div>

        <div>
          <label className="block text-sm text-foreground-muted">Note (optional)</label>
          <input className="w-full mt-1 px-3 py-2 rounded-md border" value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Save for a summer sale shirt" />
        </div>

        <div className="pt-2">
          <div className="rounded-md bg-gradient-to-r from-pink-50 to-purple-50 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-white/60 border">
                <Target size={18} />
              </div>
              <div>
                <div className="text-sm text-foreground-muted">You need to save</div>
                <div className="text-xl font-semibold">
                  {perPeriod > 0 ? `₹${perPeriod.toFixed(2)} / ${friendlyUnit}` : "—"}
                </div>
                {perMonthIfWeeks ? (
                  <div className="text-xs text-foreground-muted mt-1">
                    ~ ₹{perMonthIfWeeks.toFixed(2)} / month (approx.)
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        {error && <div className="text-sm text-red-500 mt-1">{error}</div>}

        <div className="flex gap-2 mt-2">
          <button onClick={handleSave} disabled={saving} className="px-4 py-2 rounded-md bg-gradient-to-r from-pink-500 to-purple-600 text-white">
            {saving ? "Saving..." : "Save Goal"}
          </button>
          <button onClick={() => {
            // reset form
            setName("")
            setTarget("")
            setDuration("3")
            setUnit("months")
            setStartDate(undefined)
            setNote("")
            setError(null)
          }} className="px-4 py-2 rounded-md border">
            Reset
          </button>
        </div>
      </div>
    </div>
  )
}   