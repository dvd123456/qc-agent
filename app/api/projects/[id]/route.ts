import { type NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Project, { ProjectDocument } from "@/models/project";

// GET - Fetch specific project
export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    await dbConnect();
    const { id } = context.params;
    const project = await Project.findById(id).lean();

    if (!project) {
      return NextResponse.json(
        { success: false, message: "Project not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Project fetched successfully",
        data: {
          ...project,
          id: (project as { _id: string })._id,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get Project Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch project",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// PUT - Update project
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const { id } = params;
    const body = await request.json();

    // Validate dates if provided
    if (body.startDate && body.endDate) {
      const start = new Date(body.startDate);
      const end = new Date(body.endDate);
      if (start >= end) {
        return NextResponse.json(
          { success: false, message: "End date must be after start date" },
          { status: 400 }
        );
      }
    }

    const project = await Project.findById(id);
    if (!project) {
      return NextResponse.json(
        { success: false, message: "Project not found" },
        { status: 404 }
      );
    }

    // Update fields
    if (body.name) project.name = body.name;
    if (body.description) project.metadata.description = body.description;
    if (body.startDate) project.metadata.startDate = body.startDate;
    if (body.endDate) project.metadata.endDate = body.endDate;
    if (body.status) project.status = body.status;
    if (body.priority) project.priority = body.priority;
    if (body.testCase) project.testCase = body.testCase;
    project.updatedAt = new Date();

    await project.save();

    return NextResponse.json(
      {
        success: true,
        message: "Project updated successfully",
        data: project,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update Project Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update project",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete project
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const { id } = params;
    const project = await Project.findByIdAndDelete(id);

    if (!project) {
      return NextResponse.json(
        { success: false, message: "Project not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Project deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete Project Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete project",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
