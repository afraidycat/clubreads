import { redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Plus, Users, Calendar, LogOut, Sparkles, Lock } from "lucide-react"
import { UpgradeButton } from "./upgrade-button"
import { ManageSubscriptionButton } from "./manage-subscription-button"

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Get user's profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  const isPremium = profile?.is_premium || false

  // Get user's clubs
  const { data: memberships } = await supabase
    .from("club_members")
    .select(`
      *,
      club:clubs(
        *,
        members:club_members(count)
      )
    `)
    .eq("user_id", user.id)

  const clubs = memberships?.map(m => ({
    ...m.club,
    role: m.role,
    memberCount: m.club?.members?.[0]?.count || 0
  })) || []

  // Count clubs where user is owner (for free tier limit)
  const ownedClubs = clubs.filter(c => c.role === "owner")
  const canCreateClub = isPremium || ownedClubs.length < 1

  // Get current books for each club
  const clubIds = clubs.map(c => c.id)
  const { data: currentBooks } = await supabase
    .from("books")
    .select("*")
    .in("club_id", clubIds)
    .in("status", ["selected", "reading"])

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="border-b border-[var(--border)] bg-white">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--plum-500)] to-[var(--plum-700)] flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="font-[family-name:var(--font-display)] text-xl font-semibold">ClubReads</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-[var(--muted-foreground)]">
              {profile?.full_name || user.email}
            </span>
            {profile?.is_premium && (
              <>
              <Badge variant="amber">Premium</Badge>
              <ManageSubscriptionButton />
              </>
            )}
            <form action="/api/auth/signout" method="post">
              <Button variant="ghost" size="icon">
                <LogOut className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold mb-2">
            Welcome back{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}!
          </h1>
          <p className="text-[var(--muted-foreground)]">
            {clubs.length === 0 
              ? "Create your first book club to get started"
              : `You're a member of ${clubs.length} book club${clubs.length === 1 ? '' : 's'}`
            }
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-4 mb-8">
          {canCreateClub ? (
            <Link href="/club/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Club
              </Button>
            </Link>
          ) : (
            <UpgradeButton />
          )}
          <Link href="/join">
            <Button variant="outline">
              <Users className="w-4 h-4 mr-2" />
              Join Club
            </Button>
          </Link>
        </div>

        {/* Clubs Grid */}
        {clubs.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="w-16 h-16 rounded-full bg-[var(--plum-100)] flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-[var(--plum-600)]" />
              </div>
              <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold mb-2">
                No book clubs yet
              </h2>
              <p className="text-[var(--muted-foreground)] mb-6 max-w-md mx-auto">
                Create your first book club and invite friends, or join an existing club with an invite code.
              </p>
              <div className="flex gap-4 justify-center">
                <Link href="/club/new">
                  <Button>Create Your First Club</Button>
                </Link>
                <Link href="/join">
                  <Button variant="outline">Join with Code</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clubs.map((club) => {
              const currentBook = currentBooks?.find(b => b.club_id === club.id)
              return (
                <Link key={club.id} href={`/club/${club.id}`}>
                  <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-xl">{club.name}</CardTitle>
                          <CardDescription>{club.description || "No description"}</CardDescription>
                        </div>
                        {club.role === "owner" && (
                          <Badge variant="plum">Owner</Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Current Book */}
                        {currentBook ? (
                          <div className="p-3 rounded-lg bg-[var(--muted)]/50">
                            <p className="text-xs text-[var(--muted-foreground)] mb-1">Currently reading</p>
                            <p className="font-medium">{currentBook.title}</p>
                            <p className="text-sm text-[var(--muted-foreground)]">by {currentBook.author}</p>
                          </div>
                        ) : (
                          <div className="p-3 rounded-lg bg-[var(--muted)]/50">
                            <p className="text-sm text-[var(--muted-foreground)]">No book selected yet</p>
                          </div>
                        )}

                        {/* Stats */}
                        <div className="flex items-center gap-4 text-sm text-[var(--muted-foreground)]">
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span>{club.memberCount} members</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{club.meeting_cadence === "monthly" ? "Monthly" : "6 weeks"}</span>
                          </div>
                        </div>

                        {/* Theme */}
                        {club.current_theme && (
                          <Badge variant="amber">{club.current_theme}</Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}

            {/* Add New Club Card */}
            {canCreateClub ? (
              <Link href="/club/new">
                <Card className="h-full border-dashed hover:shadow-lg transition-shadow cursor-pointer flex items-center justify-center min-h-[240px]">
                  <CardContent className="text-center">
                    <div className="w-12 h-12 rounded-full bg-[var(--muted)] flex items-center justify-center mx-auto mb-3">
                      <Plus className="w-6 h-6 text-[var(--muted-foreground)]" />
                    </div>
                    <p className="font-medium text-[var(--muted-foreground)]">Create New Club</p>
                  </CardContent>
                </Card>
              </Link>
            ) : (
              <Card className="h-full border-dashed border-[var(--plum-200)] bg-gradient-to-br from-[var(--plum-50)] to-white flex items-center justify-center min-h-[240px]">
                <CardContent className="text-center py-6">
                  <div className="w-12 h-12 rounded-full bg-[var(--plum-100)] flex items-center justify-center mx-auto mb-3">
                    <Lock className="w-6 h-6 text-[var(--plum-600)]" />
                  </div>
                  <p className="font-semibold text-[var(--foreground)] mb-1">Want more clubs?</p>
                  <p className="text-sm text-[var(--muted-foreground)] mb-4">Free accounts can own 1 club</p>
                  <UpgradeButton />
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] bg-white mt-12">
        <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-[var(--muted-foreground)]">
          <p>© {new Date().getFullYear()} ClubReads</p>
          <div className="flex items-center gap-4">
            <Link href="/guide" className="hover:text-[var(--foreground)]">
              Book Club Guide
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
