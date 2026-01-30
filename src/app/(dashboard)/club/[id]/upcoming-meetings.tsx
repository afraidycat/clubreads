"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MapPin, Video, ExternalLink } from "lucide-react"

interface Meeting {
  id: string
  title: string
  scheduled_at: string
  location: string | null
  book?: {
    title: string
    author: string
  } | null
}

interface UpcomingMeetingsProps {
  meetings: Meeting[]
}

export function UpcomingMeetings({ meetings }: UpcomingMeetingsProps) {
  if (meetings.length === 0) {
    return null
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    })
  }

  const isVideoLink = (location: string | null) => {
    if (!location) return false
    return location.includes("meet.google.com") || 
           location.includes("zoom.us") || 
           location.includes("teams.microsoft.com")
  }

  const extractVideoLink = (location: string | null) => {
    if (!location) return null
    const urlMatch = location.match(/(https?:\/\/[^\s]+)/g)
    return urlMatch ? urlMatch[0] : null
  }

  const getLocationText = (location: string | null) => {
    if (!location) return null
    // Remove the URL part to show just the text location
    return location.replace(/(https?:\/\/[^\s]+)/g, "").replace(/\s*\|\s*$/, "").trim() || null
  }

  // Sort by date, upcoming first
  const sortedMeetings = [...meetings].sort(
    (a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()
  )

  // Filter to only show future meetings
  const upcomingMeetings = sortedMeetings.filter(
    m => new Date(m.scheduled_at) > new Date()
  )

  if (upcomingMeetings.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Upcoming Meetings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {upcomingMeetings.map((meeting) => {
          const videoLink = extractVideoLink(meeting.location)
          const textLocation = getLocationText(meeting.location)
          
          return (
            <div 
              key={meeting.id} 
              className="p-4 rounded-xl bg-[var(--muted)]/50 border border-[var(--border)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">{meeting.title}</h4>
                  
                  <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--muted-foreground)]">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDate(meeting.scheduled_at)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {formatTime(meeting.scheduled_at)}
                    </span>
                  </div>

                  {textLocation && (
                    <p className="flex items-center gap-1 text-sm text-[var(--muted-foreground)] mt-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {textLocation}
                    </p>
                  )}

                  {meeting.book && (
                    <p className="text-xs text-[var(--muted-foreground)] mt-2">
                      Discussing: <span className="font-medium">{meeting.book.title}</span>
                    </p>
                  )}
                </div>

                {videoLink && (
                  <a
                    href={videoLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[var(--primary)] text-white text-sm font-medium hover:bg-[var(--plum-800)] transition-colors"
                  >
                    <Video className="w-4 h-4" />
                    Join
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
