import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  BookOpen, ArrowLeft, Users, Calendar, Copy, Plus, 
  Vote, Sparkles, Clock, CheckCircle2 
} from "lucide-react"
import { NominateBookForm } from "./nominate-book-form"
import { VotingSection } from "./voting-section"
import { MembersSection } from "./members-section"
import { QuestionsSection } from "./questions-section"
import { GenerateQuestionsButton } from "./generate-questions-button"
import { CopyInviteButton } from "./copy-invite-button"
import { ScheduleMeetingForm } from "./schedule-meeting-form"
import { UpcomingMeetings } from "./upcoming-meetings"
import { FinishBookButton } from "./finish-book-button"
import { ReadingHistory } from "./reading-history"

interface ClubPageProps {
  params: Promise<{ id: string }>
}

export default async function ClubPage({ params }: ClubPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  // Get user profile for premium status
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_premium")
    .eq("id", user.id)
    .single()

  const isPremium = profile?.is_premium || false

  // Get club details
  const { data: club, error: clubError } = await supabase
    .from("clubs")
    .select("*")
    .eq("id", id)
    .single()

  if (clubError || !club) notFound()

  // Check membership
  const { data: membership } = await supabase
    .from("club_members")
    .select("*")
    .eq("club_id", id)
    .eq("user_id", user.id)
    .single()

  if (!membership) {
    redirect("/dashboard")
  }

  // Get all members with profiles
  const { data: members } = await supabase
    .from("club_members")
    .select(`
      *,
      profile:profiles(*)
    `)
    .eq("club_id", id)

  // Get books
  const { data: books } = await supabase
    .from("books")
    .select(`
      *,
      theme:themes(*),
      nominated_by_profile:profiles!books_nominated_by_fkey(*),
      votes:book_votes(*)
    `)
    .eq("club_id", id)
    .order("created_at", { ascending: false })

  // Get themes
  const { data: themes } = await supabase
    .from("themes")
    .select("*")
    .order("sort_order")

  const currentBook = books?.find(b => b.status === "reading" || b.status === "selected")
  const nominatedBooks = books?.filter(b => b.status === "nominated" || b.status === "voting") || []
  const finishedBooks = books?.filter(b => b.status === "finished") || []

  // Get discussion questions for current book
  const { data: questions } = currentBook ? await supabase
    .from("discussion_questions")
    .select(`
      *,
      assigned_to_profile:profiles!discussion_questions_assigned_to_fkey(*)
    `)
    .eq("book_id", currentBook.id)
    .order("sort_order") : { data: null }

  // Get upcoming meetings
  const { data: meetings } = await supabase
    .from("meetings")
    .select(`
      *,
      book:books(title, author)
    `)
    .eq("club_id", id)
    .gte("scheduled_at", new Date().toISOString())
    .order("scheduled_at", { ascending: true })
    .limit(5)

  const isOwner = membership.role === "owner"
  const isOwnerOrAdmin = membership.role === "owner" || membership.role === "admin"
  const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/join?code=${club.invite_code}`

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="border-b border-[var(--border)] bg-white">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
            <ArrowLeft className="w-4 h-4" />
            Dashboard
          </Link>
          <div className="flex items-center gap-2">
            <Badge variant="amber">{club.meeting_cadence === "monthly" ? "Monthly" : "6-Week"}</Badge>
            {isOwner && <Badge variant="plum">Owner</Badge>}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 overflow-visible">
        {/* Club Header */}
        <div className="mb-8">
          <h1 className="font-[family-name:var(--font-display)] text-4xl font-bold mb-2">
            {club.name}
          </h1>
          {club.description && (
            <p className="text-lg text-[var(--muted-foreground)]">{club.description}</p>
          )}
          {club.current_theme && (
            <Badge variant="amber" className="mt-3">
              Current Theme: {club.current_theme}
            </Badge>
          )}
        </div>

        {/* Invite Link */}
        <Card className="mb-8 bg-gradient-to-r from-[var(--plum-50)] to-[var(--plum-50)] border-none">
          <CardContent className="py-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="font-medium mb-1">Invite friends to join</p>
                <p className="text-sm text-[var(--muted-foreground)]">
                  Share this link: <code className="bg-white/50 px-2 py-1 rounded">{inviteUrl}</code>
                </p>
              </div>
                            <CopyInviteButton inviteUrl={inviteUrl} />
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-8 overflow-visible">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Current Book */}
            {currentBook ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2 text-[var(--muted-foreground)] mb-2">
                    <BookOpen className="w-4 h-4" />
                    <span className="text-sm font-medium">Currently Reading</span>
                  </div>
                  <CardTitle className="text-2xl">{currentBook.title}</CardTitle>
                  <CardDescription className="text-base">by {currentBook.author}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3 mb-6">
                    {currentBook.page_count && (
                      <Badge variant="outline">
                        <Clock className="w-3 h-3 mr-1" />
                        {currentBook.page_count} pages
                      </Badge>
                    )}
                    {currentBook.theme && (
                      <Badge variant="amber">
                        {currentBook.theme.icon} {currentBook.theme.name}
                      </Badge>
                    )}
                    <Badge variant="plum">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      {currentBook.status === "reading" ? "Reading" : "Selected"}
                    </Badge>
                  </div>

                  {/* Discussion Questions */}
                  {questions && questions.length > 0 ? (
                    <QuestionsSection questions={questions} />
                  ) : isOwnerOrAdmin ? (
                    <GenerateQuestionsButton 
                      bookId={currentBook.id} 
                      clubId={id}
                      hasQuestions={false}
                      isPremium={isPremium}
                    />
                  ) : (
                    <p className="text-sm text-[var(--muted-foreground)] italic">
                      Discussion questions will be generated by the club organizer.
                    </p>
                  )}

                  {/* Finish Book Button - Owner/Admin only */}
                  {isOwnerOrAdmin && (
                    <FinishBookButton bookId={currentBook.id} />
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="text-center py-8">
                <CardContent>
                  <BookOpen className="w-12 h-12 text-[var(--muted-foreground)] mx-auto mb-4" />
                  <h3 className="font-[family-name:var(--font-display)] text-xl font-semibold mb-2">
                    No book selected yet
                  </h3>
                  <p className="text-[var(--muted-foreground)] mb-4">
                    Nominate books below and vote to select your first read!
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Nominations & Voting */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Vote className="w-5 h-5" />
                      Book Nominations
                    </CardTitle>
                    <CardDescription>
                      Nominate books and vote for your next read
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Nominate Form */}
                <NominateBookForm 
                  clubId={id} 
                  themes={themes || []} 
                  currentTheme={club.current_theme}
                />

                {/* Nominated Books */}
                {nominatedBooks.length > 0 && (
                  <VotingSection 
                    books={nominatedBooks} 
                    userId={user.id}
                    clubId={id}
                    isOwnerOrAdmin={isOwnerOrAdmin}
                  />
                )}
              </CardContent>
            </Card>

            {/* Reading History */}
            <ReadingHistory books={finishedBooks} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6 overflow-visible">
            {/* Schedule Meeting (owner/admin only) */}
            {isOwnerOrAdmin && (
              <ScheduleMeetingForm 
                clubId={id} 
                currentBookId={currentBook?.id}
                currentBookTitle={currentBook?.title}
                isPremium={isPremium}
              />
            )}

            {/* Upcoming Meetings */}
            <UpcomingMeetings meetings={meetings || []} />

            {/* Members */}
            <MembersSection members={members || []} isOwner={isOwner} clubId={id} />
          </div>
        </div>
      </main>
    </div>
  )
}
