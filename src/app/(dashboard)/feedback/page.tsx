import { redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { BookOpen, ArrowLeft } from "lucide-react"

export default async function FeedbackPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="border-b border-[var(--border)] bg-white">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--plum-500)] to-[var(--plum-700)] flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="font-[family-name:var(--font-display)] text-xl font-semibold">ClubReads</span>
          </Link>
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold mb-2">
          Send Feedback
        </h1>
        <p className="text-[var(--muted-foreground)] mb-8">
          Have a feature idea, found a bug, or need help? We read every submission.
        </p>

        <div className="bg-white rounded-xl border border-[var(--border)] overflow-hidden">
          <iframe
            src="https://docs.google.com/forms/d/e/1FAIpQLSfBTNjsAWl8rNAJwxLss7QcT1LXU4KvXAGOIhNznIMO0_YYlg/viewform?embedded=true"
            width="100%"
            height="700"
            frameBorder="0"
            className="w-full"
          >
            Loading…
          </iframe>
        </div>
      </main>
    </div>
  )
}