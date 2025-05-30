import { type NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Chat, { ChatbotDocument } from "@/models/chat";
import Project, { ProjectDocument } from "@/models/project";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const threadId = searchParams.get("threadId");
    const projectId = searchParams.get("projectId");

    if (!threadId || !projectId) {
      return NextResponse.json(
        { success: false, message: "Missing threadId or projectId" },
        { status: 400 }
      );
    }

    const messages = await Chat.find({ threadId, projectId })
      .sort({ timestamp: 1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: messages,
    });
  } catch (error) {
    console.error("Error fetching chatbot thread:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch chatbot thread" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const { threadId, projectId, content, created_by } = body;

    if (!threadId || !projectId || !content || !created_by) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    const project: ProjectDocument | null = await Project.findById(projectId);
    if (!project) {
      return NextResponse.json(
        { success: false, message: "Project not found" },
        { status: 404 }
      );
    }

    const projectDetail = `Tên dự án: ${project.name}. Mô tả: ${JSON.stringify(
      project.metadata
    )}.`;

    const history = await Chat.find({ threadId, projectId })
      .sort({ timestamp: 1 })
      .lean();

    const messagesHistory = history.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    const messages = [
      {
        role: "system",
        content: `Thông tin dự án: ${JSON.stringify(projectDetail)}`,
      },
      {
        role: "system",
        content: `Lịch sử hội thoại trước đó: ${JSON.stringify(
          messagesHistory
        )}`,
      },
      {
        role: "system",
        content: `
         Vai trò của bạn:
          - Bạn là một QC Agent, có kiến thức chuyên môn về kiểm thử phần mềm.
          - Bạn có thể trả lời các loại câu hỏi sau:
            + Câu hỏi liên quan đến nội dung, chức năng hoặc mục tiêu của dự án.
            + Câu hỏi liên quan đến kiểm thử phần mềm, bao gồm cách viết test case, tự động hóa kiểm thử, quy trình kiểm thử.
            + Yêu cầu tạo test case từ thông tin dự án.
          - Nếu người dùng hỏi về chủ đề KHÔNG LIÊN QUAN đến dự án hoặc kiểm thử phần mềm, hãy trả lời: "Xin lỗi, hãy hỏi về dự án này."
        `,
      },
      {
        role: "system",
        content:
          "Trả kết quả dưới dạng HTML (chỉ phần <body>, không có <html> hay <head>).",
      },
      {
        role: "user",
        content: content,
      },
    ];

    console.log("Messages sent to OpenAI:", messages);

    const response = await fetch(`${process.env.NEXT_PUBLIC_OPENAI_URL}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: process.env.NEXT_PUBLIC_OPENAI_MODEL,
        messages,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error("OpenAI API error");
    }

    const completion = await response.json();
    const aiContent =
      completion.choices?.[0]?.message?.content ||
      "Xin lỗi, tôi chưa có câu trả lời.";

    // xóa đi ```html ```` ở đầu và cuối
    const cleanedAiContent = aiContent.replace(/```html\s*|\s*```/g, "").trim();

    const userMsg: ChatbotDocument = await Chat.create({
      threadId,
      projectId,
      role: "user",
      content,
      timestamp: new Date().toISOString(),
    });

    const aiMsg: ChatbotDocument = await Chat.create({
      threadId,
      projectId,
      role: "assistant",
      content: cleanedAiContent,
      timestamp: new Date().toISOString(),
    });

    // Step 5: Trả về cho FE
    return NextResponse.json({
      success: true,
      message: cleanedAiContent,
      threadId,
      data: [userMsg, aiMsg],
    });
  } catch (error) {
    console.error("Error creating/updating chatbot thread:", error);
    return NextResponse.json(
      { success: false, message: "Failed to process chatbot request" },
      { status: 500 }
    );
  }
}
