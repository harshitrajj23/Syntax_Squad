"use client"

import { motion, AnimatePresence } from "framer-motion"

export interface Transaction {
  id: string
  merchant: string
  category: string
  amount: number
  date: string
  icon: string
  type: "income" | "expense"
  isOptimistic?: boolean
}

export interface TransactionListProps {
  transactions: Transaction[]
}

export default function TransactionList({ transactions }: TransactionListProps) {
  return (
    <div className="space-y-3">
      <AnimatePresence initial={false}>
        {transactions.map((tx) => (
          <motion.div
            key={tx.id}
            layout
            initial={{ opacity: 0, x: -12, scale: 0.995 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 12, scale: 0.99 }}
            transition={{ type: "spring", stiffness: 160, damping: 20 }}
            className={`flex items-center justify-between p-4 rounded-xl bg-background border border-border hover:border-purple-200 transition-colors ${
              tx.isOptimistic ? "opacity-80 italic" : ""
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="text-2xl">{tx.icon}</div>
              <div>
                <p className="font-medium text-foreground">{tx.merchant}</p>
                <p className="text-sm text-foreground-muted">{tx.category}</p>
              </div>
            </div>

            <div className="text-right">
              <p className={`font-semibold ${tx.type === "income" ? "text-green-600" : "text-foreground"}`}>
                {tx.type === "income" ? "+" : "-"}₹{Math.abs(tx.amount).toFixed(2)}
              </p>
              <p className="text-xs text-foreground-muted">{tx.date}</p>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}