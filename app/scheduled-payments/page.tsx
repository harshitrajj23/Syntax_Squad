"use client"

import React, { useEffect, useState, useCallback } from "react"
import { supabase } from "@/lib/supabaseClient"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"
import { Plus, Trash2, Edit, Clock } from "lucide-react"

type Scheduled = {
  id: string
  user_id: string
  payee: string
  category?: string | null
  amount: number
  currency?: string | null
  schedule_type: "monthly" | "weekly" | "daily" | "custom"
  interval_value?: number | null
  next_run?: string | null
  active?: boolean
  note?: string | null
  created_at?: string
  updated_at?: string
  isOptimistic?: boolean
}

/** helper to map DB row (any) to the Scheduled UI shape */
const mapRowToScheduled = (d: any): Scheduled => ({
  id: d.id,
  user_id: d.user_id,
  payee: d.payee,
  category: d.category ?? null,
  amount: Number(d.amount ?? 0),
  currency: d.currency ?? "INR",
  schedule_type: d.schedule_type ?? "monthly",
  interval_value: d.interval_value ?? null,
  next_run: d.next_run ?? null,
  active: typeof d.active === "boolean" ? d.active : true,
  note: d.note ?? null,
  created_at: d.created_at ?? undefined,
  updated_at: d.updated_at ?? undefined,
})

