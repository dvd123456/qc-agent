// Define interfaces
export interface Message {
  role: "user" | "assistant";
  content: string;
}

export interface Chatbot {
  threadId: string;
  projectId: string;
  message: Message[];
  created_by: string;
  updatedAt: string;
}
