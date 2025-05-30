import { type NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import type { CreateProjectInput } from "@/types/project";
import Project from "@/models/project";
import { Sumana } from "next/font/google";

export async function GET() {
  try {
    await dbConnect();

    const projects = await Project.find().sort({ createdAt: -1 }).lean();

    return NextResponse.json({
      success: true,
      message: "Projects fetched successfully",
      data: projects.map((project) => ({
        ...project,
        id: project._id,
      })),
      count: projects.length,
    });
  } catch (error) {
    console.error("Get Projects Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch projects",
        error: error instanceof Error ? error.message : "Unknown error",
        data: [],
      },
      { status: 500 }
    );
  }
}

// POST - Create new project
export async function POST(request: NextRequest) {
  try {
    const body: CreateProjectInput = await request.json();
    const { name, description, startDate, endDate, summary } = body;

    if (!name || !startDate || !endDate) {
      return NextResponse.json(
        {
          success: false,
          message: "Name, start date, and end date are required",
          data: null,
        },
        { status: 400 }
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start >= end) {
      return NextResponse.json(
        {
          success: false,
          message: "End date must be after start date",
          data: null,
        },
        { status: 400 }
      );
    }

    await dbConnect();

    const newProject = await Project.create({
      name,
      metadata: {
        description: description || "",
        startDate,
        endDate,
      },
      summary,
      testCase: [],
      status: "active",
      priority: "medium",
      userId: "current_user_id",
    });

    return NextResponse.json({
      success: true,
      message: "Project created successfully",
      data: newProject,
    });
  } catch (error) {
    console.error("Create Project Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create project",
        error: error instanceof Error ? error.message : "Unknown error",
        data: null,
      },
      { status: 500 }
    );
  }
}