export default function ScheduledPaymentsPage() {
  const [loading, setLoading] = useState(true)
  const [schedules, setSchedules] = useState<Scheduled[]>([])
  const [error, setError] = useState<string | null>(null)

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Scheduled | null>(null)
  const [form, setForm] = useState({
    payee: "",
    category: "",
    amount: "",
    currency: "INR",
    schedule_type: "monthly",
    interval_value: "",
    note: "",
  })

  // fetch schedules only for the signed-in user
  const fetchSchedules = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data: userData } = await supabase.auth.getUser()
      const user = userData?.user
      if (!user) {
        setSchedules([])
        setLoading(false)
        return
      }

      const res = await supabase
        .from("scheduled_payments")
        .select("*")
        .eq("user_id", user.id)
        .order("next_run", { ascending: true })

      if (res.error) throw res.error

      const raw = res.data ?? []
      const mapped = raw.map(mapRowToScheduled)
      setSchedules(mapped)
    } catch (e: any) {
      console.error("fetch schedules error", e)
      setError(e?.message ?? "Failed to load schedules.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null

    // fetch and subscribe after we know the user
    ;(async () => {
      await fetchSchedules()

      const { data: userData } = await supabase.auth.getUser()
      const user = userData?.user
      if (!user) return

      // subscribe only to changes belonging to this user
      channel = supabase
        .channel(`public:scheduled_payments:user:${user.id}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "scheduled_payments",
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            // refresh canonical list when a change happens
            fetchSchedules()
          }
        )
        .subscribe()
    })()

    return () => {
      try {
        if (channel) supabase.removeChannel(channel)
      } catch (err) {
        console.warn("remove channel error:", err)
      }
    }
  }, [fetchSchedules])

  const resetForm = () =>
    setForm({
      payee: "",
      category: "",
      amount: "",
      currency: "INR",
      schedule_type: "monthly",
      interval_value: "",
      note: "",
    })

  const openAdd = () => {
    resetForm()
    setEditing(null)
    setFormOpen(true)
  }

  const openEdit = (s: Scheduled) => {
    setEditing(s)
    setForm({
      payee: s.payee,
      category: s.category ?? "",
      amount: String(s.amount ?? ""),
      currency: s.currency ?? "INR",
      schedule_type: s.schedule_type ?? "monthly",
      interval_value: s.interval_value ? String(s.interval_value) : "",
      note: s.note ?? "",
    })
    setFormOpen(true)
  }

  // improved save: uses select() so Supabase returns the upserted row
  const saveSchedule = async () => {
    setError(null)
    if (!form.payee || !form.amount) {
      setError("Please provide payee and amount.")
      return
    }

    try {
      const { data: userData } = await supabase.auth.getUser()
      const user = userData?.user
      if (!user) {
        setError("Not signed in.")
        return
      }

      const payload: any = {
        user_id: user.id,
        payee: form.payee,
        category: form.category || null,
        amount: Number(parseFloat(form.amount).toFixed(2)),
        currency: form.currency || "INR",
        schedule_type: form.schedule_type,
        interval_value: form.interval_value ? Number(form.interval_value) : null,
        note: form.note || null,
        updated_at: new Date().toISOString(),
      }

      // include id for editing (upsert will update existing)
      if (editing?.id) payload.id = editing.id

      // optimistic UI: add a temporary row
      const tempId = `temp-${Date.now()}`
      const optimistic: Scheduled = {
        id: tempId,
        user_id: user.id,
        payee: payload.payee,
        category: payload.category,
        amount: payload.amount,
        currency: payload.currency,
        schedule_type: payload.schedule_type,
        interval_value: payload.interval_value,
        next_run: payload.next_run ?? null,
        active: true,
        note: payload.note,
        isOptimistic: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      setSchedules((s) => [optimistic, ...s])
      setFormOpen(false)

      // request DB to upsert and return the row
      const res = await supabase.from("scheduled_payments").upsert(payload).select()

      if (res.error) {
        // revert optimistic
        setSchedules((s) => s.filter((x) => x.id !== tempId))
        throw res.error
      }

      const dbRow = Array.isArray(res.data) ? res.data[0] : res.data
      if (!dbRow) {
        setSchedules((s) => s.filter((x) => x.id !== tempId))
        throw new Error("No row returned from upsert")
      }

      const real: Scheduled = mapRowToScheduled(dbRow)
      // replace optimistic row with DB canonical row
      setSchedules((s) => [real, ...s.filter((x) => x.id !== tempId && x.id !== real.id)])
    } catch (e: any) {
      console.error("save schedule error", e)
      setError(e?.message ?? "Failed to save schedule.")
    }
  }

  const deleteSchedule = async (id: string) => {
    if (!confirm("Delete this scheduled payment?")) return
    try {
      const prev = schedules
      setSchedules((s) => s.filter((x) => x.id !== id))
      const res = await supabase.from("scheduled_payments").delete().eq("id", id)
      if (res.error) {
        setSchedules(prev)
        throw res.error
      }
    } catch (e: any) {
      console.error("delete schedule error", e)
      setError(e?.message ?? "Delete failed.")
    }
  }

  const scheduleSummary = (s: Scheduled) => {
    if (!s) return ""
    if (s.schedule_type === "daily") return "Every day"
    if (s.schedule_type === "weekly") return `Every week (interval ${s.interval_value ?? "—"})`
    if (s.schedule_type === "monthly") return `Every month (day ${s.interval_value ?? "—"})`
    if (s.schedule_type === "custom") return `Every ${s.interval_value ?? "—"} days`
    return s.schedule_type
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background py-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="mb-8 flex items-center gap-6">
            <img src={"/mnt/data/Screenshot 2025-11-21 at 11.33.43 AM.png"} alt="preview" className="w-28 h-28 rounded-lg object-cover shadow-md" />
            <div>
              <h1 className="text-3xl font-bold">Scheduled Payments</h1>
              <p className="text-foreground-muted">Automate recurring bills (TV, newspaper, subscriptions).</p>
            </div>
            <div className="ml-auto">
              <button onClick={openAdd} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white">
                <Plus size={16} /> New schedule
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>{editing ? "Edit schedule" : "Create schedule"}</CardTitle>
                </CardHeader>
                <CardContent>
                  {formOpen ? (
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm text-foreground-muted">Payee</label>
                        <input value={form.payee} onChange={(e) => setForm((f) => ({ ...f, payee: e.target.value }))} className="w-full mt-1 px-3 py-2 rounded-md border" />
                      </div>

                      <div>
                        <label className="text-sm text-foreground-muted">Category (optional)</label>
                        <input value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} className="w-full mt-1 px-3 py-2 rounded-md border" />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-sm text-foreground-muted">Amount</label>
                          <input value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} className="w-full mt-1 px-3 py-2 rounded-md border" />
                        </div>
                        <div>
                          <label className="text-sm text-foreground-muted">Currency</label>
                          <input value={form.currency} onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))} className="w-full mt-1 px-3 py-2 rounded-md border" />
                        </div>
                      </div>

                      <div>
                        <label className="text-sm text-foreground-muted">Schedule type</label>
                        <select value={form.schedule_type} onChange={(e) => setForm((f) => ({ ...f, schedule_type: e.target.value }))} className="w-full mt-1 px-3 py-2 rounded-md border">
                          <option value="monthly">Monthly</option>
                          <option value="weekly">Weekly</option>
                          <option value="daily">Daily</option>
                          <option value="custom">Custom (every N days)</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-sm text-foreground-muted">Interval value</label>
                        <input value={form.interval_value} onChange={(e) => setForm((f) => ({ ...f, interval_value: e.target.value }))} placeholder="Day-of-month / day-of-week / N" className="w-full mt-1 px-3 py-2 rounded-md border" />
                        <p className="text-xs text-foreground-muted mt-1">For monthly: 1-31. For weekly: 0 (Sun) to 6 (Sat). For custom: number of days.</p>
                      </div>

                      <div>
                        <label className="text-sm text-foreground-muted">Note</label>
                        <input value={form.note} onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))} className="w-full mt-1 px-3 py-2 rounded-md border" />
                      </div>

                      <div className="flex gap-2">
                        <button onClick={saveSchedule} className="px-3 py-2 rounded-md bg-purple-600 text-white">Save</button>
                        <button onClick={() => { setFormOpen(false); setEditing(null); resetForm(); }} className="px-3 py-2 rounded-md border">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-foreground-muted">Click “New schedule” to create a recurring payment.</div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-2 space-y-4">
              {loading ? (
                <div className="p-6 rounded-lg bg-background-secondary text-center">Loading...</div>
              ) : error ? (
                <div className="p-6 rounded-lg bg-red-50 text-red-600">{error}</div>
              ) : schedules.length === 0 ? (
                <Card>
                  <CardContent className="text-center text-foreground-muted">No scheduled payments yet.</CardContent>
                </Card>
              ) : (
                schedules.map((s) => (
                  <Card key={s.id}>
                    <CardContent className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-background-secondary flex items-center justify-center text-xl">
                          <Clock size={18} />
                        </div>
                        <div>
                          <div className="font-semibold">{s.payee} <span className="text-sm text-foreground-muted">• {s.category ?? "General"}</span></div>
                          <div className="text-sm text-foreground-muted">{scheduleSummary(s)} • Next: {s.next_run ? new Date(s.next_run).toLocaleString() : "TBD"}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="font-semibold">₹{Number(s.amount).toFixed(2)} <span className="text-sm text-foreground-muted">/{s.schedule_type}</span></div>
                        </div>
                        <button onClick={() => openEdit(s)} className="px-2 py-1 rounded-md bg-background-secondary"><Edit size={16} /></button>
                        <button onClick={() => deleteSchedule(s.id)} className="px-2 py-1 rounded-md bg-red-50 text-red-600"><Trash2 size={16} /></button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}