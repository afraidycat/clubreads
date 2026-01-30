import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

type EmailType = "book_selected" | "meeting_reminder" | "questions_assigned" | "voting_open"

export async function POST(request: Request) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { type, clubId, bookId, meetingId } = await request.json() as {
    type: EmailType
    clubId: string
    bookId?: string
    meetingId?: string
  }

  if (!type || !clubId) {
    return NextResponse.json({ error: "Missing type or clubId" }, { status: 400 })
  }

  // Get club details
  const { data: club } = await supabase
    .from("clubs")
    .select("*")
    .eq("id", clubId)
    .single()

  if (!club) {
    return NextResponse.json({ error: "Club not found" }, { status: 404 })
  }

  // Get club members with emails
  const { data: members } = await supabase
    .from("club_members")
    .select("*, profile:profiles(*)")
    .eq("club_id", clubId)

  if (!members || members.length === 0) {
    return NextResponse.json({ error: "No members found" }, { status: 404 })
  }

  const emails = members
    .filter(m => m.profile?.email)
    .map(m => m.profile!.email)

  let subject = ""
  let htmlContent = ""

  switch (type) {
    case "book_selected": {
      const { data: book } = await supabase
        .from("books")
        .select("*")
        .eq("id", bookId)
        .single()
      
      if (!book) {
        return NextResponse.json({ error: "Book not found" }, { status: 404 })
      }

      subject = `📚 New book selected: ${book.title}`
      htmlContent = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #d97706 0%, #f59e0b 100%); padding: 32px; border-radius: 16px 16px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">📚 ClubReads</h1>
          </div>
          <div style="background: #fffcf7; padding: 32px; border: 1px solid #e7e5e4; border-top: none; border-radius: 0 0 16px 16px;">
            <h2 style="color: #1c1917; margin-top: 0;">Your next read is here!</h2>
            <div style="background: white; padding: 24px; border-radius: 12px; border: 1px solid #e7e5e4; margin: 24px 0;">
              <h3 style="margin: 0 0 8px 0; color: #1c1917; font-size: 20px;">${book.title}</h3>
              <p style="margin: 0; color: #78716c;">by ${book.author}</p>
              ${book.page_count ? `<p style="margin: 16px 0 0 0; color: #78716c; font-size: 14px;">${book.page_count} pages</p>` : ""}
            </div>
            <p style="color: #78716c;">The ${club.name} book club has selected their next book. Time to start reading!</p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/club/${clubId}" 
               style="display: inline-block; background: #d97706; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 16px;">
              View in ClubReads
            </a>
          </div>
        </div>
      `
      break
    }

    case "voting_open": {
      subject = `🗳️ Voting is open in ${club.name}`
      htmlContent = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); padding: 32px; border-radius: 16px 16px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">📚 ClubReads</h1>
          </div>
          <div style="background: #fffcf7; padding: 32px; border: 1px solid #e7e5e4; border-top: none; border-radius: 0 0 16px 16px;">
            <h2 style="color: #1c1917; margin-top: 0;">Time to vote! 🗳️</h2>
            <p style="color: #78716c;">Book nominations are in for ${club.name}. Cast your vote to help pick the next read!</p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/club/${clubId}" 
               style="display: inline-block; background: #7c3aed; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 16px;">
              Vote Now
            </a>
          </div>
        </div>
      `
      break
    }

    case "questions_assigned": {
      const { data: book } = await supabase
        .from("books")
        .select("*")
        .eq("id", bookId)
        .single()

      subject = `💬 Discussion questions ready for ${book?.title || "your book"}`
      htmlContent = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #d97706 0%, #7c3aed 100%); padding: 32px; border-radius: 16px 16px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">📚 ClubReads</h1>
          </div>
          <div style="background: #fffcf7; padding: 32px; border: 1px solid #e7e5e4; border-top: none; border-radius: 0 0 16px 16px;">
            <h2 style="color: #1c1917; margin-top: 0;">Discussion questions are ready! 💬</h2>
            <p style="color: #78716c;">AI-generated discussion questions have been created for <strong>${book?.title || "your current book"}</strong>.</p>
            <p style="color: #78716c;">Check if you've been assigned a question to lead the discussion on!</p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/club/${clubId}" 
               style="display: inline-block; background: #d97706; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 16px;">
              View Questions
            </a>
          </div>
        </div>
      `
      break
    }

    case "meeting_reminder": {
      const { data: meeting } = await supabase
        .from("meetings")
        .select("*, book:books(*)")
        .eq("id", meetingId)
        .single()

      if (!meeting) {
        return NextResponse.json({ error: "Meeting not found" }, { status: 404 })
      }

      const meetingDate = new Date(meeting.scheduled_at).toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })

      subject = `📅 Reminder: ${club.name} meeting ${meetingDate}`
      htmlContent = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #d97706 0%, #f59e0b 100%); padding: 32px; border-radius: 16px 16px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">📚 ClubReads</h1>
          </div>
          <div style="background: #fffcf7; padding: 32px; border: 1px solid #e7e5e4; border-top: none; border-radius: 0 0 16px 16px;">
            <h2 style="color: #1c1917; margin-top: 0;">Meeting Reminder 📅</h2>
            <div style="background: white; padding: 24px; border-radius: 12px; border: 1px solid #e7e5e4; margin: 24px 0;">
              <p style="margin: 0 0 8px 0; color: #78716c; font-size: 14px;">WHEN</p>
              <p style="margin: 0 0 16px 0; color: #1c1917; font-weight: 600;">${meetingDate}</p>
              ${meeting.location ? `
                <p style="margin: 0 0 8px 0; color: #78716c; font-size: 14px;">WHERE</p>
                <p style="margin: 0 0 16px 0; color: #1c1917;">${meeting.location}</p>
              ` : ""}
              ${meeting.book ? `
                <p style="margin: 0 0 8px 0; color: #78716c; font-size: 14px;">DISCUSSING</p>
                <p style="margin: 0; color: #1c1917; font-weight: 600;">${meeting.book.title}</p>
              ` : ""}
            </div>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/club/${clubId}" 
               style="display: inline-block; background: #d97706; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
              View Club
            </a>
          </div>
        </div>
      `
      break
    }

    default:
      return NextResponse.json({ error: "Invalid email type" }, { status: 400 })
  }

  try {
    // Send email to all members
    // Note: In production, you'd want to use Resend's batch API or loop with rate limiting
    const { data, error } = await resend.emails.send({
      from: "ClubReads <noreply@clubreads.app>", // You'll need to verify this domain in Resend
      to: emails,
      subject,
      html: htmlContent,
    })

    if (error) {
      console.error("Resend error:", error)
      return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
    }

    // Log the email
    for (const member of members) {
      await supabase.from("email_logs").insert({
        user_id: member.user_id,
        club_id: clubId,
        email_type: type,
        status: "sent",
      })
    }

    return NextResponse.json({ success: true, emailId: data?.id })

  } catch (error) {
    console.error("Error sending email:", error)
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
  }
}
