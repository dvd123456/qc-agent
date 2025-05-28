import { type NextRequest, NextResponse } from "next/server"
import type { Project, UpdateProjectInput } from "@/types/project"

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

    // Add test case statistics for UI
    const projectWithStats = {
      ...project,
      testCases: {
        total: project.testCase?.count || 0,
        stats: {
          passed: Math.floor((project.testCase?.count || 0) * 0.7),
          failed: Math.floor((project.testCase?.count || 0) * 0.2),
          pending: Math.floor((project.testCase?.count || 0) * 0.1),
        },
      },
    }

    return NextResponse.json(
      {
        success: true,
        message: "Project fetched successfully",
        data: projectWithStats,
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
