"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PartyPopper, Calendar, Users, ListChecks, BookOpen } from "lucide-react"

interface WelcomeModalProps {
  clubId: string
  clubName: string
}

export function WelcomeModal({ clubId, clubName }: WelcomeModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [dontShowAgain, setDontShowAgain] = useState(false)

  useEffect(() => {
    const hideAllModals = localStorage.getItem("clubreads_hide_welcome_modal")
    if (hideAllModals === "true") return

    const shownClubs = JSON.parse(localStorage.getItem("clubreads_welcome_shown") || "[]")
    if (shownClubs.includes(clubId)) return

    setIsOpen(true)
  }, [clubId])

  const handleClose = () => {
    const shownClubs = JSON.parse(localStorage.getItem("clubreads_welcome_shown") || "[]")
    if (!shownClubs.includes(clubId)) {
      shownClubs.push(clubId)
      localStorage.setItem("clubreads_welcome_shown", JSON.stringify(shownClubs))
    }

    if (dontShowAgain) {
      localStorage.setItem("clubreads_hide_welcome_modal", "true")
    }

    setIsOpen(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />
      
      <div className="relative bg-white rounded-2xl shadow-xl max-w-lg w-full mx-4 overflow-hidden">
        <div className="bg-gradient-to-br from-[var(--plum-500)] to-[var(--plum-700)] px-6 py-8 text-white text-center">
          <PartyPopper className="w-12 h-12 mx-auto mb-4" />
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold mb-2">
            Welcome to {clubName}!
          </h2>
          <p className="text-white/90">
            Here are 3 things that make book clubs thrive
          </p>
        </div>

        <div className="px-6 py-6 space-y-5">
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[var(--plum-100)] flex items-center justify-center">
              <Calendar className="w-5 h-5 text-[var(--plum-600)]" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Meet on the same day each month</h3>
              <p className="text-sm text-[var(--muted-foreground)]">
                "First Tuesday" or "third Saturday" — consistency beats perfection. Members can plan around a recurring commitment.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[var(--plum-100)] flex items-center justify-center">
              <Users className="w-5 h-5 text-[var(--plum-600)]" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Keep it 6-12 members</h3>
              <p className="text-sm text-[var(--muted-foreground)]">
                Fewer than 6 feels empty. More than 12 and quieter voices disappear.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[var(--plum-100)] flex items-center justify-center">
              <ListChecks className="w-5 h-5 text-[var(--plum-600)]" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Set expectations early</h3>
              <p className="text-sm text-[var(--muted-foreground)]">
                How long to finish books? Are spoilers okay? Can people come if they didn't finish? Align now to avoid friction later.
              </p>
            </div>
          </div>

          <Link 
            href="/guide" 
            className="flex items-center justify-center gap-2 text-[var(--plum-600)] hover:text-[var(--plum-700)] font-medium text-sm pt-2"
          >
            <BookOpen className="w-4 h-4" />
            Read the Full Guide →
          </Link>
        </div>

        <div className="px-6 py-4 bg-[var(--muted)]/30 border-t border-[var(--border)]">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-[var(--muted-foreground)] cursor-pointer">
              <input
                type="checkbox"
                checked={dontShowAgain}
                onChange={(e) => setDontShowAgain(e.target.checked)}
                className="rounded border-[var(--border)]"
              />
              Don't show this again
            </label>
            <Button onClick={handleClose}>
              Got It — Let's Start!
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}