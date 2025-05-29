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
