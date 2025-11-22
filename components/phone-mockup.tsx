"use client"

import { CreditCard, Send, DollarSign } from "lucide-react"

export default function PhoneMockup() {
  return (
    <div className="relative w-80 h-screen max-h-[600px]">
      {/* Phone Frame */}
      <div className="relative w-full h-full rounded-[40px] border-8 border-black bg-black shadow-2xl overflow-hidden">
        {/* Screen Content */}
        <div className="w-full h-full bg-gradient-to-b from-background to-background-secondary overflow-hidden flex flex-col">
          {/* Status Bar */}
          <div className="h-12 bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-between px-6 text-white text-xs font-medium">
            <span>9:41</span>
            <div className="flex gap-1">
              <div className="w-4 h-3 border border-white rounded-sm"></div>
              <div className="w-4 h-3 border border-white rounded-sm"></div>
              <div className="w-4 h-3 bg-white rounded-sm"></div>
            </div>
          </div>

          {/* App Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Header */}
            <div className="space-y-2">
              <p className="text-xs text-foreground-muted">Welcome back,</p>
              <h2 className="text-2xl font-bold text-foreground">Alex Chen</h2>
            </div>

            {/* Balance Card */}
            <div className="rounded-2xl bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-600 p-6 text-white space-y-8 shadow-lg">
              <div>
                <p className="text-xs opacity-90">Total Balance</p>
                <p className="text-3xl font-bold">$12,543.50</p>
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-xs opacity-90">Card Number</p>
                  <p className="text-sm font-mono">•••• •••• •••• 4892</p>
                </div>
                <CreditCard size={24} />
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3">
              <button className="rounded-xl bg-background-secondary p-4 text-center hover:bg-border transition-colors">
                <Send size={24} className="mx-auto mb-2 text-pink-500" />
                <p className="text-xs font-semibold text-foreground">Send</p>
              </button>
              <button className="rounded-xl bg-background-secondary p-4 text-center hover:bg-border transition-colors">
                <DollarSign size={24} className="mx-auto mb-2 text-purple-500" />
                <p className="text-xs font-semibold text-foreground">Request</p>
              </button>
            </div>

            {/* Recent Transactions */}
            <div>
              <p className="text-xs font-semibold text-foreground-muted uppercase tracking-wider mb-3">
                Recent Activity
              </p>
              <div className="space-y-2">
                {[
                  { name: "Spotify Premium", amount: "-$12.99", icon: "🎵" },
                  { name: "Coffee Shop", amount: "-$5.40", icon: "☕" },
                  { name: "Salary Deposit", amount: "+$4,200.00", icon: "💼" },
                ].map((tx, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-background-secondary">
                    <div className="flex items-center gap-3">
                      <div className="text-xl">{tx.icon}</div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{tx.name}</p>
                        <p className="text-xs text-foreground-muted">Today</p>
                      </div>
                    </div>
                    <p className={`font-semibold ${tx.amount.startsWith("+") ? "text-green-600" : "text-foreground"}`}>
                      {tx.amount}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notch */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-black rounded-b-3xl"></div>
    </div>
  )
}
