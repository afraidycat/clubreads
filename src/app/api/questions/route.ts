import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    // Verify user is authenticated
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { bookId } = await request.json()

    if (!bookId) {
      return NextResponse.json({ error: "Book ID required" }, { status: 400 })
    }

    // Get book details
    const { data: book, error: bookError } = await supabase
      .from("books")
      .select(`
        *,
        theme:themes(*),
        club:clubs(*)
      `)
      .eq("id", bookId)
      .single()

    if (bookError || !book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 })
    }

    // Verify user is member of the club
    const { data: membership } = await supabase
      .from("club_members")
      .select("*")
      .eq("club_id", book.club_id)
      .eq("user_id", user.id)
      .single()

    if (!membership) {
      return NextResponse.json({ error: "Not a member of this club" }, { status: 403 })
    }

    // Check if questions already exist
    const { data: existingQuestions } = await supabase
      .from("discussion_questions")
      .select("id")
      .eq("book_id", bookId)

    if (existingQuestions && existingQuestions.length > 0) {
      return NextResponse.json({ 
        message: "Questions already generated",
        count: existingQuestions.length 
      })
    }

    // Get club members for assignment
    const { data: members } = await supabase
      .from("club_members")
      .select("user_id")
      .eq("club_id", book.club_id)

    const memberIds = members?.map(m => m.user_id) || []

    // Generate questions with Claude
    const themeContext = book.theme 
      ? `This book was selected for the "${book.theme.name}" theme (${book.theme.description}).` 
      : ""

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `Generate 8 thoughtful book club discussion questions for "${book.title}" by ${book.author}. ${themeContext}

Create questions that:
1. Encourage deep analysis of themes and character motivations
2. Connect the book to broader real-world issues
3. Invite personal reflection and sharing of perspectives
4. Cover different aspects: plot, characters, writing style, themes, and reader experience
5. Are open-ended and spark genuine conversation

Format your response as a JSON array of strings, each string being one question. Only output the JSON array, nothing else.

Example format:
["Question 1?", "Question 2?", "Question 3?"]`
        }
      ]
    })

    // Parse the response
    const content = message.content[0]
    if (content.type !== "text") {
      throw new Error("Unexpected response type")
    }

    let questions: string[]
    try {
      questions = JSON.parse(content.text)
    } catch {
      // Try to extract JSON from the response
      const jsonMatch = content.text.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        questions = JSON.parse(jsonMatch[0])
      } else {
        throw new Error("Could not parse questions from response")
      }
    }

    // Insert questions with random member assignments
    const questionsToInsert = questions.map((question, index) => ({
      book_id: bookId,
      question,
      sort_order: index,
      assigned_to: memberIds.length > 0 
        ? memberIds[index % memberIds.length] 
        : null,
    }))

    const { error: insertError } = await supabase
      .from("discussion_questions")
      .insert(questionsToInsert)

    if (insertError) {
      throw insertError
    }

    return NextResponse.json({ 
      success: true, 
      count: questions.length,
      questions 
    })

  } catch (error) {
    console.error("Error generating questions:", error)
    return NextResponse.json(
      { error: "Failed to generate questions" },
      { status: 500 }
    )
  }
}
