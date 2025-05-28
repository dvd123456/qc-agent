import { type NextRequest, NextResponse } from "next/server"
import type { Project, CreateProjectInput } from "@/types/project"

// Mock data storage (in a real app, this would be a database)
const mockProjects: Project[] = [
  {
    id: "proj_001",
    name: "Quality Control System V2",
    metadata: {
      description: "Comprehensive quality control system for manufacturing processes",
      startDate: "2024-01-15",
      endDate: "2024-04-15",
    },
    testCase: { hasTestCases: true, count: 12 },
    createdAt: "2024-01-10T10:00:00Z",
    updatedAt: "2024-01-28T15:30:00Z",
    status: "active",
    priority: "high",
    userId: "user_001",
  },
  {
    id: "proj_002",
    name: "Automated Testing Framework",
    metadata: {
      description: "Development of automated testing framework for QC processes",
      startDate: "2024-02-01",
      endDate: "2024-05-01",
    },
    testCase: { hasTestCases: true, count: 8 },
    createdAt: "2024-01-25T09:00:00Z",
    updatedAt: "2024-02-10T11:20:00Z",
    status: "active",
    priority: "medium",
    userId: "user_001",
  },
  {
    id: "proj_003",
    name: "Legacy System Migration",
    metadata: {
      description: "Migration of legacy QC systems to modern infrastructure",
      startDate: "2023-11-01",
      endDate: "2024-02-01",
    },
    testCase: { hasTestCases: true, count: 20 },
    createdAt: "2023-10-20T14:00:00Z",
    updatedAt: "2024-02-01T16:45:00Z",
    status: "completed",
    priority: "high",
    userId: "user_002",
  },
]

// GET - Fetch all projects
export async function GET() {
  try {
    console.log("API: Fetching projects...")

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300))

    console.log("API: Returning projects:", mockProjects)

    return NextResponse.json({
      success: true,
      message: "Projects fetched successfully",
      data: mockProjects,
      count: mockProjects.length,
    })
  } catch (error) {
    console.error("Get Projects Error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch projects",
        error: error instanceof Error ? error.message : "Unknown error",
        data: [],
      },
      { status: 500 },
    )
  }
}

// POST - Create new project
export async function POST(request: NextRequest) {
  try {
    const body: CreateProjectInput = await request.json()
    const { name, description, startDate, endDate } = body

    console.log("API: Creating project with data:", body)

    // Validate required fields
    if (!name || !startDate || !endDate) {
      return NextResponse.json(
        {
          success: false,
          message: "Name, start date, and end date are required",
          data: null,
        },
        { status: 400 },
      )
    }

    // Validate dates
    const start = new Date(startDate)
    const end = new Date(endDate)
    if (start >= end) {
      return NextResponse.json(
        {
          success: false,
          message: "End date must be after start date",
          data: null,
        },
        { status: 400 },
      )
    }

    // Create new project with the new structure
    const newProject: Project = {
      id: `proj_${Date.now()}`,
      name,
      metadata: {
        description: description || "",
        startDate,
        endDate,
      },
      testCase: { hasTestCases: false, count: 0 },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: "active",
      priority: "medium",
      userId: "current_user_id",
    }

    // Add to mock storage
    mockProjects.unshift(newProject)

    console.log("API: Project created successfully:", newProject)

    return NextResponse.json({
      success: true,
      message: "Project created successfully",
      data: newProject,
    })
  } catch (error) {
    console.error("Create Project Error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create project",
        error: error instanceof Error ? error.message : "Unknown error",
        data: null,
      },
      { status: 500 },
    )
  }
}
