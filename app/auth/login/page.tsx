"use client";
export const dynamic = "force-dynamic"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"
import type { AuthChangeEvent, Session, User } from "@supabase/supabase-js"

import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { supabase } from "@/lib/supabaseClient"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const nextParam = searchParams?.get("next") ?? "/dashboard"

  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({ email: "", password: "" })

  useEffect(() => {
    // If already logged in, redirect to `next` or dashboard
    supabase.auth.getUser().then(({ data }: { data: { user: User | null } }) => {
      if (data?.user) {
        router.push(nextParam || "/dashboard")
      }
    })

    // Listen for auth changes (useful for OAuth redirects)
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        try {
          if (session?.user) {
            // If user comes from OAuth redirect, upsert profile and redirect to saved origin
            await upsertProfile(
              session.user.id,
              session.user.user_metadata?.name || session.user.email?.split("@")[0] || ""
            )

            // Try to read stored next path (set before OAuth flow)
            const pendingNext = typeof window !== "undefined" ? localStorage.getItem("supabase_next") : null
            const target = pendingNext || nextParam || "/dashboard"

            // cleanup the stored next value
            if (typeof window !== "undefined") localStorage.removeItem("supabase_next")

            router.push(target)
          }
        } catch (err) {
          console.warn("auth state handler error:", err)
        }
      }
    )

    return () => {
      // cleanup subscription
      if (listener?.subscription) listener.subscription.unsubscribe()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setError(null)
    setMessage(null)
  }

  async function upsertProfile(id: string, display_name: string) {
    try {
      await supabase.from("profiles").upsert({
        id,
        display_name,
        updated_at: new Date().toISOString(),
      })
    } catch (err) {
      console.warn("profile upsert failed:", err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setMessage(null)
    setLoading(true)

    try {
      const { data, error: signError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })

      if (signError) {
        setError(signError.message)
        setLoading(false)
        return
      }

      // If sign-in returned a user immediately (no email flow), upsert and redirect
      if (data?.user) {
        await upsertProfile(
          data.user.id,
          data.user.user_metadata?.name || data.user.email?.split("@")[0] || ""
        )

        // redirect to `next` if present, else dashboard
        router.push(nextParam || "/dashboard")
        return
      }

      // Otherwise, if the project uses magic links / email confirm, show message
      setMessage("Check your email for a login link or confirmation if required.")
    } catch (err: any) {
      setError(err?.message || "Login failed. Try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    setError(null)
    setMessage(null)
    try {
      // Save desired redirect path to localStorage so we can read it after OAuth redirect
      if (typeof window !== "undefined" && nextParam) {
        localStorage.setItem("supabase_next", nextParam)
      }

      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          // redirect back to our app root; onAuthStateChange handles final redirect
          redirectTo: typeof window !== "undefined" ? window.location.origin : undefined,
        },
      })
      // OAuth will redirect — onAuthStateChange will upsert profile + redirect after return
    } catch (err: any) {
      setError(err?.message || "Google sign-in failed.")
    }
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-gradient-primary-subtle to-background flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-2xl grid gap-8 md:grid-cols-2 items-center">
          <div>
            <div className="rounded-2xl bg-background border border-border p-8 shadow-xl">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-foreground mb-2">Welcome Back</h1>
                <p className="text-foreground-muted">Sign in to your SecurePay+ account</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    required
                    className="w-full px-4 py-3 rounded-lg border border-border focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                  />
                </div>

                {/* Password */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-semibold text-foreground">Password</label>
                    <Link href="#" className="text-sm text-purple-600 hover:text-purple-700">
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      required
                      className="w-full px-4 py-3 rounded-lg border border-border focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-muted hover:text-foreground"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                {/* Remember Me */}
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded border-border" />
                  <span className="text-sm text-foreground-muted">Remember me</span>
                </label>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold hover:shadow-lg hover:shadow-pink-200 transition-shadow duration-300 disabled:opacity-60"
                >
                  {loading ? "Signing in..." : "Sign In"}
                </button>
              </form>

              {/* Divider */}
              <div className="my-6 flex items-center gap-4">
                <div className="flex-1 h-px bg-border"></div>
                <span className="text-sm text-foreground-muted">or</span>
                <div className="flex-1 h-px bg-border"></div>
              </div>

              {/* Social Login */}
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleGoogle}
                  className="w-full px-4 py-3 rounded-lg border border-border hover:bg-background-secondary transition-colors font-medium text-foreground"
                >
                  Continue with Google
                </button>

                <button
                  type="button"
                  disabled
                  title="Apple sign-in requires additional setup in Supabase and Apple Developer"
                  className="w-full px-4 py-3 rounded-lg border border-border bg-opacity-50 cursor-not-allowed text-foreground"
                >
                  Continue with Apple (Coming soon)
                </button>
              </div>

              <p className="text-center mt-8 text-foreground-muted">
                Don't have an account?{" "}
                <Link href="/auth/signup" className="font-semibold text-purple-600 hover:text-purple-700">
                  Sign up
                </Link>
              </p>

              {/* Feedback */}
              {error && <div className="mt-4 text-sm text-red-400">{error}</div>}
              {message && <div className="mt-4 text-sm text-green-400">{message}</div>}
            </div>
          </div>

          {/* Right: App mock / marketing */}
          <div className="hidden md:block">
            <div className="rounded-2xl p-6 bg-gradient-to-br from-white/4 to-white/2 backdrop-blur-md border border-white/6 shadow-xl">
              <div className="text-sm text-foreground-muted mb-4">Preview</div>

              {/* Use your uploaded mock image path locally; replace with PUBLIC storage URL in production */}
              <img
                src={process.env.PUBLIC_APP_MOCK_URL || "/mnt/data/Screenshot 2025-11-21 at 11.33.43 AM.png"}
                alt="App preview"
                className="w-full rounded-lg shadow-md object-cover"
              />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
