"use client"

import { useState } from "react"
import Link from "next/link"
import { HelpCircle, X, BookOpen, MessageSquare } from "lucide-react"

export function FloatingHelpButton() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {/* Expanded Menu */}
      {isOpen && (
        <div className="absolute bottom-14 right-0 bg-white rounded-lg shadow-lg border border-[var(--border)] py-2 min-w-[180px] mb-2">
          <Link
            href="/guide"
            className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-[var(--muted)]/50 transition-colors"
            onClick={() => setIsOpen(false)}
          >
          <BookOpen className="w-4 h-4 text-[var(--plum-600)]" />
            Book Club Guide
          </Link>
           <Link
            href="/feedback"
            className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-[var(--muted)]/50 transition-colors"
            onClick={() => setIsOpen(false)}
          >
            <MessageSquare className="w-4 h-4 text-[var(--plum-600)]" />
            Send Feedback
          </Link>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 rounded-full bg-[var(--plum-600)] text-white shadow-lg hover:bg-[var(--plum-700)] transition-colors flex items-center justify-center"
        aria-label="Help"
      >
        {isOpen ? (
          <X className="w-5 h-5" />
        ) : (
          <HelpCircle className="w-5 h-5" />
        )}
      </button>
    </div>
  )
}