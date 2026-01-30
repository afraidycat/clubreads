"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Vote, ThumbsUp, Loader2, Crown, CheckCircle2 } from "lucide-react"
import type { BookWithDetails } from "@/lib/types"

interface VotingSectionProps {
  books: BookWithDetails[]
  userId: string
  clubId: string
  isOwnerOrAdmin: boolean
}

export function VotingSection({ books, userId, clubId, isOwnerOrAdmin }: VotingSectionProps) {
  const [voting, setVoting] = useState<string | null>(null)
  const [selecting, setSelecting] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleVote = async (bookId: string) => {
    setVoting(bookId)

    // Check if user already voted for this book
    const { data: existingVote } = await supabase
      .from("book_votes")
      .select("*")
      .eq("book_id", bookId)
      .eq("user_id", userId)
      .single()

    if (existingVote) {
      // Remove vote
      await supabase
        .from("book_votes")
        .delete()
        .eq("id", existingVote.id)
    } else {
      // Add vote (rank 1 for simple voting)
      await supabase
        .from("book_votes")
        .insert({
          book_id: bookId,
          user_id: userId,
          rank: 1,
        })
    }

    setVoting(null)
    router.refresh()
  }

  const handleSelectWinner = async () => {
    setSelecting(true)
    
    // Find book with most votes
    const sortedBooks = [...books].sort((a, b) => 
      (b.votes?.length || 0) - (a.votes?.length || 0)
    )
    
    if (sortedBooks.length === 0) {
      setSelecting(false)
      return
    }

    const winner = sortedBooks[0]
    const losers = sortedBooks.slice(1)

    // Update winner status
    await supabase
      .from("books")
      .update({ status: "reading", selected_at: new Date().toISOString() })
      .eq("id", winner.id)

    // Clear the non-winning nominations (delete them to start fresh)
    if (losers.length > 0) {
      const loserIds = losers.map(b => b.id)
      
      // First delete their votes
      await supabase
        .from("book_votes")
        .delete()
        .in("book_id", loserIds)
      
      // Then delete the books
      await supabase
        .from("books")
        .delete()
        .in("id", loserIds)
    }

    // Clear votes for the winner too (voting is complete)
    await supabase
      .from("book_votes")
      .delete()
      .eq("book_id", winner.id)

    setSelecting(false)
    router.refresh()
  }

  const hasVoted = (book: BookWithDetails) => 
    book.votes?.some(v => v.user_id === userId)

  // Sort by vote count
  const sortedBooks = [...books].sort((a, b) => 
    (b.votes?.length || 0) - (a.votes?.length || 0)
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold flex items-center gap-2">
          <Vote className="w-4 h-4" />
          Nominations ({books.length})
        </h4>
        {books.length >= 2 && isOwnerOrAdmin && (
          <Button 
            size="sm" 
            onClick={handleSelectWinner}
            disabled={selecting}
          >
            {selecting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Crown className="w-4 h-4 mr-1" />
                Select Winner
              </>
            )}
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {sortedBooks.map((book, index) => (
          <div 
            key={book.id} 
            className={`p-4 rounded-xl border transition-all ${
              index === 0 && (book.votes?.length || 0) > 0
                ? "border-[var(--plum-300)] bg-[var(--plum-50)]"
                : "border-[var(--border)] bg-white"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {index === 0 && (book.votes?.length || 0) > 0 && (
                    <Crown className="w-4 h-4 text-[var(--plum-600)]" />
                  )}
                  <h5 className="font-semibold">{book.title}</h5>
                </div>
                <p className="text-sm text-[var(--muted-foreground)] mb-2">
                  by {book.author}
                </p>
                <div className="flex flex-wrap gap-2">
                  {book.page_count && (
                    <Badge variant="outline">{book.page_count} pages</Badge>
                  )}
                  {book.theme && (
                    <Badge variant="amber">
                      {book.theme.icon} {book.theme.name}
                    </Badge>
                  )}
                  {book.nominated_by_profile && (
                    <span className="text-xs text-[var(--muted-foreground)]">
                      Nominated by {book.nominated_by_profile.full_name || 'Unknown'}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-center">
                  <p className="text-2xl font-bold text-[var(--primary)]">
                    {book.votes?.length || 0}
                  </p>
                  <p className="text-xs text-[var(--muted-foreground)]">votes</p>
                </div>
                <Button
                  size="sm"
                  variant={hasVoted(book) ? "default" : "outline"}
                  onClick={() => handleVote(book.id)}
                  disabled={voting === book.id}
                >
                  {voting === book.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : hasVoted(book) ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-1" />
                      Voted
                    </>
                  ) : (
                    <>
                      <ThumbsUp className="w-4 h-4 mr-1" />
                      Vote
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
