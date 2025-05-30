import mongoose, { Schema, Document } from "mongoose";

export interface ChatbotDocument extends Document {
  projectId: string;
  threadId: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

const ChatSchema = new Schema<ChatbotDocument>(
  {
    projectId: { type: String, required: true },
    threadId: { type: String, required: true },
    role: { type: String, enum: ["user", "assistant"], required: true },
    content: { type: String, required: true },
    timestamp: { type: String, required: true },
  },
  { timestamps: false }
);

export default mongoose.models.Chat ||
  mongoose.model<ChatbotDocument>("Chat", ChatSchema);
