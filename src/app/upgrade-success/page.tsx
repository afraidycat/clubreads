"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Loader2 } from "lucide-react"

export default function UpgradeSuccessPage() {
  const router = useRouter()

  useEffect(() => {
    const refreshAndRedirect = async () => {
      const supabase = createClient()
      await supabase.auth.refreshSession()
      await new Promise(resolve => setTimeout(resolve, 500))
      router.push("/dashboard?upgraded=true")
    }
    refreshAndRedirect()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--plum-600)] mx-auto mb-4" />
        <p className="text-lg font-medium">Activating your premium account...</p>
      </div>
    </div>
  )
}