"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"
import { User, Mail, Phone, IdCard, Home, Edit, Save, X } from "lucide-react"

type ProfileRow = {
  id?: string
  display_name?: string | null
  full_name?: string | null
  email?: string | null
  aadhaar_demo?: string | null
  phone_demo?: string | null
  address_demo?: string | null
  updated_at?: string | null
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileRow | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState<ProfileRow>({})

  useEffect(() => {
    loadProfile()
  }, [])

  async function loadProfile() {
    try {
      setLoading(true)
      const { data: userData } = await supabase.auth.getUser()
      const user = userData?.user
      if (!user) {
        // No user -> clear state so UI can show sign-in link
        setProfile(null)
        setUserEmail(null)
        setLoading(false)
        return
      }

      setUserEmail(user.email ?? null)

      // try to load profile row
      const { data: profileData, error: pErr } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()

      // if row exists use it, otherwise create a minimal local row (no DB insert here)
      const row: ProfileRow =
        profileData ??
        ({
          id: user.id,
          display_name: user.user_metadata?.name ?? user.email?.split("@")[0] ?? null,
          full_name: user.user_metadata?.name ?? null,
          email: user.email ?? null,
        } as ProfileRow)

      setProfile(row)

      // seed form with values (for edit)
      setForm({
        id: row.id,
        display_name: row.display_name ?? null,
        full_name: row.full_name ?? null,
        email: row.email ?? user.email ?? null,
        aadhaar_demo: row.aadhaar_demo ?? "",
        phone_demo: row.phone_demo ?? "",
        address_demo: row.address_demo ?? "",
      })
    } catch (err) {
      console.error("Profile load error:", err)
      setError("Failed to load profile.")
    } finally {
      setLoading(false)
    }
  }

  const startEdit = () => {
    setMessage(null)
    setError(null)
    setEditing(true)
  }

  const cancelEdit = () => {
    // revert form to profile values
    if (profile) {
      setForm({
        id: profile.id,
        display_name: profile.display_name ?? null,
        full_name: profile.full_name ?? null,
        email: profile.email ?? userEmail ?? null,
        aadhaar_demo: profile.aadhaar_demo ?? "",
        phone_demo: profile.phone_demo ?? "",
        address_demo: profile.address_demo ?? "",
      })
    }
    setEditing(false)
    setMessage(null)
    setError(null)
  }

  const handleChange = (k: keyof ProfileRow, v: string) => {
    setForm((s) => ({ ...(s ?? {}), [k]: v }))
  }

  const saveProfile = async () => {
    try {
      setSaving(true)
      setMessage(null)
      setError(null)

      const { data: userData } = await supabase.auth.getUser()
      const user = userData?.user
      if (!user) {
        setError("Not authenticated.")
        setSaving(false)
        return
      }

      const upsertRow = {
        id: user.id,
        display_name: form.display_name ?? null,
        full_name: form.full_name ?? null,
        aadhaar_demo: form.aadhaar_demo ?? null,
        phone_demo: form.phone_demo ?? null,
        address_demo: form.address_demo ?? null,
        updated_at: new Date().toISOString(),
      }

      const { error: upErr } = await supabase.from("profiles").upsert(upsertRow)

      if (upErr) {
        console.error("Upsert error:", upErr)
        setError(upErr.message ?? "Save failed")
        setSaving(false)
        return
      }

      setMessage("Profile saved.")
      await loadProfile() // refresh canonical values from DB
      setEditing(false)
    } catch (err: any) {
      console.error("saveProfile error:", err)
      setError(err?.message ?? "Save failed")
    } finally {
      setSaving(false)
    }
  }

  // Loading state
  if (loading) return <p className="text-center py-20">Loading profile...</p>

  // If there's no authenticated user (no profile row), show sign-in hint/link.
  if (!profile) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-background flex items-center justify-center py-12 px-4">
          <div className="w-full max-w-xl">
            <Card className="border border-border shadow-xl">
              <CardContent className="p-8 text-center">
                <h2 className="text-2xl font-semibold mb-4">You must sign in to view your profile</h2>
                <p className="text-foreground-muted mb-6">
                  Please sign in to access your profile and personal details.
                </p>

                <div className="flex justify-center gap-3">
                  {/* Link includes next so user returns to profile after login */}
                  <a
                    href="/auth/login?next=/profile"
                    className="px-6 py-3 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-medium"
                  >
                    Sign in to continue
                  </a>

                  <a
                    href="/"
                    className="px-6 py-3 rounded-full border border-border text-foreground"
                  >
                    Back to home
                  </a>
                </div>

                {error && <div className="mt-4 text-red-500 text-sm">{error}</div>}
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  // When profile is present, show full editable profile UI
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background flex justify-center py-12 px-4">
        <Card className="w-full max-w-xl border border-border shadow-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-3xl font-bold text-center">My Profile</CardTitle>
              {!editing ? (
                <button
                  onClick={startEdit}
                  className="ml-4 inline-flex items-center gap-2 px-3 py-1 rounded-md bg-background-secondary hover:bg-background/60"
                >
                  <Edit size={16} /> Edit
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={saveProfile}
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-green-600 text-white"
                  >
                    <Save size={16} /> {saving ? "Saving..." : "Save"}
                  </button>
                  <button
                    onClick={cancelEdit}
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-red-100 text-red-700"
                  >
                    <X size={16} /> Cancel
                  </button>
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Avatar (mock image fallback to initials) */}
            <div className="flex justify-center">
              <div className="w-28 h-28 rounded-full overflow-hidden border border-border shadow-lg">
                {/* local mock image path (your uploaded file) */}
                <img
                  src={"/mnt/data/Screenshot 2025-11-21 at 11.33.43 AM.png"}
                  alt="App mock avatar"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const el = e.currentTarget as HTMLImageElement
                    el.style.display = "none"
                    const parent = el.parentElement
                    if (parent) parent.querySelector(".avatar-fallback")?.classList.remove("hidden")
                  }}
                />
                <div className="avatar-fallback hidden w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500 text-white text-3xl font-bold">
                  {(profile?.display_name ?? "U").charAt(0).toUpperCase() || "U"}
                </div>
              </div>
            </div>

            {/* Full Name */}
            <div className="flex items-center gap-4 p-4 rounded-lg border border-border bg-background-secondary">
              <User className="text-purple-600" />
              <div className="flex-1">
                <p className="text-sm text-foreground-muted">Full Name</p>
                {!editing ? (
                  <p className="text-lg font-semibold">{profile?.full_name ?? "-"}</p>
                ) : (
                  <input
                    value={form.full_name ?? ""}
                    onChange={(e) => handleChange("full_name", e.target.value)}
                    className="w-full px-3 py-2 rounded-md border border-border bg-background"
                    placeholder="Full name"
                  />
                )}
              </div>
            </div>

            {/* Display name */}
            <div className="flex items-center gap-4 p-4 rounded-lg border border-border bg-background-secondary">
              <User className="text-purple-600" />
              <div className="flex-1">
                <p className="text-sm text-foreground-muted">Display name</p>
                {!editing ? (
                  <p className="text-lg font-semibold">{profile?.display_name ?? "-"}</p>
                ) : (
                  <input
                    value={form.display_name ?? ""}
                    onChange={(e) => handleChange("display_name", e.target.value)}
                    className="w-full px-3 py-2 rounded-md border border-border bg-background"
                    placeholder="Display name"
                  />
                )}
              </div>
            </div>

            {/* Email (read-only) */}
            <div className="flex items-center gap-4 p-4 rounded-lg border border-border bg-background-secondary">
              <Mail className="text-purple-600" />
              <div className="flex-1">
                <p className="text-sm text-foreground-muted">Email</p>
                <p className="text-lg font-semibold">{userEmail ?? "-"}</p>
              </div>
            </div>

            {/* Aadhaar (demo) */}
            <div className="flex items-center gap-4 p-4 rounded-lg border border-border bg-background-secondary">
              <IdCard className="text-purple-600" />
              <div className="flex-1">
                <p className="text-sm text-foreground-muted">Aadhaar (demo)</p>
                {!editing ? (
                  <p className="text-lg font-semibold">{profile?.aadhaar_demo ?? "—"}</p>
                ) : (
                  <input
                    value={form.aadhaar_demo ?? ""}
                    onChange={(e) => handleChange("aadhaar_demo", e.target.value)}
                    className="w-full px-3 py-2 rounded-md border border-border bg-background"
                    placeholder="Aadhaar (demo)"
                  />
                )}
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-center gap-4 p-4 rounded-lg border border-border bg-background-secondary">
              <Phone className="text-purple-600" />
              <div className="flex-1">
                <p className="text-sm text-foreground-muted">Phone</p>
                {!editing ? (
                  <p className="text-lg font-semibold">{profile?.phone_demo ?? "—"}</p>
                ) : (
                  <input
                    value={form.phone_demo ?? ""}
                    onChange={(e) => handleChange("phone_demo", e.target.value)}
                    className="w-full px-3 py-2 rounded-md border border-border bg-background"
                    placeholder="Phone number"
                  />
                )}
              </div>
            </div>

            {/* Address */}
            <div className="flex items-center gap-4 p-4 rounded-lg border border-border bg-background-secondary">
              <Home className="text-purple-600" />
              <div className="flex-1">
                <p className="text-sm text-foreground-muted">Address</p>
                {!editing ? (
                  <p className="text-lg font-semibold">{profile?.address_demo ?? "—"}</p>
                ) : (
                  <input
                    value={form.address_demo ?? ""}
                    onChange={(e) => handleChange("address_demo", e.target.value)}
                    className="w-full px-3 py-2 rounded-md border border-border bg-background"
                    placeholder="Address"
                  />
                )}
              </div>
            </div>

            {message && <div className="text-green-500 text-sm">{message}</div>}
            {error && <div className="text-red-500 text-sm">{error}</div>}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </>
  )
}