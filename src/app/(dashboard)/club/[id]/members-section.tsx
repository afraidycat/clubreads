"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Crown, Shield, User } from "lucide-react"

interface Member {
  id: string
  user_id: string
  role: string
  joined_at: string
  profile: {
    id: string
    email: string
    full_name: string | null
    avatar_url: string | null
  } | null
}

interface MembersSectionProps {
  members: Member[]
  isOwner: boolean
  clubId: string
}

export function MembersSection({ members, isOwner, clubId }: MembersSectionProps) {
  const roleIcon = (role: string) => {
    switch (role) {
      case "owner":
        return <Crown className="w-3 h-3 text-[var(--plum-600)]" />
      case "admin":
        return <Shield className="w-3 h-3 text-[var(--plum-600)]" />
      default:
        return <User className="w-3 h-3 text-[var(--muted-foreground)]" />
    }
  }

  const roleLabel = (role: string) => {
    switch (role) {
      case "owner":
        return "Owner"
      case "admin":
        return "Admin"
      default:
        return "Member"
    }
  }

  // Sort: owner first, then admins, then members
  const sortedMembers = [...members].sort((a, b) => {
    const order = { owner: 0, admin: 1, member: 2 }
    return (order[a.role as keyof typeof order] || 2) - (order[b.role as keyof typeof order] || 2)
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Users className="w-5 h-5" />
          Members ({members.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sortedMembers.map((member) => (
            <div 
              key={member.id} 
              className="flex items-center justify-between p-2 rounded-lg hover:bg-[var(--muted)]/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--plum-400)] to-[var(--plum-400)] flex items-center justify-center text-white text-sm font-medium">
                  {(member.profile?.full_name || member.profile?.email || "?")[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {member.profile?.full_name || member.profile?.email?.split("@")[0] || "Unknown"}
                  </p>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    {member.profile?.email}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs text-[var(--muted-foreground)]">
                {roleIcon(member.role)}
                <span>{roleLabel(member.role)}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
