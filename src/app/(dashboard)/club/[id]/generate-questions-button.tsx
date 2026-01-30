"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Loader2, MessageSquare } from "lucide-react"

interface GenerateQuestionsButtonProps {
  bookId: string
  clubId: string
  hasQuestions: boolean
  isPremium: boolean
}

export function GenerateQuestionsButton({ bookId, clubId, hasQuestions, isPremium }: GenerateQuestionsButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleGenerate = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ bookId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate questions")
      }

      // Refresh the page to show new questions
      router.refresh()

    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  const handleUpgrade = async () => {
    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
      })
      const data = await response.json()
      if (data.url) {
        window.location.href = data.url
      }
    } catch (err) {
      console.error("Failed to start checkout:", err)
    }
  }

  if (hasQuestions) {
    return null
  }

  // Premium gate
  if (!isPremium) {
    return (
      <Card className="border-[var(--plum-200)] bg-gradient-to-br from-[var(--plum-50)] to-[var(--plum-100)]/50">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-[var(--plum-200)] flex items-center justify-center shrink-0">
              <MessageSquare className="w-5 h-5 text-[var(--plum-700)]" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold">AI Discussion Questions</h4>
                <Badge variant="plum" className="text-xs">Premium</Badge>
              </div>
              <p className="text-sm text-[var(--muted-foreground)] mb-3">
                Generate thoughtful discussion questions tailored to your book.
              </p>
              <Button size="sm" onClick={handleUpgrade}>
                <Sparkles className="w-4 h-4 mr-2" />
                Upgrade for $19/year
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-2">
      <Button
        onClick={handleGenerate}
        disabled={loading}
        variant="secondary"
        className="w-full"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Generating questions...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 mr-2" />
            Generate AI Discussion Questions
          </>
        )}
      </Button>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}
