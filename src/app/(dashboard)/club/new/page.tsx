"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, ArrowLeft, Loader2, Check } from "lucide-react"
import type { Theme } from "@/lib/types"

export default function NewClubPage() {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [cadence, setCadence] = useState<"monthly" | "6-week">("monthly")
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null)
  const [themes, setThemes] = useState<Theme[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchThemes = async () => {
      const { data } = await supabase
        .from("themes")
        .select("*")
        .order("sort_order")
      if (data) setThemes(data)
    }
    fetchThemes()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError("You must be logged in to create a club")
      setLoading(false)
      return
    }

    // Check premium status and club limit
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_premium")
      .eq("id", user.id)
      .single()

    const { data: ownedClubs } = await supabase
      .from("club_members")
      .select("id")
      .eq("user_id", user.id)
      .eq("role", "owner")

    const isPremium = profile?.is_premium || false
    const ownedCount = ownedClubs?.length || 0

    if (!isPremium && ownedCount >= 1) {
      setError("Free accounts can only own 1 club. Upgrade to Premium for unlimited clubs!")
      setLoading(false)
      return
    }

    // Create the club
    const { data: club, error: clubError } = await supabase
      .from("clubs")
      .insert({
        name,
        description,
        owner_id: user.id,
        meeting_cadence: cadence,
        current_theme: selectedTheme ? themes.find(t => t.id === selectedTheme)?.name : null,
      })
      .select()
      .single()

    if (clubError) {
      setError(clubError.message)
      setLoading(false)
      return
    }

    // Add the creator as owner member
    const { error: memberError } = await supabase
      .from("club_members")
      .insert({
        club_id: club.id,
        user_id: user.id,
        role: "owner",
      })

    if (memberError) {
      setError(memberError.message)
      setLoading(false)
      return
    }

    router.push(`/club/${club.id}`)
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="border-b border-[var(--border)] bg-white">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center">
          <Link href="/dashboard" className="flex items-center gap-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--plum-500)] to-[var(--plum-700)] flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold mb-2">
            Create Your Book Club
          </h1>
          <p className="text-[var(--muted-foreground)]">
            Set up your club in seconds, then invite friends to join
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Club Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Club Name *</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="e.g., The Page Turners"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  type="text"
                  placeholder="What's your club about?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              {/* Meeting Cadence */}
              <div className="space-y-3">
                <Label>Meeting Cadence</Label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setCadence("monthly")}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      cadence === "monthly"
                        ? "border-[var(--primary)] bg-[var(--plum-50)]"
                        : "border-[var(--border)] hover:border-[var(--plum-300)]"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">Monthly</span>
                      {cadence === "monthly" && <Check className="w-5 h-5 text-[var(--primary)]" />}
                    </div>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      Meet once a month. Best for 250-350 page books.
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCadence("6-week")}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      cadence === "6-week"
                        ? "border-[var(--primary)] bg-[var(--plum-50)]"
                        : "border-[var(--border)] hover:border-[var(--plum-300)]"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">Every 6 Weeks</span>
                      {cadence === "6-week" && <Check className="w-5 h-5 text-[var(--primary)]" />}
                    </div>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      More time for longer or denser books.
                    </p>
                  </button>
                </div>
              </div>

              {/* Starting Theme */}
              <div className="space-y-3">
                <Label>First Theme (optional)</Label>
                <p className="text-sm text-[var(--muted-foreground)]">
                  Pick a theme to guide your first book selection
                </p>
                <div className="flex flex-wrap gap-2">
                  {themes.map((theme) => (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => setSelectedTheme(selectedTheme === theme.id ? null : theme.id)}
                      className={`px-3 py-2 rounded-lg text-sm transition-all ${
                        selectedTheme === theme.id
                          ? "bg-[var(--primary)] text-white"
                          : "bg-[var(--muted)] hover:bg-[var(--plum-100)] text-[var(--foreground)]"
                      }`}
                    >
                      {theme.icon} {theme.name}
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating club...
                  </>
                ) : (
                  "Create Club"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
