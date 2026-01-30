"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { CheckCircle, Loader2 } from "lucide-react"

interface FinishBookButtonProps {
  bookId: string
}

export function FinishBookButton({ bookId }: FinishBookButtonProps) {
  const [loading, setLoading] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const router = useRouter()

  const handleFinish = async () => {
    setLoading(true)
    const supabase = createClient()

    await supabase
      .from("books")
      .update({ status: "finished" })
      .eq("id", bookId)

    router.refresh()
    setLoading(false)
    setShowConfirm(false)
  }

  if (showConfirm) {
    return (
      <div className="flex items-center gap-2 mt-4 p-4 bg-[var(--plum-50)] rounded-lg">
        <p className="text-sm flex-1">Mark this book as finished? This will start a new nomination round.</p>
        <Button variant="ghost" size="sm" onClick={() => setShowConfirm(false)}>
          Cancel
        </Button>
        <Button size="sm" onClick={handleFinish} disabled={loading}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Yes, Finish"}
        </Button>
      </div>
    )
  }

  return (
    <Button 
      variant="outline" 
      className="mt-4 border-green-300 text-green-700 hover:bg-green-50"
      onClick={() => setShowConfirm(true)}
    >
      <CheckCircle className="w-4 h-4 mr-2" />
      Mark as Finished
    </Button>
  )
}