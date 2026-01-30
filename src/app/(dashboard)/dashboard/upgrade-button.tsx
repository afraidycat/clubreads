"use client"

import { Button } from "@/components/ui/button"
import { Sparkles } from "lucide-react"

export function UpgradeButton() {
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

  return (
    <Button onClick={handleUpgrade} variant="outline" className="border-[var(--plum-300)] text-[var(--plum-700)] hover:bg-[var(--plum-50)]">
      <Sparkles className="w-4 h-4 mr-2" />
      Upgrade to Create More Clubs
    </Button>
  )
}
