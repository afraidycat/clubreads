import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { 
  sendEmail, 
  getBookSelectedEmail, 
  getQuestionsAssignedEmail,
  getMeetingReminderEmail 
} from "@/lib/email"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    // Verify user is authenticated
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { type, clubId, bookId, meetingId } = await request.json()

    if (!type || !clubId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Verify user is member of the club
    const { data: membership } = await supabase
      .from("club_members")
      .select("role")
      .eq("club_id", clubId)
      .eq("user_id", user.id)
      .single()

    if (!membership) {
      return NextResponse.json({ error: "Not a member of this club" }, { status: 403 })
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

    // Get all club members with profiles
    const { data: members } = await supabase
      .from("club_members")
      .select(`
        *,
        profile:profiles(*)
      `)
      .eq("club_id", clubId)

    if (!members || members.length === 0) {
      return NextResponse.json({ error: "No members found" }, { status: 404 })
    }

    let emailsSent = 0

    switch (type) {
      case "book_selected": {
        if (!bookId) {
          return NextResponse.json({ error: "Book ID required" }, { status: 400 })
        }

        const { data: book } = await supabase
          .from("books")
          .select("*")
          .eq("id", bookId)
          .single()

        if (!book) {
          return NextResponse.json({ error: "Book not found" }, { status: 404 })
        }

        for (const member of members) {
          if (!member.profile?.email) continue

          const emailContent = getBookSelectedEmail({
            memberName: member.profile.full_name || "Reader",
            clubName: club.name,
            bookTitle: book.title,
            bookAuthor: book.author,
          })

          try {
            await sendEmail({
              to: member.profile.email,
              ...emailContent,
            })
            emailsSent++

            // Log the email
            await supabase.from("email_logs").insert({
              user_id: member.user_id,
              club_id: clubId,
              email_type: "book_selected",
            })
          } catch (err) {
            console.error(`Failed to send email to ${member.profile.email}:`, err)
          }
        }
        break
      }

      case "questions_assigned": {
        if (!bookId) {
          return NextResponse.json({ error: "Book ID required" }, { status: 400 })
        }

        const { data: book } = await supabase
          .from("books")
          .select("*")
          .eq("id", bookId)
          .single()

        const { data: questions } = await supabase
          .from("discussion_questions")
          .select(`
            *,
            assigned_to_profile:profiles!discussion_questions_assigned_to_fkey(*)
          `)
          .eq("book_id", bookId)

        if (!book || !questions) {
          return NextResponse.json({ error: "Book or questions not found" }, { status: 404 })
        }

        // Send emails to members with assigned questions
        for (const question of questions) {
          if (!question.assigned_to_profile?.email) continue

          const emailContent = getQuestionsAssignedEmail({
            memberName: question.assigned_to_profile.full_name || "Reader",
            clubName: club.name,
            bookTitle: book.title,
            question: question.question,
          })

          try {
            await sendEmail({
              to: question.assigned_to_profile.email,
              ...emailContent,
            })
            emailsSent++

            await supabase.from("email_logs").insert({
              user_id: question.assigned_to,
              club_id: clubId,
              email_type: "questions_assigned",
            })
          } catch (err) {
            console.error(`Failed to send email to ${question.assigned_to_profile.email}:`, err)
          }
        }
        break
      }

      case "meeting_reminder": {
        if (!meetingId) {
          return NextResponse.json({ error: "Meeting ID required" }, { status: 400 })
        }

        const { data: meeting } = await supabase
          .from("meetings")
          .select(`
            *,
            book:books(*)
          `)
          .eq("id", meetingId)
          .single()

        if (!meeting) {
          return NextResponse.json({ error: "Meeting not found" }, { status: 404 })
        }

        // Get questions with assignments
        const { data: questions } = meeting.book_id ? await supabase
          .from("discussion_questions")
          .select("*")
          .eq("book_id", meeting.book_id) : { data: [] }

        for (const member of members) {
          if (!member.profile?.email) continue

          // Find this member's assigned question if any
          const assignedQuestion = questions?.find(q => q.assigned_to === member.user_id)

          const emailContent = getMeetingReminderEmail({
            memberName: member.profile.full_name || "Reader",
            clubName: club.name,
            bookTitle: meeting.book?.title || "TBD",
            meetingDate: new Date(meeting.scheduled_at).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
            }),
            meetingLocation: meeting.location || undefined,
            assignedQuestion: assignedQuestion?.question,
          })

          try {
            await sendEmail({
              to: member.profile.email,
              ...emailContent,
            })
            emailsSent++

            await supabase.from("email_logs").insert({
              user_id: member.user_id,
              club_id: clubId,
              email_type: "meeting_reminder",
            })
          } catch (err) {
            console.error(`Failed to send email to ${member.profile.email}:`, err)
          }
        }
        break
      }

      default:
        return NextResponse.json({ error: "Invalid email type" }, { status: 400 })
    }

    return NextResponse.json({ 
      success: true, 
      emailsSent 
    })

  } catch (error) {
    console.error("Error sending emails:", error)
    return NextResponse.json(
      { error: "Failed to send emails" },
      { status: 500 }
    )
  }
}
