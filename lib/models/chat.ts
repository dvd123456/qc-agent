import { ObjectId } from "mongodb"

export interface ChatMessage {
  _id?: ObjectId
  id?: string
  projectId: string
  threadId: string
  role: "user" | "assistant"
  content: string
  timestamp: string
  suggestions?: string[]
}

export interface ChatThread {
  _id?: ObjectId
  id?: string
  projectId: string
  threadId: string
  title: string
  createdAt: string
  updatedAt: string
  messageCount: number
  lastMessageAt: string
}
