import { type NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Project from "@/models/project";

// Helper: Convert File to Buffer
async function fileToBuffer(file: File): Promise<Buffer> {
  const arrayBuffer = await file.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const { id } = params;

    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, message: "No files uploaded" },
        { status: 400 }
      );
    }

    const uploadForm = new FormData();
    for (const file of files) {
      const buffer = await fileToBuffer(file);
      uploadForm.append("files", new Blob([buffer]), file.name);
    }

    // Gửi lên API backend
    const uploadRes = await fetch("http://127.0.0.1:8000/file/uploadFile", {
      method: "POST",
      body: uploadForm,
    });

    if (!uploadRes.ok) {
      throw new Error("Failed to upload files to backend");
    }

    const uploadResult = await uploadRes.json();

    const fullText = uploadResult.content || "";

    const messages = [
      {
        role: "system",
        content: `
          Bạn là chuyên gia kiểm thử phần mềm (QA/QC) có kinh nghiệm viết test case chuyên nghiệp.
          
          Nhiệm vụ của bạn là:
          
          1. Đọc và tóm tắt nội dung yêu cầu được cung cấp (summary).
          2. Dựa trên nội dung đó, sinh ra danh sách test case theo đúng định dạng chuẩn JSON bên dưới.
          
          Yêu cầu định dạng đầu ra:
          {
            "summary": "Tóm tắt nội dung yêu cầu của khách hàng, ngắn gọn, đầy đủ ý chính.",
            "testCase": [
              {
                "testCaseId": "TC_<MODULE>_<STT>",
                "module": "Tên module",
                "title": "Tên test case rõ ràng",
                "preconditions": "Điều kiện tiên quyết (nếu có)",
                "testSteps": [
                  "Bước 1",
                  "Bước 2",
                  ...
                ],
                "expectedResult": "Kết quả mong đợi sau khi thực hiện bước kiểm thử",
                "actualResult": "",
                "priority": "High | Medium | Low",
                "remarks": ""
              }
            ]
          }
          
          Lưu ý:
          - Tôi muốn 20 đến 40 test case.
          - Đặt testCaseId theo format chuẩn.
          - Không vượt quá giới hạn token — hãy rút gọn các chuỗi lặp, từ ngữ không cần thiết.
          - Đảm bảo JSON hợp lệ và có thể parse được.
          
          Tôi sẽ gửi cho bạn nội dung tóm tắt yêu cầu của khách hàng ngay sau đây. 
          Khi nhận được, hãy phản hồi theo đúng định dạng JSON yêu cầu bên trên.
          Yêu cầu không giải thích gì thêm, chỉ cần trả về JSON đúng định dạng.
        `,
      },
      {
        role: "user",
        content: fullText,
      },
    ];

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
    const openaiResult = await response.json();

    try {
      const content = openaiResult.choices?.[0]?.message?.content;
      if (content) {
        // Loại bỏ ```json và ```
        const cleaned = content
          .replace(/```json\s*/i, "")
          .replace(/```/g, "")
          .trim();
        const parsed = JSON.parse(cleaned);
        await Project.findByIdAndUpdate(id, {
          $set: {
            summary: parsed?.summary,
            testCase: parsed?.testCase,
            createdAt: new Date(),
          },
        });
      }
    } catch (e) {
      console.error("Parse OpenAI content error:", e);
      throw new Error("Failed to parse OpenAI response");
    }

    // Lưu vào MongoDB – ví dụ update project

    return NextResponse.json(
      {
        success: true,
        message: "Files uploaded and processed successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to upload files",
      },
      { status: 500 }
    );
  }
}
