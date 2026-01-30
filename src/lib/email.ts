import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM_EMAIL = "ClubReads <noreply@clubreads.app>"

interface SendEmailParams {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: SendEmailParams) {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    })

    if (error) {
      console.error("Email send error:", error)
      throw error
    }

    return data
  } catch (error) {
    console.error("Failed to send email:", error)
    throw error
  }
}

// Email templates
export function getBookSelectedEmail(params: {
  memberName: string
  clubName: string
  bookTitle: string
  bookAuthor: string
  meetingDate?: string
}) {
  return {
    subject: `📚 New book selected: ${params.bookTitle}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #1c1917; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #d97706, #7c3aed); padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 24px; }
    .content { background: #ffffff; padding: 30px; border: 1px solid #e7e5e4; border-top: none; border-radius: 0 0 12px 12px; }
    .book-card { background: #fffbeb; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #d97706; }
    .book-title { font-size: 20px; font-weight: bold; color: #92400e; margin: 0 0 5px 0; }
    .book-author { color: #78716c; margin: 0; }
    .btn { display: inline-block; background: #d97706; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; margin-top: 20px; }
    .footer { text-align: center; padding: 20px; color: #78716c; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📖 ClubReads</h1>
    </div>
    <div class="content">
      <p>Hi ${params.memberName}!</p>
      <p>Great news! <strong>${params.clubName}</strong> has selected your next read:</p>
      
      <div class="book-card">
        <p class="book-title">${params.bookTitle}</p>
        <p class="book-author">by ${params.bookAuthor}</p>
      </div>
      
      ${params.meetingDate ? `<p>📅 Discussion scheduled for: <strong>${params.meetingDate}</strong></p>` : ''}
      
      <p>Time to start reading! Discussion questions will be assigned soon.</p>
      
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" class="btn">View in ClubReads</a>
    </div>
    <div class="footer">
      <p>Happy reading! 📚</p>
      <p>ClubReads - Run your book club on autopilot</p>
    </div>
  </div>
</body>
</html>
    `,
  }
}

export function getMeetingReminderEmail(params: {
  memberName: string
  clubName: string
  bookTitle: string
  meetingDate: string
  meetingLocation?: string
  assignedQuestion?: string
}) {
  return {
    subject: `⏰ Reminder: ${params.clubName} meets ${params.meetingDate}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #1c1917; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #d97706, #7c3aed); padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 24px; }
    .content { background: #ffffff; padding: 30px; border: 1px solid #e7e5e4; border-top: none; border-radius: 0 0 12px 12px; }
    .meeting-card { background: #faf5ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #7c3aed; }
    .question-card { background: #fffbeb; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .btn { display: inline-block; background: #d97706; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; margin-top: 20px; }
    .footer { text-align: center; padding: 20px; color: #78716c; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📖 ClubReads</h1>
    </div>
    <div class="content">
      <p>Hi ${params.memberName}!</p>
      <p>Just a friendly reminder that <strong>${params.clubName}</strong> is meeting soon to discuss <em>${params.bookTitle}</em>.</p>
      
      <div class="meeting-card">
        <p><strong>📅 When:</strong> ${params.meetingDate}</p>
        ${params.meetingLocation ? `<p><strong>📍 Where:</strong> ${params.meetingLocation}</p>` : ''}
      </div>
      
      ${params.assignedQuestion ? `
      <div class="question-card">
        <p><strong>💡 Your discussion question:</strong></p>
        <p><em>"${params.assignedQuestion}"</em></p>
        <p style="font-size: 14px; color: #78716c;">Be ready to lead this part of the discussion!</p>
      </div>
      ` : ''}
      
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" class="btn">View Details</a>
    </div>
    <div class="footer">
      <p>See you there! 📚</p>
      <p>ClubReads - Run your book club on autopilot</p>
    </div>
  </div>
</body>
</html>
    `,
  }
}

export function getQuestionsAssignedEmail(params: {
  memberName: string
  clubName: string
  bookTitle: string
  question: string
}) {
  return {
    subject: `💡 Your discussion question for ${params.bookTitle}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #1c1917; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #d97706, #7c3aed); padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 24px; }
    .content { background: #ffffff; padding: 30px; border: 1px solid #e7e5e4; border-top: none; border-radius: 0 0 12px 12px; }
    .question-card { background: #faf5ff; padding: 25px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #7c3aed; }
    .question { font-size: 18px; font-style: italic; color: #581c87; margin: 0; }
    .btn { display: inline-block; background: #d97706; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; margin-top: 20px; }
    .footer { text-align: center; padding: 20px; color: #78716c; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📖 ClubReads</h1>
    </div>
    <div class="content">
      <p>Hi ${params.memberName}!</p>
      <p>Discussion questions for <strong>${params.bookTitle}</strong> have been generated, and you've been assigned one to lead!</p>
      
      <div class="question-card">
        <p class="question">"${params.question}"</p>
      </div>
      
      <p>Think about this question as you read, and be ready to share your thoughts and guide the group discussion on this topic.</p>
      
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" class="btn">View All Questions</a>
    </div>
    <div class="footer">
      <p>Happy reading! 📚</p>
      <p>ClubReads - Run your book club on autopilot</p>
    </div>
  </div>
</body>
</html>
    `,
  }
}
