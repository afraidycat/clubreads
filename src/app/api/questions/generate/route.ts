import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { bookId, clubId } = await request.json()

  if (!bookId || !clubId) {
    return NextResponse.json({ error: "Missing bookId or clubId" }, { status: 400 })
  }

  // Get book details
  const { data: book, error: bookError } = await supabase
    .from("books")
    .select("*, theme:themes(*)")
    .eq("id", bookId)
    .single()

  if (bookError || !book) {
    return NextResponse.json({ error: "Book not found" }, { status: 404 })
  }

  // Get club members for assignment
  const { data: members } = await supabase
    .from("club_members")
    .select("user_id")
    .eq("club_id", clubId)

  const memberIds = members?.map(m => m.user_id) || []

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

  // Generate questions with Claude API
  const prompt = `Generate 8 thoughtful discussion questions for a book club reading "${book.title}" by ${book.author}.

${book.theme ? `The book falls under the theme: ${book.theme.name} - ${book.theme.description}` : ""}

Create questions that:
1. Encourage deep analysis of themes and characters
2. Connect the book to broader life experiences
3. Spark interesting debate among readers
4. Range from accessible to thought-provoking
5. Avoid simple yes/no answers

Format: Return ONLY a JSON array of strings, each string being one question. No other text.
Example: ["Question 1?", "Question 2?", ...]`

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        messages: [
          { role: "user", content: prompt }
        ],
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Claude API error:", errorText)
      return NextResponse.json({ error: "Failed to generate questions" }, { status: 500 })
    }

    const data = await response.json()
    const content = data.content[0].text

    // Parse the JSON array from the response
    let questions: string[]
    try {
      questions = JSON.parse(content)
    } catch {
      // Try to extract JSON from the response
      const match = content.match(/\[[\s\S]*\]/)
      if (match) {
        questions = JSON.parse(match[0])
      } else {
        return NextResponse.json({ error: "Failed to parse questions" }, { status: 500 })
      }
    }

    // Insert questions with random member assignments
    const questionsToInsert = questions.map((q: string, index: number) => ({
      book_id: bookId,
      question: q,
      sort_order: index,
      assigned_to: memberIds.length > 0 
        ? memberIds[index % memberIds.length] 
        : null,
    }))

    const { error: insertError } = await supabase
      .from("discussion_questions")
      .insert(questionsToInsert)

    if (insertError) {
      console.error("Insert error:", insertError)
      return NextResponse.json({ error: "Failed to save questions" }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      count: questions.length,
      questions 
    })

  } catch (error) {
    console.error("Error generating questions:", error)
    return NextResponse.json({ error: "Failed to generate questions" }, { status: 500 })
  }
}
