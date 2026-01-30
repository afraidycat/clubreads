"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Video, MapPin, Loader2, X, Plus, Lock, Sparkles } from "lucide-react"

interface ScheduleMeetingFormProps {
  clubId: string
  currentBookId?: string
  currentBookTitle?: string
  isPremium: boolean
}

export function ScheduleMeetingForm({ clubId, currentBookId, currentBookTitle, isPremium }: ScheduleMeetingFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [title, setTitle] = useState(currentBookTitle ? `Discuss: ${currentBookTitle}` : "Book Club Meeting")
  const [date, setDate] = useState("")
  const [time, setTime] = useState("19:00")
  const [location, setLocation] = useState("")
  const [meetingLink, setMeetingLink] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!date) {
      setError("Please select a date")
      setLoading(false)
      return
    }

    // Combine date and time
    const scheduledAt = new Date(`${date}T${time}`).toISOString()

    // Format location with meeting link if provided
    const fullLocation = meetingLink 
      ? `${location ? location + " | " : ""}${meetingLink}`.trim()
      : location

    const { error: insertError } = await supabase
      .from("meetings")
      .insert({
        club_id: clubId,
        book_id: currentBookId || null,
        title,
        scheduled_at: scheduledAt,
        location: fullLocation || null,
      })

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    // Reset and close
    setTitle(currentBookTitle ? `Discuss: ${currentBookTitle}` : "Book Club Meeting")
    setDate("")
    setTime("19:00")
    setLocation("")
    setMeetingLink("")
    setIsOpen(false)
    setLoading(false)
    router.refresh()
  }

  // const generateGoogleMeetLink = () => {
  //   // This opens Google Meet to create a new meeting
  //   // User can copy the link back
  //   window.open("https://meet.google.com/new", "_blank")
  // }
const generateMeetingLink = () => {
    // Generate a unique meeting room using Jitsi (free, no auth required)
    const roomId = `clubreads-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`
    const jitsiLink = `https://meet.jit.si/${roomId}`
    setMeetingLink(jitsiLink)
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

  // Premium gate - show upgrade prompt
  if (!isPremium) {
    return (
      <Card className="border-[var(--plum-200)] bg-gradient-to-br from-[var(--plum-50)] to-[var(--plum-100)]/50">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-[var(--plum-200)] flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5 text-[var(--plum-700)]" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold">Schedule Meetings</h4>
                <Badge variant="plum" className="text-xs">Premium</Badge>
              </div>
              <p className="text-sm text-[var(--muted-foreground)] mb-3">
                Schedule meetings with Google Meet links and send calendar invites to members.
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

  if (!isOpen) {
    return (
      <Card className="border-[var(--plum-200)] bg-gradient-to-br from-[var(--plum-50)] to-white shadow-sm">
        <CardContent className="py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[var(--plum-100)] flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5 text-[var(--plum-600)]" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-sm">Ready to discuss?</h4>
              <p className="text-xs text-[var(--muted-foreground)]">Set up your next meeting</p>
            </div>
            <Button onClick={() => setIsOpen(true)} size="sm">
              <Plus className="w-4 h-4 mr-1" />
              Schedule
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

return (
    <>
      {/* Modal Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-40"
        onClick={() => setIsOpen(false)}
      />
      
      {/* Modal Content */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white shadow-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Schedule Meeting
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Meeting Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Book Club Meeting"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location (optional)</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
                  <Input
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Coffee shop, someone's house, etc"
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="meetingLink">Video Call Link (optional)</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Video className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
                    <Input
                      id="meetingLink"
                      value={meetingLink}
                      onChange={(e) => setMeetingLink(e.target.value)}
                      placeholder="https://meet.google.com/..."
                      className="pl-10"
                    />
                  </div>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={generateMeetingLink}
                    className="shrink-0"
                  >
                    Generate Link
                  </Button>
                </div>
                <p className="text-xs text-[var(--muted-foreground)]">
                  Click "Generate Link" for an instant video room, or paste your own Zoom/Meet link
                </p>
              </div>

              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}

              <div className="flex gap-2">
                <Button type="button" variant="ghost" onClick={() => setIsOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Scheduling...
                    </>
                  ) : (
                    "Schedule Meeting"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
