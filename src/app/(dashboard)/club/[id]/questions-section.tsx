"use client"

import { Badge } from "@/components/ui/badge"
import { Sparkles, MessageCircle } from "lucide-react"

interface Question {
  id: string
  question: string
  sort_order: number
  assigned_to_profile: {
    id: string
    full_name: string | null
    email: string
  } | null
}

interface QuestionsSectionProps {
  questions: Question[]
}

export function QuestionsSection({ questions }: QuestionsSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-[var(--plum-600)]" />
        <h4 className="font-semibold">Discussion Questions</h4>
        <Badge variant="plum">AI Generated</Badge>
      </div>
      
      <div className="space-y-3">
        {questions.map((q, index) => (
          <div 
            key={q.id} 
            className="p-4 rounded-xl bg-[var(--muted)]/50 border border-[var(--border)]"
          >
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[var(--plum-100)] flex items-center justify-center text-xs font-semibold text-[var(--plum-700)] shrink-0">
                {index + 1}
              </div>
              <div className="flex-1">
                <p className="text-sm leading-relaxed">{q.question}</p>
                {q.assigned_to_profile && (
                  <div className="flex items-center gap-2 mt-2">
                    <MessageCircle className="w-3 h-3 text-[var(--muted-foreground)]" />
                    <span className="text-xs text-[var(--muted-foreground)]">
                      Assigned to <strong>{q.assigned_to_profile.full_name || q.assigned_to_profile.email}</strong>
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
