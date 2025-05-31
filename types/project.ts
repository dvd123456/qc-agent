export interface Project {
  id?: string;
  name: string;
  metadata: {
    description: string;
    startDate: string;
    endDate: string;
  };
  testCase: TestCase[]; // Array of test cases instead of any
  createdAt: string;
  updatedAt: string;
  status: "active" | "completed" | "pending";
  priority: "high" | "medium" | "low";
  userId?: string;
}

export interface TestCase {
  testCaseId: string;
  module: string;
  title: string;
  preconditions: string;
  testSteps: string[];
  expectedResult: string;
  actualResult: string;
  priority: "High | Medium | Low";
  remarks: string;
}

export interface CreateProjectInput {
  name: string;
  summary: string;
  description: string;
  startDate: string;
  endDate: string;
}

export interface UpdateProjectInput {
  name?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  status?: "active" | "completed" | "pending";
  priority?: "high" | "medium" | "low";
  testCase?: TestCase[];
}
