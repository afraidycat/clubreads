"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Plus, Loader2 } from "lucide-react"
import type { Theme } from "@/lib/types"

interface NominateBookFormProps {
  clubId: string
  themes: Theme[]
  currentTheme: string | null
}

export function NominateBookForm({ clubId, themes, currentTheme }: NominateBookFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [author, setAuthor] = useState("")
  const [pageCount, setPageCount] = useState("")
  const [selectedTheme, setSelectedTheme] = useState<string | null>(
    currentTheme ? themes.find(t => t.name === currentTheme)?.id || null : null
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError("You must be logged in")
      setLoading(false)
      return
    }

    const { error: insertError } = await supabase
      .from("books")
      .insert({
        club_id: clubId,
        title,
        author,
        page_count: pageCount ? parseInt(pageCount) : null,
        theme_id: selectedTheme,
        nominated_by: user.id,
        status: "nominated",
      })

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    // Reset form
    setTitle("")
    setAuthor("")
    setPageCount("")
    setIsOpen(false)
    setLoading(false)
    router.refresh()
  }

  if (!isOpen) {
    return (
      <Button onClick={() => setIsOpen(true)} variant="outline" className="w-full">
        <Plus className="w-4 h-4 mr-2" />
        Nominate a Book
      </Button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 rounded-xl border border-[var(--border)] bg-[var(--muted)]/30 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold">Nominate a Book</h4>
        <Button type="button" variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
          Cancel
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="title">Book Title *</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., The Great Gatsby"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="author">Author *</Label>
          <Input
            id="author"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="e.g., F. Scott Fitzgerald"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="pageCount">Page Count (optional)</Label>
        <Input
          id="pageCount"
          type="number"
          value={pageCount}
          onChange={(e) => setPageCount(e.target.value)}
          placeholder="e.g., 218"
        />
      </div>

      <div className="space-y-2">
        <Label>Theme (optional)</Label>
        <div className="flex flex-wrap gap-2">
          {themes.map((theme) => (
            <button
              key={theme.id}
              type="button"
              onClick={() => setSelectedTheme(selectedTheme === theme.id ? null : theme.id)}
              className={`px-2 py-1 rounded text-xs transition-all ${
                selectedTheme === theme.id
                  ? "bg-[var(--primary)] text-white"
                  : "bg-white border border-[var(--border)] hover:border-[var(--plum-300)]"
              }`}
            >
              {theme.icon} {theme.name}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-2 text-sm text-red-600 bg-red-50 rounded">
          {error}
        </div>
      )}

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Nominating...
          </>
        ) : (
          "Nominate Book"
        )}
      </Button>
    </form>
  )
}
