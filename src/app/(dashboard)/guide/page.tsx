import { redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { BookOpen, ArrowLeft } from "lucide-react"

export default async function GuidePage() {
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
        <article className="prose prose-lg max-w-none">
          <h1 className="font-[family-name:var(--font-display)] text-4xl font-bold mb-4">
            How to Run a Thriving Book Club
          </h1>
          
          <p className="text-xl text-[var(--muted-foreground)] mb-8">
            <strong>So you're starting a book club — congratulations!</strong> Book clubs are one of the best ways to read more, discover new perspectives, and build meaningful friendships. Here's what we've learned from studying clubs that last for years versus those that fizzle after a few months.
          </p>

          <hr className="my-8 border-[var(--border)]" />

          <section className="mb-10">
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold mb-4">
              Pick a Consistent Meeting Day
            </h2>
            <p className="text-[var(--foreground)] leading-relaxed mb-4">
              This is the single most important factor in book club success. Clubs that meet on "the first Tuesday of every month" or "every third Saturday" have dramatically better attendance than those who negotiate dates each time.
            </p>
            <p className="text-[var(--foreground)] leading-relaxed">
              Pick a day that works for your core members and stick to it. People can plan around a recurring commitment — they can't plan around chaos.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold mb-4">
              Keep Your Group the Right Size
            </h2>
            <p className="text-[var(--foreground)] leading-relaxed mb-4">
              The sweet spot is 6-12 members. Fewer than 6 and one or two absences kills the discussion. More than 12 and quieter members stop participating.
            </p>
            <p className="text-[var(--foreground)] leading-relaxed">
              If your club grows beyond 12, consider splitting into two groups rather than letting the original become unwieldy.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold mb-4">
              Set Clear Expectations Upfront
            </h2>
            <p className="text-[var(--foreground)] leading-relaxed mb-4">
              Mismatched expectations kill clubs. Before your first meeting, align on:
            </p>
            <ul className="space-y-2 mb-4">
              <li className="text-[var(--foreground)]">
                <strong>Reading pace</strong> — How long do you have to finish each book? One month? Six weeks?
              </li>
              <li className="text-[var(--foreground)]">
                <strong>Spoilers</strong> — Can you discuss the ending freely, or do you go chapter by chapter?
              </li>
              <li className="text-[var(--foreground)]">
                <strong>Attendance</strong> — Is showing up expected or optional? What about showing up without finishing?
              </li>
            </ul>
            <p className="text-[var(--foreground)] leading-relaxed">
              There are no wrong answers. The important thing is that everyone knows what they're signing up for.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold mb-4">
              Make It Easy to Participate
            </h2>
            <p className="text-[var(--foreground)] leading-relaxed mb-4">
              The most common complaint in book clubs is "members don't read the book." A few things help:
            </p>
            <ul className="space-y-2 mb-4">
              <li className="text-[var(--foreground)]">Choose books that are actually available (check your local library)</li>
              <li className="text-[var(--foreground)]">Avoid doorstoppers early on — 250-350 pages is ideal</li>
              <li className="text-[var(--foreground)]">Give enough time to finish (4-6 weeks minimum)</li>
              <li className="text-[var(--foreground)]">Send a friendly reminder a few days before meeting</li>
            </ul>
            <p className="text-[var(--foreground)] leading-relaxed">
              Remember: life gets busy. A member who shows up having read half the book is better than one who skips entirely.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold mb-4">
              Rotate Book Selection
            </h2>
            <p className="text-[var(--foreground)] leading-relaxed mb-4">
              Let members take turns picking, or use a nomination and voting system (ClubReads does this for you). This prevents one person's taste from dominating and keeps the reading varied.
            </p>
            <p className="text-[var(--foreground)] leading-relaxed">
              Rotating selection also gives everyone ownership — people are more likely to show up when "their" book is being discussed.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold mb-4">
              The Meeting Itself
            </h2>
            <p className="text-[var(--foreground)] leading-relaxed mb-4">
              A few tips for better discussions:
            </p>
            <ul className="space-y-2 mb-4">
              <li className="text-[var(--foreground)]">
                <strong>Start with general impressions</strong> — "What did everyone think?" before diving into specifics
              </li>
              <li className="text-[var(--foreground)]">
                <strong>Use discussion questions</strong> — They help when conversation stalls (ClubReads Premium generates these for you)
              </li>
              <li className="text-[var(--foreground)]">
                <strong>It's okay to dislike a book</strong> — Some of the best discussions come from disagreement
              </li>
              <li className="text-[var(--foreground)]">
                <strong>Keep it social</strong> — Leave time for food, drinks, and catching up. The book is the excuse; the community is the point.
              </li>
            </ul>
          </section>

          <section className="mb-10 p-6 bg-[var(--plum-50)] rounded-xl border border-[var(--plum-200)]">
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold mb-4">
              You've Got This
            </h2>
            <p className="text-[var(--foreground)] leading-relaxed mb-4">
              Book clubs don't need to be complicated. Pick a day, pick a book, show up, and talk about it. The rest will follow.
            </p>
            <p className="text-[var(--foreground)] leading-relaxed text-lg font-medium">
              Happy reading! 📚
            </p>
          </section>

          <div className="text-center pt-4">
            <Link href="/dashboard">
              <Button size="lg">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </article>
      </main>
    </div>
  )
}