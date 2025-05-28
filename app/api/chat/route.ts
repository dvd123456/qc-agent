import { NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { ChatMessage } from "@/lib/models/chat"
import { ObjectId } from "mongodb"

export async function POST(req: NextRequest) {
  try {
    const { message, projectId, threadId } = await req.json()

    if (!message || !projectId || !threadId) {
      return NextResponse.json(
        {
          success: false,
          message: "Message, project ID, and thread ID are required",
        },
        { status: 400 },
      )
    }

    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OpenAI API key not configured")
    }

    const db = await getDatabase()
    const messagesCollection = db.collection<ChatMessage>("chat_messages")
    const threadsCollection = db.collection("chat_threads")

    // Get project details from MongoDB
    const projectsCollection = db.collection("projects")
    const project = await projectsCollection.findOne({ _id: new ObjectId(projectId) })

    if (!project) {
      return NextResponse.json(
        {
          success: false,
          message: "Project not found",
        },
        { status: 404 },
      )
    }

    // Get thread history
    const threadMessages = await messagesCollection
      .find({ projectId, threadId })
      .sort({ timestamp: 1 })
      .toArray()

    // Create system prompt with project context
    const systemPrompt = `You are QC Agent AI, an intelligent quality control assistant. You are helping with the following project:

PROJECT DETAILS:
- Name: ${project.name}
- Description: ${project.description}
- Status: ${project.status || "active"}
- Progress: ${project.progress || 0}%
- Start Date: ${project.startDate}
- End Date: ${project.endDate}
- Priority: ${project.priority || "medium"}
- Team Members: ${project.team ? project.team.join(", ") : "Current User"}
- Files: ${project.filesUploaded || 0}/${project.totalFiles || 0} uploaded

INSTRUCTIONS:
- You are an expert in quality control, project management, and analysis
- Provide helpful, accurate, and actionable advice
- Reference the specific project details when relevant
- Be concise but thorough in your responses
- Suggest practical next steps when appropriate
- Always maintain a professional and helpful tone
- When discussing issues, provide specific solutions or recommendations
- Track project progress and help identify potential risks or improvements

Remember: You are specifically helping with this quality control project. Use the project context to provide relevant and personalized assistance.`

    // Prepare messages for OpenAI API
    const openAIMessages = [
      {
        role: "system",
        content: systemPrompt,
      },
      ...threadMessages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      {
        role: "user",
        content: message,
      },
    ]

    // Save user message to MongoDB
    const userMessage: Omit<ChatMessage, "_id"> = {
      projectId,
      threadId,
      role: "user",
      content: message,
      timestamp: new Date().toISOString(),
    }

    await messagesCollection.insertOne(userMessage)

    // Call OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: openAIMessages,
        temperature: 0.7,
        max_tokens: 1000,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`OpenAI API error: ${errorData.error?.message || "Unknown error"}`)
    }

    const data = await response.json()
    const assistantContent = data.choices[0]?.message?.content

    if (!assistantContent) {
      throw new Error("No response from OpenAI")
    }

    // Generate suggestions
    const suggestionsResponse = await fetch("https://api.openai.com/v1/chat/completions", {
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
            content: `You are an AI assistant that analyzes user questions about quality control projects and generates relevant follow-up suggestions.

Based on the user's question and the assistant's response, generate exactly 2 short, actionable follow-up questions that would be helpful for someone working on a quality control project.

The suggestions should be:
- Directly related to the user's question and the assistant's response
- Actionable and specific
- Helpful for quality control and project management
- Short (maximum 8-10 words each)
- Different from each other

Return only the 2 suggestions, one per line, without numbering or bullet points.`,
          },
          {
            role: "user",
            content: `User question: "${message}"
            
Assistant response: "${assistantContent}"

Generate 2 relevant follow-up suggestions for this quality control project conversation.`,
          },
        ],
        temperature: 0.8,
        max_tokens: 100,
      }),
    })

    const suggestionsData = await suggestionsResponse.json()
    const suggestionsText = suggestionsData.choices[0]?.message?.content

    // Parse suggestions (split by lines and clean up)
    const suggestions = suggestionsText
      ? suggestionsText
          .split("\n")
          .map((s: string) => s.trim())
          .filter((s: string) => s.length > 0)
          .slice(0, 2)
      : []

    // Save assistant message to MongoDB
    const assistantMessage: Omit<ChatMessage, "_id"> = {
      projectId,
      threadId,
      role: "assistant",
      content: assistantContent,
      timestamp: new Date().toISOString(),
      suggestions,
    }

    await messagesCollection.insertOne(assistantMessage)

    // Update thread metadata
    await threadsCollection.updateOne(
      { projectId, threadId },
      {
        $set: {
          updatedAt: new Date().toISOString(),
          lastMessageAt: new Date().toISOString(),
        },
        $inc: { messageCount: 2 }, // +2 for user and assistant messages
        $setOnInsert: {
          projectId,
          threadId,
          title: message.substring(0, 50) + (message.length > 50 ? "..." : ""),
          createdAt: new Date().toISOString(),
        },
      },
      { upsert: true },
    )

    return NextResponse.json(
      {
        success: true,
        message: assistantContent,
        suggestions,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Chat API Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
