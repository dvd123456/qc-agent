import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Project from "@/models/project";

const headers = [
  "Test Case ID",
  "Module",
  "Title",
  "Preconditions",
  "Test Steps",
  "Expected Result",
  "Actual Result",
  "Priority",
  "Remarks",
];

function toCSV(testCases: any[]) {
  if (!testCases.length) return "";

  const escape = (val: any) => `"${String(val).replace(/"/g, '""')}"`;

  const rows: string[] = [];
  for (const tc of testCases) {
    rows.push(
      [
        escape(tc.testCaseId),
        escape(tc.module),
        escape(tc.title),
        escape(tc.preconditions),
        escape(Array.isArray(tc.testSteps) ? tc.testSteps.join("\n") : ""),
        escape(tc.expectedResult),
        escape(tc.actualResult),
        escape(tc.priority),
        escape(tc.remarks),
      ].join(",")
    );
  }
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
