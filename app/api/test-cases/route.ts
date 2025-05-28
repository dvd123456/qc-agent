import { NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { TestCase, CreateTestCaseInput } from "@/lib/models/test-case"
import { ObjectId } from "mongodb"

// GET - Fetch test cases for a project
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get("projectId")

    if (!projectId) {
      return NextResponse.json(
        {
          success: false,
          message: "Project ID is required",
        },
        { status: 400 },
      )
    }

    const db = await getDatabase()
    const testCasesCollection = db.collection<TestCase>("test_cases")

    // Get test cases for this project
    const testCases = await testCasesCollection.find({ projectId }).sort({ lastRun: -1 }).toArray()

    // Transform _id to id for frontend compatibility
    const transformedTestCases = testCases.map((testCase) => ({
      ...testCase,
      id: testCase._id?.toString(),
      _id: undefined,
    }))

    return NextResponse.json(
      {
        success: true,
        data: transformedTestCases,
        count: transformedTestCases.length,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Get Test Cases Error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch test cases",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

// POST - Create new test case
export async function POST(request: NextRequest) {
  try {
    const body: CreateTestCaseInput = await request.json()
    const { projectId, testName, description, category, expectedResult, steps } = body

    // Validate required fields
    if (!projectId || !testName || !category || !expectedResult || !steps || steps.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Project ID, test name, category, expected result, and steps are required",
        },
        { status: 400 },
      )
    }

    const db = await getDatabase()
    const testCasesCollection = db.collection<TestCase>("test_cases")

    // Create new test case
    const newTestCase: Omit<TestCase, "_id"> = {
      projectId,
      testName,
      description: description || "",
      status: body.status || "pending",
      priority: body.priority || "medium",
      category,
      executionTime: "N/A",
      lastRun: "Not executed",
      expectedResult,
      actualResult: body.actualResult || "Test not yet executed",
      steps,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const result = await testCasesCollection.insertOne(newTestCase)

    const createdTestCase = {
      ...newTestCase,
      id: result.insertedId.toString(),
    }

    return NextResponse.json(
      {
        success: true,
        message: "Test case created successfully",
        data: createdTestCase,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Create Test Case Error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create test case",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
