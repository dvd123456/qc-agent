import { NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { ChatMessage } from "@/lib/models/chat"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get("projectId")
    const threadId = searchParams.get("threadId")

    if (!projectId || !threadId) {
      return NextResponse.json(
        {
          success: false,
          message: "Project ID and thread ID are required",
        },
        { status: 400 },
      )
    }

    const db = await getDatabase()
    const messagesCollection = db.collection<ChatMessage>("chat_messages")

    // Get messages for this thread
    const messages = await messagesCollection
      .find({ projectId, threadId })
      .sort({ timestamp: 1 })
      .toArray()

    // Transform _id to id for frontend compatibility
    const transformedMessages = messages.map((message) => ({
      ...message,
      id: message._id?.toString(),
      _id: undefined,
    }))

    return NextResponse.json(
      {
        success: true,
        data: transformedMessages,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Get Chat History Error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch chat history",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
