import { NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { Project, UpdateProjectInput } from "@/lib/models/project"
import { ObjectId } from "mongodb"

// GET - Fetch specific project
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid project ID format",
        },
        { status: 400 },
      )
    }

    const db = await getDatabase()
    const projectsCollection = db.collection<Project>("projects")
    const testCasesCollection = db.collection("test_cases")

    const project = await projectsCollection.findOne({ _id: new ObjectId(id) })

    if (!project) {
      return NextResponse.json(
        {
          success: false,
          message: "Project not found",
        },
        { status: 404 },
      )
    }

    // Get test case statistics
    const testCaseStats = await testCasesCollection
      .aggregate([
        { $match: { projectId: id } },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ])
      .toArray()

    const testCaseCount = await testCasesCollection.countDocuments({ projectId: id })

    // Transform for frontend with additional details
    const transformedProject = {
      id: project._id?.toString(),
      name: project.name,
      description: project.metadata.description,
      startDate: project.metadata.startDate,
      endDate: project.metadata.endDate,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      status: project.status,
      priority: project.priority,
      progress: calculateProgress(project.metadata.startDate, project.metadata.endDate),
      filesUploaded: 0, // Default for UI compatibility
      totalFiles: 0,
      team: ["Current User"],
      testCases: {
        total: testCaseCount,
        stats: testCaseStats.reduce((acc, stat) => {
          acc[stat._id] = stat.count
          return acc
        }, {} as Record<string, number>),
      },
    }

    return NextResponse.json(
      {
        success: true,
        message: "Project fetched successfully",
        data: transformedProject,
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

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid project ID format",
        },
        { status: 400 },
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

    const db = await getDatabase()
    const projectsCollection = db.collection<Project>("projects")

    // Prepare update data with new structure
    const updateData: any = {
      updatedAt: new Date().toISOString(),
    }

    // Update top-level fields
    if (body.name) updateData.name = body.name
    if (body.status) updateData.status = body.status
    if (body.priority) updateData.priority = body.priority
    if (body.testCase) updateData.testCase = body.testCase

    // Update metadata fields
    if (body.description || body.startDate || body.endDate) {
      const project = await projectsCollection.findOne({ _id: new ObjectId(id) })
      if (project) {
        updateData.metadata = {
          description: body.description || project.metadata.description,
          startDate: body.startDate || project.metadata.startDate,
          endDate: body.endDate || project.metadata.endDate,
        }
      }
    }

    const result = await projectsCollection.updateOne({ _id: new ObjectId(id) }, { $set: updateData })

    if (result.matchedCount === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Project not found",
        },
        { status: 404 },
      )
    }

    // Fetch updated project
    const updatedProject = await projectsCollection.findOne({ _id: new ObjectId(id) })

    const transformedProject = {
      id: updatedProject?._id?.toString(),
      name: updatedProject?.name,
      description: updatedProject?.metadata.description,
      startDate: updatedProject?.metadata.startDate,
      endDate: updatedProject?.metadata.endDate,
      createdAt: updatedProject?.createdAt,
      updatedAt: updatedProject?.updatedAt,
      status: updatedProject?.status,
      priority: updatedProject?.priority,
      progress: updatedProject
        ? calculateProgress(updatedProject.metadata.startDate, updatedProject.metadata.endDate)
        : 0,
    }

    return NextResponse.json(
      {
        success: true,
        message: "Project updated successfully",
        data: transformedProject,
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

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid project ID format",
        },
        { status: 400 },
      )
    }

    const db = await getDatabase()
    const projectsCollection = db.collection<Project>("projects")
    const testCasesCollection = db.collection("test_cases")
    const chatMessagesCollection = db.collection("chat_messages")
    const chatThreadsCollection = db.collection("chat_threads")

    // Delete project
    const projectResult = await projectsCollection.deleteOne({ _id: new ObjectId(id) })

    if (projectResult.deletedCount === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Project not found",
        },
        { status: 404 },
      )
    }

    // Delete related data
    await Promise.all([
      testCasesCollection.deleteMany({ projectId: id }),
      chatMessagesCollection.deleteMany({ projectId: id }),
      chatThreadsCollection.deleteMany({ projectId: id }),
    ])

    return NextResponse.json(
      {
        success: true,
        message: "Project and related data deleted successfully",
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
