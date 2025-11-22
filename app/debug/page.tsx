"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"

export default function DebugPage() {
  const [info, setInfo] = useState<any>({ loading: true })

  useEffect(() => {
    async function load() {
      const userRes = await supabase.auth.getUser()
      const sessRes = await supabase.auth.getSession()
      // read localStorage tokens that Supabase uses
      let accessToken = null
      try {
        accessToken = localStorage.getItem("supabase.auth.token")
      } catch (e) {
        accessToken = `error reading localStorage: ${String(e)}`
      }

      setInfo({
        loading: false,
        user: userRes?.data?.user ?? null,
        session: sessRes?.data?.session ?? null,
        userRes,
        sessRes,
        localStorageToken: accessToken,
        now: new Date().toISOString(),
      })
    }
    load()
  }, [])

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ marginBottom: 12 }}>Debug — Supabase auth</h1>
      <pre style={{ background: "#0b0b0b", color: "#dcdcdc", padding: 12, borderRadius: 8 }}>
        {JSON.stringify(info, null, 2)}
      </pre>
      <p style={{ marginTop: 12 }}>
        If `user` is null but you expected a sign-in, please:
        <ol>
          <li>Open Console (Cmd+Opt+I) → Network → Filter "auth".</li>
          <li>Try signing in/up and paste the `/auth/v1/...` request response here.</li>
        </ol>
      </p>
    </div>
  )
}