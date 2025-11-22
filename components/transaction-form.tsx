"use client"

import React, { useState } from "react"
import { DollarSign } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"

/**
 * Types
 */
type FormData = {
  merchant: string
  category: string
  amount: string
  description: string
}

export interface TransactionRow {
  id: string
  merchant: string
  category: string
  amount: number
  date: string
  icon: string
  type: "income" | "expense"
  isOptimistic?: boolean
}

type Props = {
  onAdded?: () => void
  onOptimisticAdd?: (tx: TransactionRow) => void
  onRevertOptimistic?: (tempId: string) => void
  onReplaceOptimistic?: (tempId: string, realRow: TransactionRow) => void
}

/**
 * Helper: generate UUID (browser crypto if available)
 */
function makeTempId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `temp-${crypto.randomUUID()}`
  }
  return `temp-${Date.now()}-${Math.floor(Math.random() * 10000)}`
}

/**
 * Component
 */
export default function TransactionForm({
  onAdded,
  onOptimisticAdd,
  onRevertOptimistic,
  onReplaceOptimistic,
}: Props) {
  const [formData, setFormData] = useState<FormData>({
    merchant: "",
    category: "Food",
    amount: "",
    description: "",
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Category picker state + list
  const [showCategoryPicker, setShowCategoryPicker] = useState(false)
  const categories = ["Food", "Groceries", "Transport", "Shopping", "Bills", "Other"]

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setError(null)
    setSuccess(null)
  }

  // Special handler for amount field so we can auto-show the category picker
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleChange(e)
    // show the category picker once user starts typing an amount
    if (e.target.value && e.target.value.trim().length > 0) {
      setShowCategoryPicker(true)
    } else {
      // if amount cleared, keep it closed
      setShowCategoryPicker(false)
    }
  }

  const resetForm = () => {
    setFormData({ merchant: "", category: "Food", amount: "", description: "" })
    setShowCategoryPicker(false)
    setError(null)
    setSuccess(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!formData.merchant.trim()) {
      setError("Please enter the merchant name.")
      return
    }
    if (!formData.amount || Number(formData.amount) <= 0) {
      setError("Please enter a valid amount.")
      return
    }

    // create optimistic tx (temporary id)
    const tempId = makeTempId()
    const optimisticTx: TransactionRow = {
      id: tempId,
      merchant: formData.merchant,
      category: formData.category,
      amount: Number(parseFloat(formData.amount).toFixed(2)),
      date: new Date().toISOString(),
      icon: "💳",
      type: "expense",
      isOptimistic: true,
    }

    // show optimistic UI immediately
    try {
      onOptimisticAdd?.(optimisticTx)
    } catch (err) {
      // swallow any handler errors (shouldn't happen)
      console.warn("onOptimisticAdd error:", err)
    }

    setLoading(true)
    try {
      // get current user
      const { data: userData, error: userErr } = await supabase.auth.getUser()
      if (userErr) throw userErr
      const user = userData?.user
      if (!user) {
        setError("You must be logged in to add a transaction.")
        onRevertOptimistic?.(tempId)
        setLoading(false)
        return
      }

      // insert transaction into DB
      const { data: insertedRows, error: insertError } = await supabase
        .from("securepay_transactions")
        .insert([
          {
            user_id: user.id,
            type: "debit", // keep same as your DB expects
            amount: optimisticTx.amount,
            currency: "INR",
            category: optimisticTx.category,
            merchant: optimisticTx.merchant,
            purpose: formData.description || null,
            note: formData.description || null,
          },
        ])
        .select()

      if (insertError) throw insertError

      // Supabase returns an array; take first row
      const inserted = Array.isArray(insertedRows) ? insertedRows[0] : insertedRows

      // Map DB row into UI TransactionRow shape
      const realRow: TransactionRow = {
        id: inserted.id,
        merchant: inserted.merchant ?? optimisticTx.merchant,
        category: inserted.category ?? optimisticTx.category,
        amount: Number(inserted.amount ?? optimisticTx.amount),
        date: inserted.created_at ?? new Date().toISOString(),
        icon: inserted.icon ?? optimisticTx.icon,
        type: (inserted.type === "income" || inserted.type === "expense") ? inserted.type : optimisticTx.type,
      }

      // replace optimistic row with real DB row
      try {
        onReplaceOptimistic?.(tempId, realRow)
      } catch (err) {
        console.warn("onReplaceOptimistic error:", err)
      }

      setSuccess("Transaction added successfully.")
      resetForm()
      onAdded?.()
    } catch (err: any) {
      console.error("Add transaction error:", err)
      setError(err?.message || "An unexpected error occurred.")
      // revert optimistic UI
      onRevertOptimistic?.(tempId)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Merchant */}
      <div>
        <label className="block text-sm font-semibold text-foreground mb-2">Merchant Name</label>
        <input
          type="text"
          name="merchant"
          value={formData.merchant}
          onChange={handleChange}
          placeholder="Coffee shop, grocery store, etc."
          required
          className="w-full px-4 py-3 rounded-lg border border-border focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-colors"
        />
      </div>

      {/* Category + Amount */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">Category</label>

          {/* show selected category as a chip and small dropdown button */}
          <div className="flex items-center gap-2">
            <div className="px-3 py-2 rounded-full bg-background-secondary text-sm font-medium">{formData.category}</div>

            <button
              type="button"
              onClick={() => setShowCategoryPicker((s) => !s)}
              aria-expanded={showCategoryPicker}
              className="px-3 py-2 rounded-md border bg-white hover:bg-background-secondary transition text-sm"
            >
              Choose
            </button>
          </div>

          {/* Category picker (also auto-shown when typing amount) */}
          {showCategoryPicker && (
            <div className="mt-3 grid grid-cols-2 gap-2 p-3 border rounded-lg bg-background-secondary">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setFormData((f) => ({ ...f, category: cat }))
                    setShowCategoryPicker(false)
                  }}
                  className={`px-3 py-2 rounded-md text-sm transition ${
                    formData.category === cat ? "bg-purple-600 text-white" : "bg-white hover:bg-purple-50"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">Amount</label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-3 text-foreground-muted" size={20} />
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleAmountChange}
              placeholder="0.00"
              step="0.01"
              required
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-border focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Category quick picker that appears under the form when user is typing amount */}
      {/** This duplicate quick-picker gives a more obvious UI for quick selection */}
      {showCategoryPicker && (
        <div className="mt-2">
          <div className="text-sm text-foreground-muted mb-2">Quick categories</div>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setFormData((f) => ({ ...f, category: cat }))
                  setShowCategoryPicker(false)
                }}
                className={`px-3 py-1 rounded-full text-sm transition ${
                  formData.category === cat ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white" : "bg-white border hover:bg-purple-50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Notes */}
      <div>
        <label className="block text-sm font-semibold text-foreground mb-2">Notes</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Add any additional details..."
          rows={3}
          className="w-full px-4 py-3 rounded-lg border border-border focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-colors resize-none"
        />
      </div>

      {/* Submit */}
      <div>
        <button
          type="submit"
          disabled={loading}
          className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold hover:shadow-lg hover:shadow-pink-200 transition-shadow duration-300 disabled:opacity-60"
        >
          {loading ? "Adding..." : "Add Transaction"}
        </button>
      </div>

      {error && <div className="text-red-400 text-sm">{error}</div>}
      {success && <div className="text-green-400 text-sm">{success}</div>}
    </form>
  )
}