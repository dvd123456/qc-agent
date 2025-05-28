import { NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { Project, CreateProjectInput } from "@/lib/models/project"
import { seedTestCasesForProject } from "@/lib/seed-data"
import { ObjectId } from "mongodb"

// GET - Fetch all projects
export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase()
    const projectsCollection = db.collection<Project>("projects")

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId") // Optional user filtering
    const status = searchParams.get("status") // Optional status filtering

    // Build query
    const query: any = {}
    if (userId) query.userId = userId
    if (status) query.status = status

    const projects = await projectsCollection
      .find(query)
      .sort({ createdAt: -1 }) // Sort by newest first
      .toArray()

    // Transform _id to id for frontend compatibility and flatten metadata
    const transformedProjects = projects.map((project) => ({
      id: project._id?.toString(),
      name: project.name,
      description: project.metadata.description,
      startDate: project.metadata.startDate,
      endDate: project.metadata.endDate,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      status: project.status,
      priority: project.priority,
      userId: project.userId,
      // Calculate progress based on dates
      progress: calculateProgress(project.metadata.startDate, project.metadata.endDate),
      filesUploaded: 0, // Default values for UI compatibility
      totalFiles: 0,
      team: ["Current User"], // Default team
    }))

    return NextResponse.json(
      {
        success: true,
        message: "Projects fetched successfully",
        data: transformedProjects,
        count: transformedProjects.length,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Get Projects Error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch projects",
        error: error instanceof Error ? error.message : "Unknown error",
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

    // Validate required fields
    if (!name || !startDate || !endDate) {
      return NextResponse.json(
        {
          success: false,
          message: "Name, start date, and end date are required",
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
        },
        { status: 400 },
      )
    }

    const db = await getDatabase()
    const projectsCollection = db.collection<Project>("projects")

    // Create new project with the new structure
    const newProject: Omit<Project, "_id"> = {
      name,
      metadata: {
        description: description || "",
        startDate,
        endDate,
      },
      testCase: null, // Will be populated when test cases are created
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: "active",
      priority: "medium",
      userId: "current_user_id", // In real app, get from auth token
    }

    const result = await projectsCollection.insertOne(newProject)
    const projectId = result.insertedId.toString()

    // Seed test cases for the new project
    await seedTestCasesForProject(projectId)

    // Update project with test case reference
    await projectsCollection.updateOne(
      { _id: result.insertedId },
      {
        $set: {
          testCase: { hasTestCases: true, count: 8 }, // Reference to test cases
          updatedAt: new Date().toISOString(),
        },
      },
    )

    const createdProject = {
      id: projectId,
      name,
      description: description || "",
      startDate,
      endDate,
      createdAt: newProject.createdAt,
      updatedAt: new Date().toISOString(),
      status: newProject.status,
      priority: newProject.priority,
      progress: calculateProgress(startDate, endDate),
      filesUploaded: 0,
      totalFiles: 0,
      team: ["Current User"],
    }

    return NextResponse.json(
      {
        success: true,
        message: "Project created successfully",
        data: createdProject,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Create Project Error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create project",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

// Helper function to calculate progress based on dates
function calculateProgress(startDate: string, endDate: string): number {
  const start = new Date(startDate).getTime()
  const end = new Date(endDate).getTime()
  const current = new Date().getTime()

  if (current < start) return 0
  if (current > end) return 100

  const totalDuration = end - start
  const elapsed = current - start
  return Math.round((elapsed / totalDuration) * 100)
}
