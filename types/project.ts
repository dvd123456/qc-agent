export interface Project {
  id?: string
  name: string
  metadata: {
    description: string
    startDate: string
    endDate: string
  }
  testCase: any // Will reference test cases collection
  createdAt: string
  updatedAt: string
  status: "active" | "completed" | "pending"
  priority: "high" | "medium" | "low"
  userId?: string
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
  testCase?: any
}
