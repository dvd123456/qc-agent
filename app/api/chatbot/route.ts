import { type NextRequest, NextResponse } from "next/server"

// Mock database for chatbot threads
const mockChatbotThreads = new Map()

// Define interfaces
interface Message {
  role: "user" | "assistant"
  content: string
}

interface Chatbot {
  threadId: string
  projectId: string
  message: Message[]
  created_by: string
  updatedAt: string
}

// Mock AI response generator
function generateMockResponse(userMessage: string, projectId: string): string {
  // List of possible responses based on keywords
  const responses = [
    `I understand your question about "${userMessage.substring(0, 30)}...". Based on Project ${projectId}'s current status, I can provide the following insights...`,
    `That's a great question about "${userMessage.substring(0, 30)}...". Looking at the quality metrics for Project ${projectId}, I would recommend...`,
    `Regarding "${userMessage.substring(0, 30)}...", the test cases for Project ${projectId} show several interesting patterns that might help address your concern...`,
    `I've analyzed your question about "${userMessage.substring(0, 30)}...". The current progress of Project ${projectId} indicates that we should focus on...`,
    `Based on your inquiry about "${userMessage.substring(0, 30)}...", I can see that Project ${projectId} has several areas that need attention, particularly...`,
  ]

  // Select a random response
  const randomIndex = Math.floor(Math.random() * responses.length)
  return responses[randomIndex]
}

// Generate suggestions based on user message
function generateSuggestions(userMessage: string): string[] {
  // List of possible suggestion templates
  const suggestionTemplates = [
    "Can you explain more about {topic}?",
    "What are the main issues with {topic}?",
    "How can we improve {topic}?",
    "What metrics should we track for {topic}?",
    "Is there a better approach to {topic}?",
    "When should we address {topic}?",
    "Who should be responsible for {topic}?",
    "What resources do we need for {topic}?",
  ]

  // Extract potential topics from user message
  const words = userMessage.split(" ")
  const topics = words.filter((word) => word.length > 4).slice(0, 3)

  if (topics.length === 0) {
    topics.push("this issue", "quality control", "the project")
  }

  // Generate 2 random suggestions
  const suggestions = []
  for (let i = 0; i < 2; i++) {
    const randomTemplateIndex = Math.floor(Math.random() * suggestionTemplates.length)
    const randomTopicIndex = Math.floor(Math.random() * topics.length)
    const suggestion = suggestionTemplates[randomTemplateIndex].replace("{topic}", topics[randomTopicIndex])
    suggestions.push(suggestion)
  }

  return suggestions
}

// GET handler - Fetch chatbot thread
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const threadId = searchParams.get("threadId")
    const projectId = searchParams.get("projectId")

    if (!threadId || !projectId) {
      return NextResponse.json({ success: false, message: "Missing threadId or projectId" }, { status: 400 })
    }

    // Check if thread exists in mock database
    const chatbot = mockChatbotThreads.get(threadId)

    if (chatbot && chatbot.projectId === projectId) {
      return NextResponse.json({
        success: true,
        data: chatbot,
      })
    }

    // Return empty data if thread doesn't exist
    return NextResponse.json({
      success: true,
      data: null,
    })
  } catch (error) {
    console.error("Error fetching chatbot thread:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch chatbot thread" }, { status: 500 })
  }
}

// POST handler - Create or update chatbot thread
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { threadId, projectId, message, created_by } = body

    if (!threadId || !projectId || !message || !created_by) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 })
    }

    // Get the last user message
    const lastUserMessage = message.filter((m) => m.role === "user").pop()

    if (!lastUserMessage) {
      return NextResponse.json({ success: false, message: "No user message found" }, { status: 400 })
    }

    // Generate mock AI response
    const aiResponse = generateMockResponse(lastUserMessage.content, projectId)

    // Generate suggestions
    const suggestions = generateSuggestions(lastUserMessage.content)

    // Create or update chatbot thread
    const chatbot: Chatbot = {
      threadId,
      projectId,
      message,
      created_by,
      updatedAt: new Date().toISOString(),
    }

    // Store in mock database
    mockChatbotThreads.set(threadId, chatbot)

    // Return success with AI response and suggestions
    return NextResponse.json({
      success: true,
      message: aiResponse,
      suggestions,
      threadId,
    })
  } catch (error) {
    console.error("Error creating/updating chatbot thread:", error)
    return NextResponse.json({ success: false, message: "Failed to process chatbot request" }, { status: 500 })
  }
}
