"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Bot, User, Settings, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { TypingEffect } from "./typing-effect"

interface Message {
  id?: string
  role: "user" | "assistant"
  content: string
  timestamp: string
  suggestions?: string[]
}

interface ChatInterfaceProps {
  projectId: string
}

// 10 predefined questions for QC projects
const PREDEFINED_QUESTIONS = [
  "What are the current issues in this project?",
  "How is the project progress looking?",
  "What files still need to be uploaded?",
  "Are we on track to meet the deadline?",
  "What should be the next priority?",
  "Show me recent project activities",
  "What quality metrics should I focus on?",
  "How can I improve the testing process?",
  "What are the biggest risks right now?",
  "When should we schedule the next review?",
]

export function ChatInterface({ projectId }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const [typingSpeed, setTypingSpeed] = useState(30)
  const [completedMessages, setCompletedMessages] = useState<Set<string>>(new Set())

  // Initialize with welcome message
  useEffect(() => {
    // Load chat history from localStorage
    const savedMessages = localStorage.getItem(`chat_${projectId}`)
    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages)
        setMessages(parsed)
        // Mark all messages as completed for typing effect
        const completedIds = new Set<string>()
        parsed.forEach((msg: Message, index: number) => {
          completedIds.add(msg.id || `msg-${index}`)
        })
        setCompletedMessages(completedIds)
      } catch (error) {
        console.error("Failed to load chat history:", error)
      }
    }

    // If no saved messages, add welcome message
    if (!savedMessages) {
      const welcomeMessage: Message = {
        id: "welcome",
        role: "assistant",
        content: `Hello! I'm your QC Agent AI assistant for Project ${projectId}. I can help you with quality control analysis, progress tracking, and issue resolution. How can I assist you today?`,
        timestamp: new Date().toISOString(),
        suggestions: PREDEFINED_QUESTIONS.slice(0, 6),
      }
      setMessages([welcomeMessage])
      setCompletedMessages(new Set(["welcome"]))
    }
  }, [projectId])

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(`chat_${projectId}`, JSON.stringify(messages))
    }
  }, [messages, projectId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleTypingComplete = (messageId: string) => {
    setCompletedMessages((prev) => new Set([...prev, messageId]))
  }

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim()) return

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: messageText,
      timestamp: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)
    setError(null)

    try {
      // Mock AI response for demo
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: `I understand you're asking about "${messageText}". As your QC Agent AI, I can help you analyze this aspect of Project ${projectId}. Based on the current project status, here are some insights and recommendations for your quality control process.`,
        timestamp: new Date().toISOString(),
        suggestions: PREDEFINED_QUESTIONS.slice(0, 2),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (err) {
      console.error("Chat error:", err)
      setError(err instanceof Error ? err.message : "An error occurred")

      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: "assistant",
        content: "Sorry, I encountered an error while processing your request. Please try again.",
        timestamp: new Date().toISOString(),
        suggestions: PREDEFINED_QUESTIONS.slice(0, 2),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  const handleSuggestedQuestionClick = (question: string) => {
    sendMessage(question)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="bg-muted/30 border-b px-4 py-2 flex items-center justify-between">
        <div className="flex items-center">
          <span className="text-sm font-medium">Chat Session: Project {projectId}</span>
        </div>
        <div className="text-xs text-muted-foreground">Demo Mode - Mock AI Responses</div>
      </div>

      <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.map((message, index) => (
            <div key={message.id || index} className="space-y-4" data-message-id={message.id || index}>
              <div
                className={cn(
                  "flex items-start gap-3 rounded-lg p-4",
                  message.role === "user" ? "ml-auto bg-primary text-primary-foreground" : "bg-muted",
                )}
                style={{ maxWidth: "80%" }}
              >
                <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border bg-background">
                  {message.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </div>
                <div>
                  <div className="text-sm">
                    {message.role === "assistant" && !completedMessages.has(message.id || `msg-${index}`) ? (
                      <TypingEffect
                        text={message.content}
                        speed={typingSpeed}
                        onComplete={() => handleTypingComplete(message.id || `msg-${index}`)}
                      />
                    ) : (
                      <span className="whitespace-pre-wrap">{message.content}</span>
                    )}
                  </div>
                  <div className="mt-1 text-xs text-gray-500">{new Date(message.timestamp).toLocaleTimeString()}</div>
                </div>
              </div>

              {/* Dynamic suggestions */}
              {message.role === "assistant" &&
                index === messages.length - 1 &&
                completedMessages.has(message.id || `msg-${index}`) &&
                message.suggestions && (
                  <div className="ml-11 space-y-2">
                    <div className="flex items-center text-xs text-muted-foreground mb-2">
                      <Sparkles className="h-3 w-3 mr-1" />
                      <span>Suggested questions</span>
                    </div>
                    {message.suggestions.map((question, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSuggestedQuestionClick(question)}
                        className="block w-full max-w-[80%] text-left px-4 py-2 text-sm rounded-lg border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors"
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                )}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-start gap-3 rounded-lg p-4 bg-muted" style={{ maxWidth: "80%" }}>
              <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border bg-background">
                <Bot className="h-4 w-4" />
              </div>
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                <span className="text-sm text-muted-foreground">AI is thinking...</span>
              </div>
            </div>
          )}

          {error && (
            <div
              className="flex items-start gap-3 rounded-lg p-4 bg-red-50 border border-red-200"
              style={{ maxWidth: "80%" }}
            >
              <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border bg-background">
                <Bot className="h-4 w-4 text-red-500" />
              </div>
              <div>
                <div className="text-sm text-red-700">Error occurred while processing your request</div>
                <div className="mt-1 text-xs text-red-500">{error}</div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="border-t p-4">
        <form onSubmit={handleSubmit} className="flex gap-2 max-w-3xl mx-auto">
          <Input
            placeholder="Ask about your project..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            className="border-primary/20 focus:border-primary"
          />
          <Button type="submit" disabled={isLoading || !input.trim()} className="btn-gradient text-white">
            <Send className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
        <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground max-w-3xl mx-auto">
          <div className="text-green-600">✅ Demo Mode - Local Storage</div>
          <div className="flex items-center">
            <Settings className="h-3 w-3 mr-1" />
            <span>Typing Speed:</span>
            <button
              onClick={() => setTypingSpeed((prev) => Math.min(prev + 10, 100))}
              className="ml-2 px-2 py-1 rounded hover:bg-primary/10"
              title="Slower typing"
            >
              Slower
            </button>
            <button
              onClick={() => setTypingSpeed((prev) => Math.max(prev - 10, 10))}
              className="ml-1 px-2 py-1 rounded hover:bg-primary/10"
              title="Faster typing"
            >
              Faster
            </button>
            <span className="ml-1">({typingSpeed}ms)</span>
          </div>
        </div>
      </div>
    </div>
  )
}
