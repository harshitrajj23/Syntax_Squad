"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Check } from "lucide-react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { supabase } from "@/lib/supabaseClient"
import type { AuthChangeEvent, Session } from '@supabase/supabase-js'

export default function SignupPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    agree: false,
  })

  const passwordStrength = {
    hasUpper: /[A-Z]/.test(formData.password),
    hasLower: /[a-z]/.test(formData.password),
    hasNumber: /\d/.test(formData.password),
    hasMinLength: formData.password.length >= 8,
  }

  const isStrongPassword = Object.values(passwordStrength).every(Boolean)

useEffect(() => {
  // on mount: if user already logged in, redirect to dashboard
  supabase.auth.getUser().then(({ data }) => {
    if (data.user) router.push("/dashboard")
  })

  // optional: listen for OAuth redirect result and auto-upsert profile
  const { data: listener } = supabase.auth.onAuthStateChange(
    async (event: AuthChangeEvent, session: Session | null) => {
      try {
        if (session?.user) {
          // upsert profile when user signs in via OAuth
          await upsertProfile(
            session.user.id,
            session.user.user_metadata?.name || session.user.email?.split("@")[0] || ""
          )
          router.push("/dashboard")
        }
      } catch (err) {
        console.warn("auth state handler error:", err)
      }
    }
  )

  // cleanup subscription on unmount
  return () => {
    if (listener?.subscription) {
      listener.subscription.unsubscribe()
    }
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
    setError(null)
    setMessage(null)
  }

  async function upsertProfile(id: string, display_name: string) {
    // upsert profile for the signed-in user (client-side upsert is allowed due to RLS matching auth.uid())
    try {
      await supabase.from("profiles").upsert({
        id,
        display_name,
        full_name: formData.name || display_name,
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

    if (!formData.agree) {
      setError("You must agree to the Terms of Service.")
      return
    }
    if (!isStrongPassword) {
      setError("Please choose a stronger password.")
      return
    }

    setLoading(true)
    try {
      // sign up with email + password
      const { data, error: signError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      })

      if (signError) {
        setError(signError.message)
        setLoading(false)
        return
      }

      // If user was returned (some setups auto-confirm), upsert profile and redirect.
      if (data?.user) {
        await upsertProfile(data.user.id, formData.name || data.user.email?.split("@")[0] || "")
        setMessage("Account created. Redirecting...")
        router.push("/dashboard")
        return
      }

      // If email confirmation is required, show a success message.
      setMessage("Signup successful — please check your email to confirm your account.")
    } catch (err: any) {
      setError(err?.message || "Signup failed. Try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    setError(null)
    setMessage(null)
    try {
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: typeof window !== "undefined" ? window.location.origin : undefined,
        },
      })
      // The OAuth flow will redirect the browser — the onAuthStateChange listener will upsert profile after redirect.
    } catch (err: any) {
      setError(err?.message || "Google sign-in failed.")
    }
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-gradient-primary-subtle to-background flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-2xl grid gap-8 md:grid-cols-2 items-center">
          {/* Left: Card form */}
          <div>
            <div className="rounded-2xl bg-background border border-border p-8 shadow-xl">
              <div className="text-center mb-6">
                <h1 className="text-3xl font-bold text-foreground mb-2">Create Account</h1>
                <p className="text-foreground-muted">Join SecurePay+ today — secure payments with smart expense tracking.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    required
                    className="w-full px-4 py-3 rounded-lg border border-border focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                  />
                </div>

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
                  <label className="block text-sm font-semibold text-foreground mb-2">Password</label>
                  <div className="relative mb-3">
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

                  {/* Password Strength */}
                  <div className="space-y-2">
                    {[
                      { label: "At least 8 characters", check: passwordStrength.hasMinLength },
                      { label: "One uppercase letter", check: passwordStrength.hasUpper },
                      { label: "One lowercase letter", check: passwordStrength.hasLower },
                      { label: "One number", check: passwordStrength.hasNumber },
                    ].map((req) => (
                      <div key={req.label} className="flex items-center gap-2">
                        <div
                          className={`w-4 h-4 rounded-full flex items-center justify-center ${req.check ? "bg-green-100" : "bg-gray-100"}`}
                        >
                          {req.check && <Check size={14} className="text-green-600" />}
                        </div>
                        <span className={`text-xs ${req.check ? "text-green-600" : "text-foreground-muted"}`}>
                          {req.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Terms */}
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="agree"
                    checked={formData.agree}
                    onChange={handleChange}
                    required
                    className="w-4 h-4 rounded border-border mt-1"
                  />
                  <span className="text-sm text-foreground-muted">
                    I agree to the{" "}
                    <Link href="#" className="text-purple-600 hover:text-purple-700 font-medium">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="#" className="text-purple-600 hover:text-purple-700 font-medium">
                      Privacy Policy
                    </Link>
                  </span>
                </label>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={!isStrongPassword || !formData.agree || loading}
                  className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold hover:shadow-lg hover:shadow-pink-200 transition-shadow duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Creating account..." : "Create Account"}
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

              {/* Sign In Link */}
              <p className="text-center mt-6 text-foreground-muted">
                Already have an account?{" "}
                <Link href="/auth/login" className="font-semibold text-purple-600 hover:text-purple-700">
                  Sign in
                </Link>
              </p>

              {/* Feedback */}
              {error && <div className="mt-4 text-sm text-red-400">{error}</div>}
              {message && <div className="mt-4 text-sm text-green-400">{message}</div>}
            </div>
          </div>

          {/* Right: App mock / marketing (uses uploaded screenshot path) */}
          <div className="hidden md:block">
            <div className="rounded-2xl p-6 bg-gradient-to-br from-white/4 to-white/2 backdrop-blur-md border border-white/6 shadow-xl">
              <div className="text-sm text-foreground-muted mb-4">Preview</div>
              {/* local mock image path — during deployment, replace with PUBLIC URL or put file in /public */}
              <img
                src={"/mnt/data/Screenshot 2025-11-21 at 11.33.43 AM.png"}
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