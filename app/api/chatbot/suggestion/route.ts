import { PREDEFINED_QUESTIONS } from "@/contants";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { content } = await request.json();

    if (!content || !content.trim()) {
      return NextResponse.json({
        success: true,
        suggestions: PREDEFINED_QUESTIONS,
      });
    }

    const prompt = `
Dựa trên nội dung sau của người dùng:
"${content}"

Hãy gợi ý 3 câu hỏi liên quan mà người dùng có thể hỏi tiếp về dự án, kiểm thử phần mềm hoặc các vấn đề liên quan đến test case. Trả về kết quả là một mảng JSON các câu hỏi, ví dụ: ["Câu hỏi 1", "Câu hỏi 2", "Câu hỏi 3"]
`;

    const response = await fetch(`${process.env.NEXT_PUBLIC_OPENAI_URL}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: process.env.NEXT_PUBLIC_OPENAI_MODEL,
        messages: [
          {
            role: "system",
            content:
              "Bạn là một trợ lý AI chuyên về kiểm thử phần mềm và hỗ trợ dự án.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error("OpenAI API error");
    }

    const completion = await response.json();
    const aiContent = completion.choices?.[0]?.message?.content || "";
    let suggestions: string[] = [];
    try {
      const match = aiContent.match(/\[[\s\S]*\]/);
      if (match) {
        suggestions = JSON.parse(match[0]);
      }
    } catch {
      suggestions = [aiContent];
    }

    if (!suggestions.length) {
      suggestions = PREDEFINED_QUESTIONS;
    }

    return NextResponse.json({
      success: true,
      suggestions,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to generate suggestions" },
      { status: 500 }
    );
  }
}
