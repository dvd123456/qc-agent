import { type NextRequest, NextResponse } from "next/server"
import type { Project, UpdateProjectInput, TestCase } from "@/types/project"

// Mock test cases data (same as in route.ts)
const mockTestCases: TestCase[] = [
  {
    id: "tc_001",
    testName: "User Login Validation",
    description: "Verify user can login with valid credentials",
    status: "passed",
    priority: "high",
    category: "Authentication",
    executionTime: "2.3s",
    lastRun: new Date().toISOString(),
    expectedResult: "User successfully logged in and redirected to dashboard",
    actualResult: "User successfully logged in and redirected to dashboard",
    steps: [
      "Navigate to login page",
      "Enter valid username and password",
      "Click login button",
      "Verify dashboard is displayed",
    ],
  },
  {
    id: "tc_002",
    testName: "File Upload Functionality",
    description: "Test file upload with various file types",
    status: "failed",
    priority: "high",
    category: "File Management",
    executionTime: "5.7s",
    lastRun: new Date().toISOString(),
    expectedResult: "Files uploaded successfully with progress indicator",
    actualResult: "Upload failed for files larger than 10MB",
    steps: [
      "Select files from file picker",
      "Drag and drop files to upload area",
      "Monitor upload progress",
      "Verify files appear in file list",
    ],
  },
  {
    id: "tc_003",
    testName: "Data Validation Rules",
    description: "Verify form validation for required fields",
    status: "warning",
    priority: "medium",
    category: "Data Validation",
    executionTime: "1.8s",
    lastRun: new Date().toISOString(),
    expectedResult: "Validation errors displayed for empty required fields",
    actualResult: "Some validation messages are not user-friendly",
    steps: ["Open project creation form", "Leave required fields empty", "Submit form", "Check validation messages"],
  },
  {
    id: "tc_004",
    testName: "API Response Time",
    description: "Verify API responses are within acceptable limits",
    status: "passed",
    priority: "medium",
    category: "Performance",
    executionTime: "0.9s",
    lastRun: new Date().toISOString(),
    expectedResult: "API responses under 2 seconds",
    actualResult: "Average response time: 1.2 seconds",
    steps: [
      "Send API request to /api/projects",
      "Measure response time",
      "Verify response format",
      "Check data integrity",
    ],
  },
  {
    id: "tc_005",
    testName: "Mobile Responsiveness",
    description: "Test UI elements on mobile devices",
    status: "pending",
    priority: "low",
    category: "UI/UX",
    executionTime: "N/A",
    lastRun: "Not executed",
    expectedResult: "UI elements properly scaled and accessible on mobile",
    actualResult: "Test not yet executed",
    steps: [
      "Open application on mobile device",
      "Test navigation menu",
      "Verify button sizes and spacing",
      "Check text readability",
    ],
  },
]

// Mock data (same as in route.ts)
const mockProjects: Project[] = [
  {
    id: "proj_001",
    name: "Quality Control System V2",
    metadata: {
      description: "Comprehensive quality control system for manufacturing processes",
      startDate: "2024-01-15",
      endDate: "2024-04-15",
    },
    testCase: mockTestCases.slice(0, 3),
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
    testCase: mockTestCases.slice(1, 4),
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
    testCase: mockTestCases,
    createdAt: "2023-10-20T14:00:00Z",
    updatedAt: "2024-02-01T16:45:00Z",
    status: "completed",
    priority: "high",
    userId: "user_002",
  },
]

// GET - Fetch specific project
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300))

    const project = mockProjects.find((p) => p.id === id)

    if (!project) {
      return NextResponse.json(
        {
          success: false,
          message: "Project not found",
        },
        { status: 404 },
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: "Project fetched successfully",
        data: project,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Get Project Error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch project",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

// PUT - Update project
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const body: UpdateProjectInput = await request.json()

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    const projectIndex = mockProjects.findIndex((p) => p.id === id)

    if (projectIndex === -1) {
      return NextResponse.json(
        {
          success: false,
          message: "Project not found",
        },
        { status: 404 },
      )
    }

    // Validate dates if provided
    if (body.startDate && body.endDate) {
      const start = new Date(body.startDate)
      const end = new Date(body.endDate)
      if (start >= end) {
        return NextResponse.json(
          {
            success: false,
            message: "End date must be after start date",
          },
          { status: 400 },
        )
      }
    }

    // Update project
    const project = mockProjects[projectIndex]
    const updatedProject: Project = {
      ...project,
      name: body.name || project.name,
      metadata: {
        description: body.description || project.metadata.description,
        startDate: body.startDate || project.metadata.startDate,
        endDate: body.endDate || project.metadata.endDate,
      },
      status: body.status || project.status,
      priority: body.priority || project.priority,
      testCase: body.testCase || project.testCase,
      updatedAt: new Date().toISOString(),
    }

    mockProjects[projectIndex] = updatedProject

    return NextResponse.json(
      {
        success: true,
        message: "Project updated successfully",
        data: updatedProject,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Update Project Error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update project",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

// DELETE - Delete project
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    const projectIndex = mockProjects.findIndex((p) => p.id === id)

    if (projectIndex === -1) {
      return NextResponse.json(
        {
          success: false,
          message: "Project not found",
        },
        { status: 404 },
      )
    }

    // Remove project from mock storage
    mockProjects.splice(projectIndex, 1)

    return NextResponse.json(
      {
        success: true,
        message: "Project deleted successfully",
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Delete Project Error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete project",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
