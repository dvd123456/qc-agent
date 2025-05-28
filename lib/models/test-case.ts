import { ObjectId } from "mongodb"

export interface TestCase {
  _id?: ObjectId
  id?: string
  projectId: string
  testName: string
  description: string
  status: "passed" | "failed" | "pending" | "warning"
  priority: "high" | "medium" | "low"
  category: string
  executionTime: string
  lastRun: string
  expectedResult: string
  actualResult: string
  steps: string[]
  createdAt: string
  updatedAt: string
}

export interface CreateTestCaseInput {
  projectId: string
  testName: string
  description: string
  status?: "passed" | "failed" | "pending" | "warning"
  priority?: "high" | "medium" | "low"
  category: string
  expectedResult: string
  actualResult?: string
  steps: string[]
}

export interface UpdateTestCaseInput {
  testName?: string
  description?: string
  status?: "passed" | "failed" | "pending" | "warning"
  priority?: "high" | "medium" | "low"
  category?: string
  executionTime?: string
  lastRun?: string
  expectedResult?: string
  actualResult?: string
  steps?: string[]
}
