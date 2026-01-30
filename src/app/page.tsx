import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Users, Calendar, Sparkles, Vote, Mail, ArrowRight, CheckCircle2 } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-[var(--background)]/80 backdrop-blur-md z-50 border-b border-[var(--border)]">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--plum-500)] to-[var(--plum-700)] flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="font-[family-name:var(--font-display)] text-xl font-semibold">ClubReads</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Log in</Button>
            </Link>
            <Link href="/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <Badge variant="amber" className="mb-6">
            ✨ Your book club, on autopilot
          </Badge>
          <h1 className="font-[family-name:var(--font-display)] text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-[1.1]">
            Run a book club
            <br />
            <span className="bg-gradient-to-r from-[var(--amber-500)] to-[var(--plum-600)] bg-clip-text text-transparent">
              without the hassle
            </span>
          </h1>
          <p className="text-xl text-[var(--muted-foreground)] mb-10 max-w-2xl mx-auto leading-relaxed">
            Voting, scheduling, discussion questions, reminders—all automated. 
            You focus on reading. We handle the organizing.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="text-lg px-8">
                Start Your Club Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="#features">
              <Button size="lg" variant="outline" className="text-lg px-8">
                See How It Works
              </Button>
            </Link>
          </div>
          <p className="text-sm text-[var(--muted-foreground)] mt-4">
            Free for clubs up to 6 members • No credit card required
          </p>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-12 border-y border-[var(--border)] bg-[var(--muted)]/30">
        <div className="max-w-4xl mx-auto px-6 flex flex-wrap items-center justify-center gap-8 text-[var(--muted-foreground)]">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            <span className="font-medium">500+ book clubs</span>
          </div>
          <div className="w-px h-6 bg-[var(--border)] hidden sm:block" />
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            <span className="font-medium">2,000+ books discussed</span>
          </div>
          <div className="w-px h-6 bg-[var(--border)] hidden sm:block" />
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            <span className="font-medium">AI-powered questions</span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-[family-name:var(--font-display)] text-4xl font-bold mb-4">
              Everything your book club needs
            </h2>
            <p className="text-lg text-[var(--muted-foreground)] max-w-2xl mx-auto">
              Stop juggling spreadsheets, group chats, and calendar invites. 
              ClubReads brings it all together.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl border border-[var(--border)] bg-white hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-[var(--plum-100)] flex items-center justify-center mb-4">
                <Vote className="w-6 h-6 text-[var(--plum-700)]" />
              </div>
              <h3 className="font-[family-name:var(--font-display)] text-xl font-semibold mb-2">
                Democratic Voting
              </h3>
              <p className="text-[var(--muted-foreground)]">
                Members nominate books and vote with ranked choice. No more endless debates—the group decides fairly.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl border border-[var(--border)] bg-white hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-[var(--plum-100)] flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-[var(--plum-700)]" />
              </div>
              <h3 className="font-[family-name:var(--font-display)] text-xl font-semibold mb-2">
                AI Discussion Questions
              </h3>
              <p className="text-[var(--muted-foreground)]">
                Get thoughtful, book-specific questions generated automatically. Each member gets assigned topics to lead.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl border border-[var(--border)] bg-white hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-[var(--plum-100)] flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6 text-[var(--plum-700)]" />
              </div>
              <h3 className="font-[family-name:var(--font-display)] text-xl font-semibold mb-2">
                Auto Scheduling
              </h3>
              <p className="text-[var(--muted-foreground)]">
                Set your cadence (monthly or 6-week) and we'll handle meeting reminders. Never miss a discussion.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-2xl border border-[var(--border)] bg-white hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-[var(--plum-100)] flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6 text-[var(--plum-700)]" />
              </div>
              <h3 className="font-[family-name:var(--font-display)] text-xl font-semibold mb-2">
                Themed Rotations
              </h3>
              <p className="text-[var(--muted-foreground)]">
                Psychological thrillers, hidden gems, international fiction—themed months keep things fresh and discoverable.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-2xl border border-[var(--border)] bg-white hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-[var(--plum-100)] flex items-center justify-center mb-4">
                <Mail className="w-6 h-6 text-[var(--plum-700)]" />
              </div>
              <h3 className="font-[family-name:var(--font-display)] text-xl font-semibold mb-2">
                Email Digests
              </h3>
              <p className="text-[var(--muted-foreground)]">
                Weekly updates with reading progress, upcoming meetings, and assigned discussion topics. Everyone stays in sync.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 rounded-2xl border border-[var(--border)] bg-white hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-[var(--plum-100)] flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-[var(--plum-700)]" />
              </div>
              <h3 className="font-[family-name:var(--font-display)] text-xl font-semibold mb-2">
                Easy Invites
              </h3>
              <p className="text-[var(--muted-foreground)]">
                Share a simple link. Friends join instantly—no app downloads, no complicated setup. Just click and read.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 px-6 bg-[var(--muted)]/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-[family-name:var(--font-display)] text-4xl font-bold mb-4">
              Simple, fair pricing
            </h2>
            <p className="text-lg text-[var(--muted-foreground)]">
              Start free, upgrade when you need more
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Free Tier */}
            <div className="p-8 rounded-2xl border border-[var(--border)] bg-white">
              <h3 className="font-[family-name:var(--font-display)] text-2xl font-semibold mb-2">Free</h3>
              <p className="text-[var(--muted-foreground)] mb-6">Perfect for trying it out</p>
              <div className="mb-6">
                <span className="text-4xl font-bold">$0</span>
                <span className="text-[var(--muted-foreground)]">/forever</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span>1 book club</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span>Up to 6 members</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span>Voting & scheduling</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span>Theme rotation</span>
                </li>
              </ul>
              <Link href="/signup">
                <Button variant="outline" className="w-full">Get Started</Button>
              </Link>
            </div>

            {/* Premium Tier */}
            <div className="p-8 rounded-2xl border-2 border-[var(--plum-500)] bg-white relative">
              <Badge className="absolute -top-3 right-6">Most Popular</Badge>
              <h3 className="font-[family-name:var(--font-display)] text-2xl font-semibold mb-2">Premium</h3>
              <p className="text-[var(--muted-foreground)] mb-6">For serious book clubs</p>
              <div className="mb-6">
                <span className="text-4xl font-bold">$19</span>
                <span className="text-[var(--muted-foreground)]">/year</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span>Unlimited clubs</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span>Unlimited members</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span className="font-medium">AI discussion questions</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span className="font-medium">Email notifications</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span>Reading progress tracking</span>
                </li>
              </ul>
              <Link href="/signup">
                <Button className="w-full">Start Free Trial</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-[family-name:var(--font-display)] text-4xl font-bold mb-6">
            Ready to start reading together?
          </h2>
          <p className="text-xl text-[var(--muted-foreground)] mb-10">
            Create your book club in 30 seconds. Invite friends with a link.
            <br />Start voting on your first book today.
          </p>
          <Link href="/signup">
            <Button size="lg" className="text-lg px-8">
              Create Your Club
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-[var(--border)]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-[var(--plum-500)] to-[var(--plum-700)] flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <span className="font-[family-name:var(--font-display)] font-semibold">ClubReads</span>
          </div>
          <p className="text-sm text-[var(--muted-foreground)]">
            © 2026 ClubReads. Built with ❤️ for book lovers.
          </p>
        </div>
      </footer>
    </div>
  )
}
