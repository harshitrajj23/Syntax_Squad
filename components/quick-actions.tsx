"use client"

import React, { useState } from "react"
import { Send, Download, CreditCard, QrCode, X } from "lucide-react"

/**
 * QuickActions component
 * - Four action cards: Send Money, Request Money, Pay Bills, My QR Code
 * - Each opens a tiny modal (client-only, no backend required)
 *
 * Save this file as: components/quick-actions.tsx
 */

export default function QuickActions() {
  const [open, setOpen] = useState<null | "send" | "request" | "bill" | "qr">(null)
  const close = () => setOpen(null)

  return (
    <div className="w-full">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <button
          onClick={() => setOpen("send")}
          className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gradient-to-br from-white/6 to-white/3 border border-white/6 hover:scale-[1.02] transform transition"
        >
          <div className="p-3 rounded-lg bg-pink-500/10">
            <Send className="text-pink-500" />
          </div>
          <div className="text-sm font-semibold">Send</div>
          <div className="text-xs text-foreground-muted">Transfer money</div>
        </button>

        <button
          onClick={() => setOpen("request")}
          className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gradient-to-br from-white/6 to-white/3 border border-white/6 hover:scale-[1.02] transform transition"
        >
          <div className="p-3 rounded-lg bg-purple-500/10">
            <Download className="text-purple-500" />
          </div>
          <div className="text-sm font-semibold">Request</div>
          <div className="text-xs text-foreground-muted">Ask for money</div>
        </button>

        <button
          onClick={() => setOpen("bill")}
          className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gradient-to-br from-white/6 to-white/3 border border-white/6 hover:scale-[1.02] transform transition"
        >
          <div className="p-3 rounded-lg bg-indigo-500/10">
            <CreditCard className="text-indigo-500" />
          </div>
          <div className="text-sm font-semibold">Pay Bills</div>
          <div className="text-xs text-foreground-muted">Auto or manual</div>
        </button>

        <button
          onClick={() => setOpen("qr")}
          className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gradient-to-br from-white/6 to-white/3 border border-white/6 hover:scale-[1.02] transform transition"
        >
          <div className="p-3 rounded-lg bg-green-500/10">
            <QrCode className="text-green-500" />
          </div>
          <div className="text-sm font-semibold">My QR</div>
          <div className="text-xs text-foreground-muted">Receive payments</div>
        </button>
      </div>

      {/* Simple modal area */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={close}
            aria-hidden
          />
          <div className="relative z-10 w-full max-w-md p-6 rounded-2xl bg-background border border-border shadow-xl">
            <div className="flex items-start justify-between mb-4">
              <div className="text-lg font-semibold">
                {open === "send" && "Send Money"}
                {open === "request" && "Request Money"}
                {open === "bill" && "Pay a Bill"}
                {open === "qr" && "My QR Code"}
              </div>
              <button onClick={close} className="p-1 rounded hover:bg-background-secondary">
                <X size={18} />
              </button>
            </div>

            {/* Modal content (simple forms / examples) */}
            {open === "send" && (
              <div className="space-y-3">
                <input className="w-full px-3 py-2 rounded border" placeholder="Recipient email or UPI id" />
                <input className="w-full px-3 py-2 rounded border" placeholder="Amount (₹)" />
                <div className="flex gap-2">
                  <button className="px-4 py-2 rounded bg-pink-500 text-white">Send</button>
                  <button onClick={close} className="px-4 py-2 rounded border">Cancel</button>
                </div>
                <div className="text-xs text-foreground-muted">This demo button shows UI only — no transaction is performed.</div>
              </div>
            )}

            {open === "request" && (
              <div className="space-y-3">
                <input className="w-full px-3 py-2 rounded border" placeholder="Requester name / email" />
                <input className="w-full px-3 py-2 rounded border" placeholder="Amount (₹)" />
                <div className="flex gap-2">
                  <button className="px-4 py-2 rounded bg-purple-600 text-white">Request</button>
                  <button onClick={close} className="px-4 py-2 rounded border">Cancel</button>
                </div>
                <div className="text-xs text-foreground-muted">In production this would send a request notification.</div>
              </div>
            )}

            {open === "bill" && (
              <div className="space-y-3">
                <input className="w-full px-3 py-2 rounded border" placeholder="Biller name (eg. TV service)" />
                <input className="w-full px-3 py-2 rounded border" placeholder="Amount (₹)" />
                <select className="w-full px-3 py-2 rounded border">
                  <option>One-time</option>
                  <option>Monthly</option>
                </select>
                <div className="flex gap-2">
                  <button className="px-4 py-2 rounded bg-indigo-600 text-white">Schedule</button>
                  <button onClick={close} className="px-4 py-2 rounded border">Cancel</button>
                </div>
                <div className="text-xs text-foreground-muted">This shows the scheduler UI — integrate with scheduled_payments later.</div>
              </div>
            )}

            {open === "qr" && (
              <div className="space-y-3 text-center">
                {/* Using your local mock preview image as QR placeholder */}
                <img src={"/mnt/data/Screenshot 2025-11-21 at 11.33.43 AM.png"} alt="QR preview" className="mx-auto w-40 h-40 rounded-lg object-cover shadow-sm" />
                <div className="text-sm">Share this QR to receive payments (demo image)</div>
                <div className="flex gap-2 justify-center mt-3">
                  <button className="px-4 py-2 rounded bg-green-600 text-white">Copy Link</button>
                  <button onClick={close} className="px-4 py-2 rounded border">Close</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}