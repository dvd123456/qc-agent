import { getDatabase } from "@/lib/mongodb"
import { TestCase } from "@/lib/models/test-case"

export async function seedTestCasesForProject(projectId: string): Promise<void> {
  const db = await getDatabase()
  const testCasesCollection = db.collection<TestCase>("test_cases")

  // Check if test cases already exist for this project
  const existingCount = await testCasesCollection.countDocuments({ projectId })
  if (existingCount > 0) {
    return // Test cases already exist
  }

  // Mock test cases to seed for new projects
  const mockTestCases: Omit<TestCase, "_id">[] = [
    {
      projectId,
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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      projectId,
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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      projectId,
      testName: "Data Validation Rules",
      description: "Verify form validation for required fields",
      status: "warning",
      priority: "medium",
      category: "Data Validation",
      executionTime: "1.8s",
      lastRun: new Date().toISOString(),
      expectedResult: "Validation errors displayed for empty required fields",
      actualResult: "Some validation messages are not user-friendly",
      steps: [
        "Open project creation form",
        "Leave required fields empty",
        "Submit form",
        "Check validation messages",
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      projectId,
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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      projectId,
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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      projectId,
      testName: "Database Connection",
      description: "Verify database connectivity and queries",
      status: "passed",
      priority: "high",
      category: "Database",
      executionTime: "3.2s",
      lastRun: new Date().toISOString(),
      expectedResult: "Database queries execute successfully",
      actualResult: "All database operations completed successfully",
      steps: [
        "Establish database connection",
        "Execute SELECT queries",
        "Test INSERT operations",
        "Verify data consistency",
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      projectId,
      testName: "Security Headers",
      description: "Check security headers in HTTP responses",
      status: "failed",
      priority: "high",
      category: "Security",
      executionTime: "1.1s",
      lastRun: new Date().toISOString(),
      expectedResult: "All security headers present and configured correctly",
      actualResult: "Missing Content-Security-Policy header",
      steps: [
        "Send HTTP request to application",
        "Inspect response headers",
        "Verify security headers",
        "Check header values",
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      projectId,
      testName: "Error Handling",
      description: "Test application behavior with invalid inputs",
      status: "warning",
      priority: "medium",
      category: "Error Handling",
      executionTime: "2.5s",
      lastRun: new Date().toISOString(),
      expectedResult: "Graceful error handling with user-friendly messages",
      actualResult: "Some errors show technical details to users",
      steps: [
        "Submit form with invalid data",
        "Test API with malformed requests",
        "Verify error messages",
        "Check error logging",
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]

  // Insert mock test cases
  await testCasesCollection.insertMany(mockTestCases)
}
