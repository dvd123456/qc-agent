import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Project from "@/models/project";

function toCSV(testCases: any[]) {
  if (!testCases.length) return "";
  const headers = Object.keys(testCases[0]);
  const escape = (val: any) =>
    `"${String(val).replace(/"/g, '""').replace(/\n/g, " ")}"`;
  const rows = testCases.map((tc) =>
    headers
      .map((h) =>
        Array.isArray(tc[h]) ? escape(tc[h].join(" | ")) : escape(tc[h] ?? "")
      )
      .join(",")
  );
  return [headers.join(","), ...rows].join("\n");
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const url = new URL(request.url);
    const projectId = url.searchParams.get("projectId");

    if (!projectId) {
      return NextResponse.json(
        { success: false, message: "Missing projectId" },
        { status: 400 }
      );
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return NextResponse.json(
        { success: false, message: "Project not found" },
        { status: 404 }
      );
    }

    const testCases = project?.testCase || [];
    const fileName = `test-cases-${projectId}.csv`;
    const csv = toCSV(testCases);

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Export failed", error: String(error) },
      { status: 500 }
    );
  }
}
