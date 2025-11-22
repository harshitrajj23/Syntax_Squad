"use client"
import QuickActions from "@/components/quick-actions"
import React, { useEffect, useState, useCallback } from "react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import DashboardStats from "@/components/dashboard-stats"
import InsightsCard from "@/components/insights-card"
import SpendingChart from "@/components/spendingchart"
import TransactionList from "@/components/transaction-list"
import TransactionForm from "@/components/transaction-form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, CreditCard } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js"


import BudgetGoal from "@/components/budget-goal"

{/* inside JSX */}
<BudgetGoal onSave={(goal) => {
  console.log("saved goal (frontend):", goal)
  // for now just console log — later we can push to supabase or add to local state
}} />







// import base UI transaction shape (ensure this file exports the interface)
import type { Transaction as BaseTransaction } from "@/components/transaction-list"

// Extend the imported Transaction with an optional optimistic flag so we can render optimistic rows
type Transaction = BaseTransaction & { isOptimistic?: boolean }

// --- Mock data for the spending chart (replace with real aggregated data later) ---
const mockSpending = [
  { month: "Jan", spent: 1200 },
  { month: "Feb", spent: 980 },
  { month: "Mar", spent: 1450 },
  { month: "Apr", spent: 1100 },
  { month: "May", spent: 1600 },
  { month: "Jun", spent: 900 },
]

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [userEmail, setUserEmail] = useState<string | null>(null)

  // transactions list (includes optimistic rows)
  const [txs, setTxs] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const stats = [
    {
      label: "Total Balance",
      value: "₹12,543.50",
      change: "12.5% from last month",
      icon: <CreditCard size={20} />,
      positive: true,
    },
    {
      label: "Monthly Spent",
      value: "₹2,341.20",
      change: "8.3% less than last month",
      icon: <TrendingDown size={20} />,
      positive: true,
    },
    {
      label: "Monthly Income",
      value: "₹4,200.00",
      change: "No change from last month",
      icon: <TrendingUp size={20} />,
      positive: true,
    },
  ]

  // Prefer a public image for production (move your local preview to public/preview.png)
  // If you want to keep the local file while developing, you can point to it directly.
  const MOCK_URL = process.env.PUBLIC_APP_MOCK_URL || "/preview.png"

  // Map DB row -> Transaction (UI) shape
  const mapRowToTransaction = (d: any): Transaction => ({
    id: d.id,
    merchant: d.merchant ?? "Unknown",
    category: d.category ?? "Other",
    amount: Number(d.amount ?? 0),
    date: d.created_at ? new Date(d.created_at).toLocaleString() : d.date ?? "",
    // ensure icon is always a string for UI; DB may not provide it
    icon: typeof d.icon === "string" && d.icon ? d.icon : "💳",
    type: d.type === "income" ? "income" : "expense",
  })

  const fetchTransactions = useCallback(async (user_id?: string) => {
    if (!user_id) return
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase
        .from("securepay_transactions")
        .select("*")
        .eq("user_id", user_id)
        .order("created_at", { ascending: false })

      if (error) throw error

      // map database rows to the Transaction shape used by the UI
      const mapped = (data ?? []).map(mapRowToTransaction)
      setTxs(mapped)
    } catch (err: any) {
      console.error("Fetch txs error:", err)
      setError(err?.message ?? "Failed to load transactions")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let currentUserId: string | undefined

    // get current user
    supabase.auth.getUser().then(({ data }: any) => {
      const user = data?.user
      if (user) {
        currentUserId = user.id
        setUserEmail(user.email ?? null)
        fetchTransactions(user.id)
      }
    })

    // subscribe to changes on securepay_transactions so we refresh automatically
    const channel = supabase
      .channel("public:securepay_transactions")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "securepay_transactions" },
        (payload: RealtimePostgresChangesPayload<any>) => {
          try {
            const record = (payload.new ?? payload.old) as any
            if (!currentUserId) return
            if (record?.user_id === currentUserId) {
              // fetch latest list for current user (keeps DB canonical)
              fetchTransactions(currentUserId)
            }
          } catch (err) {
            console.warn("Realtime handler error", err)
          }
        }
      )
      .subscribe()

    return () => {
      if (channel) supabase.removeChannel(channel)
    }
  }, [fetchTransactions])

  // called after a transaction is added to refresh the list
  const handleAdded = async () => {
    try {
      const { data } = await supabase.auth.getUser()
      const user = data?.user
      if (user) await fetchTransactions(user.id)
    } catch (err) {
      console.warn("refresh after add error", err)
    }
  }

  // ---- Optimistic handlers to pass into TransactionForm ----
  const handleOptimisticAdd = (tempTx: Transaction) => {
    // Prepend optimistic transaction (keep existing order)
    setTxs((s) => [tempTx, ...s])
  }

  const handleRevertOptimistic = (tempId: string) => {
    setTxs((s) => s.filter((t) => t.id !== tempId))
  }

  const handleReplaceOptimistic = (tempId: string, realRow: Transaction) => {
    setTxs((s) => s.map((t) => (t.id === tempId ? realRow : t)))
  }

  // basic aggregator for the InsightsCard (derive last7Days & avg/day)
  const calcInsights = (rows: Transaction[]) => {
    const last7 = rows
      .filter((r) => {
        // simple: keep rows created in last 7 days (if date parseable)
        const d = new Date(r.date)
        return !isNaN(d.getTime()) && Date.now() - d.getTime() <= 7 * 24 * 60 * 60 * 1000
      })
      .reduce((sum, r) => sum + (r.type === "income" ? r.amount : Math.abs(r.amount)), 0)
    const avg = last7 / 7
    return { last7Days: last7 ?? 0, avgPerDay: avg ?? 0 }
  }

  const insights = calcInsights(txs)

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">Dashboard</h1>
            <p className="text-foreground-muted">
              Welcome back{userEmail ? `, ${userEmail}` : ""}! Here's your financial overview.
            </p>
          </div>

          {/* Stats */}
          <DashboardStats stats={stats} />
          {/* Quick actions (Send / Request / Pay Bills / My QR) */}
          <div className="mt-6">
            <QuickActions />
          </div>

          {/* Insights + Chart */}
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <InsightsCard balance={txs.reduce((sum, t) => sum + (t.type === "income" ? t.amount : -t.amount), 0)}
              last7Days={insights.last7Days}
              avgPerDay={insights.avgPerDay} />
            </div>

            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Spending (last 6 months)</CardTitle>
                  <CardDescription>Overview of monthly expenses</CardDescription>
                </CardHeader>
                <CardContent>
                  {/* pass the mockSpending data to the chart component */}
                  <SpendingChart data={mockSpending} />
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Tabs with transactions + add form */}
          <Tabs defaultValue="overview" className="mt-12" onValueChange={setActiveTab}>
            <TabsList className="grid w-full max-w-sm grid-cols-2">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="add-transaction">Add Transaction</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-8 mt-8">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Transactions</CardTitle>
                  <CardDescription>Your latest financial activity</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="py-8 text-center text-sm text-foreground-muted">Loading transactions...</div>
                  ) : error ? (
                    <div className="py-8 text-center text-sm text-red-400">{error}</div>
                  ) : (
                    <TransactionList transactions={txs.length ? txs : []} />
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Add Transaction Tab */}
            <TabsContent value="add-transaction" className="mt-8">
              <Card>
                <CardHeader>
                  <CardTitle>Add New Transaction</CardTitle>
                  <CardDescription>Record a new expense or income</CardDescription>
                </CardHeader>
                <CardContent>
                  <TransactionForm
                    onAdded={handleAdded}
                    onOptimisticAdd={handleOptimisticAdd}
                    onRevertOptimistic={handleRevertOptimistic}
                    onReplaceOptimistic={handleReplaceOptimistic}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Preview / Mock */}
          <div className="mt-10">
            <Card>
              <CardHeader>
                <CardTitle>App Preview</CardTitle>
                <CardDescription>Mobile preview of SecurePay+</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center p-6">
                <img src={MOCK_URL} alt="App preview" className="w-72 rounded-lg shadow-md object-cover" />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}