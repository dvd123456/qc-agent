import { type NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import project from "@/models/project";

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

    // Simulate upload delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const updatedProject = await project.findByIdAndUpdate(
      id,
      {
        $set: {
          testCase: [
            {
              id: "tc_001",
              title: "Kiểm tra phát hiện vết trầy xước trên bề mặt sản phẩm",
              description:
                "Xác minh rằng hệ thống có thể phát hiện đúng các vết trầy trên vỏ sản phẩm bằng camera công nghiệp.",
              expectedResult:
                "Sản phẩm có vết trầy được đánh dấu và loại khỏi dây chuyền.",
              status: "passed",
              priority: "high",
            },
            {
              id: "tc_002",
              title: "Kiểm tra nhận diện sản phẩm thiếu linh kiện",
              description:
                "Đảm bảo AI có thể nhận diện khi một chi tiết (ốc vít, cáp) bị thiếu trong sản phẩm lắp ráp.",
              expectedResult:
                "Sản phẩm bị thiếu linh kiện được gắn cờ cảnh báo.",
              status: "passed",
              priority: "critical",
            },
            {
              id: "tc_003",
              title: "Kiểm tra độ chính xác khi ánh sáng yếu",
              description:
                "Đánh giá khả năng hệ thống xử lý ảnh khi điều kiện ánh sáng không lý tưởng.",
              expectedResult:
                "Hệ thống vẫn phát hiện được lỗi trên 85% hình ảnh.",
              status: "failed",
              priority: "medium",
            },
            {
              id: "tc_004",
              title: "Kiểm tra tốc độ xử lý hình ảnh",
              description:
                "Hệ thống cần phân tích hình ảnh trong thời gian dưới 2 giây mỗi sản phẩm.",
              expectedResult: "Tất cả mẫu thử đều xử lý < 2s.",
              status: "passed",
              priority: "high",
            },
            {
              id: "tc_005",
              title: "Kiểm tra phân loại lỗi theo loại hình học",
              description:
                "Hệ thống phân biệt được lỗi hình học (cong, méo, lệch kích thước) với các lỗi khác.",
              expectedResult: "Mỗi lỗi được gán nhãn đúng loại.",
              status: "passed",
              priority: "high",
            },
            {
              id: "tc_006",
              title: "Kiểm tra phản hồi khi không có kết nối Internet",
              description:
                "Xem hệ thống có cảnh báo hợp lý khi mất kết nối với server đám mây.",
              expectedResult:
                "Thông báo lỗi rõ ràng, hệ thống vẫn lưu dữ liệu cục bộ.",
              status: "passed",
              priority: "medium",
            },
            {
              id: "tc_007",
              title: "Kiểm tra giao diện cảnh báo lỗi cho người vận hành",
              description:
                "Đảm bảo giao diện trực quan, cảnh báo dễ hiểu, không nhầm lẫn.",
              expectedResult: "Người dùng hiểu ngay vấn đề và có hướng xử lý.",
              status: "passed",
              priority: "low",
            },
            {
              id: "tc_008",
              title:
                "Kiểm tra khả năng học lại mô hình AI khi cập nhật dữ liệu mới",
              description:
                "Hệ thống cho phép tái huấn luyện mô hình từ dữ liệu người dùng upload.",
              expectedResult:
                "Quá trình huấn luyện không lỗi và mô hình cải thiện kết quả.",
              status: "in-progress",
              priority: "high",
            },
            {
              id: "tc_009",
              title: "Kiểm tra bảo mật khi truy cập dữ liệu dự án",
              description:
                "Người dùng không được phép xem hoặc sửa dữ liệu của dự án không thuộc quyền sở hữu.",
              expectedResult: "Hệ thống từ chối truy cập trái phép.",
              status: "passed",
              priority: "critical",
            },
            {
              id: "tc_010",
              title: "Kiểm tra tính toàn vẹn của dữ liệu kiểm định",
              description:
                "Không cho phép chỉnh sửa hoặc xoá dữ liệu log kiểm định sau khi ghi nhận.",
              expectedResult:
                "Các dữ liệu log được bảo vệ, có audit trail rõ ràng.",
              status: "passed",
              priority: "high",
            },
          ],
        },
      },
      { new: true }
    );

    // Process each file (mock)
    const uploadedFiles = files.map((file, index) => ({
      id: `file_${Date.now()}_${index}`,
      name: typeof file === "object" && "name" in file ? file.name : "unknown",
      size: typeof file === "object" && "size" in file ? file.size : 0,
      type: typeof file === "object" && "type" in file ? file.type : "",
      uploadedAt: new Date().toISOString(),
      status: "uploaded",
    }));

    return NextResponse.json(
      {
        success: true,
        message: "Files uploaded successfully",
        data: {
          projectId: id,
          files: uploadedFiles,
          totalUploaded: uploadedFiles.length,
          project: updatedProject,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to upload files",
      },
      { status: 500 }
    );
  }
}
