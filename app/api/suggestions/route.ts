import type { NextRequest } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { userQuestion, projectId } = await req.json()

    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OpenAI API key not configured")
    }

    // System prompt for generating suggestions
    const systemPrompt = `You are an AI assistant that analyzes user questions about quality control projects and generates relevant follow-up suggestions.

Based on the user's question, generate exactly 2 short, actionable follow-up questions that would be helpful for someone working on a quality control project.

The suggestions should be:
- Directly related to the user's question
- Actionable and specific
- Helpful for quality control and project management
- Short (maximum 8-10 words each)
- Different from each other

Return only the 2 suggestions, one per line, without numbering or bullet points.`

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: `User question: "${userQuestion}"

Generate 2 relevant follow-up suggestions for this quality control project question.`,
          },
        ],
        temperature: 0.8,
        max_tokens: 100,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`OpenAI API error: ${errorData.error?.message || "Unknown error"}`)
    }

    const data = await response.json()
    const suggestionsText = data.choices[0]?.message?.content

    if (!suggestionsText) {
      throw new Error("No suggestions generated")
    }

    // Parse suggestions (split by lines and clean up)
    const suggestions = suggestionsText
      .split("\n")
      .map((s: string) => s.trim())
      .filter((s: string) => s.length > 0)
      .slice(0, 2) // Ensure only 2 suggestions

    return new Response(
      JSON.stringify({
        success: true,
        suggestions: suggestions,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    )
  } catch (error) {
    console.error("Suggestions API Error:", error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}
