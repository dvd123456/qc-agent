export interface Project {
  id?: string
  name: string
  metadata: {
    description: string
    startDate: string
    endDate: string
  }
  testCase: TestCase[] // Array of test cases instead of any
  createdAt: string
  updatedAt: string
  status: "active" | "completed" | "pending"
  priority: "high" | "medium" | "low"
  userId?: string
}

export interface TestCase {
  id: string
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
}

export interface CreateProjectInput {
  name: string
  description: string
  startDate: string
  endDate: string
}

export interface UpdateProjectInput {
  name?: string
  description?: string
  startDate?: string
  endDate?: string
  status?: "active" | "completed" | "pending"
  priority?: "high" | "medium" | "low"
  testCase?: TestCase[]
}
