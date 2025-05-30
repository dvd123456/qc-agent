"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Bot, User, Settings, Sparkles, History } from "lucide-react";
import { cn } from "@/lib/utils";
import { TypingEffect } from "./typing-effect";
import { getOrCreateThreadId, updateThreadExpiry } from "@/lib/thread-manager";
import { PREDEFINED_QUESTIONS } from "@/contants";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatInterfaceProps {
  projectId: string;
}

// 10 predefined questions for QC projects

export function ChatInterface({ projectId }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [typingSpeed, setTypingSpeed] = useState(30);
  const [completedMessages, setCompletedMessages] = useState<Set<string>>(
    new Set()
  );
  const [threadId, setThreadId] = useState<string>("");
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Initialize threadId and load chat history
  useEffect(() => {
    const currentThreadId = getOrCreateThreadId(projectId);
    setThreadId(currentThreadId);
    loadChatHistory(projectId, currentThreadId);
  }, [projectId]);

  const loadChatHistory = async (projectId: string, threadId: string) => {
    try {
      setIsLoadingHistory(true);
      setError(null);

      const response = await fetch(
        `/api/chatbot?projectId=${projectId}&threadId=${threadId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (Array.isArray(data.data) && data.data.length > 0) {
        setMessages(data.data);
        // Đánh dấu đã hoàn thành hiệu ứng typing cho tất cả messages cũ
        const completedIds = new Set<string>();
        data.data.forEach((_: Message, index: number) => {
          completedIds.add(`msg-${index}`);
        });
        setCompletedMessages(completedIds);

        // Tìm message user cuối cùng
        const lastUserMsg = [...data.data]
          .reverse()
          .find((msg) => msg.role === "user");
        const suggestContent = lastUserMsg ? lastUserMsg.content : "";

        const suggestRes = await fetch("/api/chatbot/suggestion", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: suggestContent }),
        });
        const suggestData = await suggestRes.json();
        if (suggestData.success && suggestData.suggestions) {
          setSuggestions(suggestData.suggestions);
        } else {
          setSuggestions([]);
        }
      } else {
        // Không có history, show welcome message
        const welcomeMessage: Message = {
          role: "assistant",
          content: `Hello! I'm your QC Agent AI assistant for Project ${projectId}. How can I help you today?`,
        };
        setMessages([welcomeMessage]);
        setCompletedMessages(new Set(["msg-0"]));
        // Gọi suggestion default
        const suggestRes = await fetch("/api/chatbot/suggestion", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: "" }),
        });
        const suggestData = await suggestRes.json();
        if (suggestData.success && suggestData.suggestions) {
          setSuggestions(suggestData.suggestions);
        } else {
          setSuggestions([]);
        }
      }
    } catch (error) {
      setError("Failed to load chat history");
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (!isLoadingHistory) {
      scrollToBottom();
    }
  }, [messages, isLoadingHistory]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToShowUserMessage = (messageIndex: number) => {
    setTimeout(() => {
      const messageElement = document.querySelector(
        `[data-message-id="msg-${messageIndex}"]`
      );
      if (messageElement && chatContainerRef.current) {
        const container = chatContainerRef.current;
        const messageTop = (messageElement as HTMLElement).offsetTop;

        container.scrollTo({
          top: messageTop - 20,
          behavior: "smooth",
        });
      }
    }, 100);
  };

  const handleTypingComplete = (messageId: string) => {
    setCompletedMessages((prev) => new Set([...prev, messageId]));
  };

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || !threadId) return;

    const userMessage: Message = {
      role: "user",
      content: messageText,
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);
    setError(null);
    setSuggestions([]);

    // Scroll to show user message
    scrollToShowUserMessage(newMessages.length - 1);

    try {
      // Gọi 2 API song song
      const [chatRes, suggestRes] = await Promise.all([
        fetch("/api/chatbot", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            threadId,
            projectId,
            content: messageText,
            created_by: "user",
          }),
        }),
        fetch("/api/chatbot/suggestion", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: messageText }),
        }),
      ]);

      const chatData = await chatRes.json();
      const suggestData = await suggestRes.json();

      if (!chatData.success) {
        throw new Error(chatData.error || "Failed to get response");
      }

      updateThreadExpiry(projectId);

      const assistantMessage: Message = {
        role: "assistant",
        content: chatData.message,
      };

      const finalMessages = [...newMessages, assistantMessage];
      setMessages(finalMessages);

      if (suggestData.success && suggestData.suggestions) {
        setSuggestions(suggestData.suggestions);
      } else {
        setSuggestions([]);
      }
    } catch (err) {
      console.error("Chat error:", err);
      setError(err instanceof Error ? err.message : "An error occurred");

      const errorMessage: Message = {
        role: "assistant",
        content:
          "Sorry, I encountered an error while processing your request. Please try again.",
      };
      setMessages((prev) => [...prev, errorMessage]);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleSuggestedQuestionClick = (question: string) => {
    sendMessage(question);
  };

  if (isLoadingHistory) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="text-lg text-muted-foreground">
            Loading chat history...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="bg-muted/30 border-b px-4 py-2 flex items-center justify-between">
        <div className="flex items-center">
          <History className="h-4 w-4 mr-2 text-primary" />
          <span className="text-sm font-medium">Thread: {threadId}</span>
        </div>
        <div className="text-xs text-muted-foreground">
          Session expires after 60 minutes of inactivity
        </div>
      </div>

      <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className="space-y-4"
              data-message-id={`msg-${index}`}
            >
              <div
                className={cn(
                  "flex items-start gap-3 rounded-lg p-4 border border-gray-200",
                  message.role === "user"
                    ? "ml-auto bg-muted w-fit max-w-[80%]"
                    : "bg-muted"
                )}
              >
                <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border bg-background">
                  {message.role === "user" ? (
                    <User className="h-4 w-4" />
                  ) : (
                    <Bot className="h-4 w-4" />
                  )}
                </div>
                <div>
                  <div className="text-sm">
                    {message.role === "assistant" ? (
                      <TypingEffect
                        html={message.content}
                        speed={10}
                        onComplete={() => handleTypingComplete(`msg-${index}`)}
                      />
                    ) : (
                      <span className="whitespace-pre-wrap">
                        {message.content}
                      </span>
                    )}
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    {new Date().toLocaleTimeString()}
                  </div>
                </div>
              </div>

              {/* Dynamic suggestions - only show for the last assistant message and after typing is complete */}
              {message.role === "assistant" &&
                index === messages.length - 1 &&
                completedMessages.has(`msg-${index}`) &&
                suggestions.length > 0 && (
                  <div className="ml-11 space-y-2">
                    <div className="flex items-center text-xs text-muted-foreground mb-2">
                      <Sparkles className="h-3 w-3 mr-1" />
                      <span>AI-generated suggestions</span>
                    </div>
                    {suggestions.map((question, idx) => (
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
            <div
              className="flex items-start gap-3 rounded-lg p-4 bg-muted"
              style={{ maxWidth: "80%" }}
            >
              <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border bg-background">
                <Bot className="h-4 w-4" />
              </div>
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                <span className="text-sm text-muted-foreground">
                  AI is thinking and generating suggestions...
                </span>
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
                <div className="text-sm text-red-700">
                  Error occurred while processing your request
                </div>
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
          <Button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="btn-gradient text-white"
          >
            <Send className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
        <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground max-w-3xl mx-auto">
          <div className="text-green-600">✅ Mock Data + Smart Suggestions</div>
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
  );
}
