"use client"

import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, ArrowLeft, Loader2, Users, CheckCircle2 } from "lucide-react"

function JoinPageContent() {
  const searchParams = useSearchParams()
  const codeFromUrl = searchParams.get("code")
  
  const [code, setCode] = useState(codeFromUrl || "")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [club, setClub] = useState<{ id: string; name: string; description: string | null } | null>(null)
  const [joined, setJoined] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  // Auto-lookup club if code is in URL
  useEffect(() => {
    if (codeFromUrl) {
      lookupClub(codeFromUrl)
    }
  }, [codeFromUrl])

  const lookupClub = async (inviteCode: string) => {
    setLoading(true)
    setError(null)
    setClub(null)

    const { data, error: lookupError } = await supabase
      .from("clubs")
      .select("id, name, description")
      .eq("invite_code", inviteCode)
      .single()

    if (lookupError || !data) {
      setError("Club not found. Please check the invite code.")
      setLoading(false)
      return
    }

    setClub(data)
    setLoading(false)
  }

  const handleJoin = async () => {
    if (!club) return

    setLoading(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      // Redirect to signup with return URL (properly encoded)
      router.push(`/signup?next=${encodeURIComponent(`/join?code=${code}`)}`)
      return
    }

    // Check if already a member
    const { data: existing } = await supabase
      .from("club_members")
      .select("id")
      .eq("club_id", club.id)
      .eq("user_id", user.id)
      .single()

    if (existing) {
      // Already a member, redirect to club
      router.push(`/club/${club.id}`)
      return
    }

    // Join the club
    const { error: joinError } = await supabase
      .from("club_members")
      .insert({
        club_id: club.id,
        user_id: user.id,
        role: "member",
      })

    if (joinError) {
      setError(joinError.message)
      setLoading(false)
      return
    }

    setJoined(true)
    setLoading(false)

    // Redirect after a moment
    setTimeout(() => {
      router.push(`/club/${club.id}`)
    }, 2000)
  }

  if (joined && club) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold mb-2">
            Welcome to {club.name}!
          </h1>
          <p className="text-[var(--muted-foreground)] mb-4">
            You've successfully joined the club. Redirecting...
          </p>
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-[var(--primary)]" />
        </div>
      </div>
    )
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

      <main className="max-w-md mx-auto px-6 py-12">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--plum-500)] to-[var(--plum-600)] flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold mb-2">
            Join a Book Club
          </h1>
          <p className="text-[var(--muted-foreground)]">
            Enter your invite code to join an existing club
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            {!club ? (
              <form onSubmit={(e) => { e.preventDefault(); lookupClub(code) }} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Invite Code</Label>
                  <Input
                    id="code"
                    type="text"
                    placeholder="Enter invite code..."
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    required
                  />
                </div>

                {error && (
                  <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg">
                    {error}
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={loading || !code}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Looking up club...
                    </>
                  ) : (
                    "Find Club"
                  )}
                </Button>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="text-center p-4 rounded-xl bg-[var(--muted)]/50">
                  <h3 className="font-[family-name:var(--font-display)] text-xl font-semibold mb-1">
                    {club.name}
                  </h3>
                  {club.description && (
                    <p className="text-sm text-[var(--muted-foreground)]">
                      {club.description}
                    </p>
                  )}
                </div>

                {error && (
                  <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg">
                    {error}
                  </div>
                )}

                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => { setClub(null); setCode("") }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    className="flex-1"
                    onClick={handleJoin}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Joining...
                      </>
                    ) : (
                      "Join Club"
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

export default function JoinPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
      </div>
    }>
      <JoinPageContent />
    </Suspense>
  )
}
