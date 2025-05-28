// API utility functions for making requests to our Next.js API routes

interface ApiResponse<T> {
  success: boolean
  message: string
  data?: T
}

class ApiClient {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `/api${endpoint}`

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    }

    // Remove Content-Type for FormData
    if (options.body instanceof FormData) {
      delete (config.headers as any)["Content-Type"]
    }

    try {
      const response = await fetch(url, config)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`)
      }

      return data
    } catch (error) {
      console.error("API Error:", error)
      throw error
    }
  }

  // Authentication
  async login(email: string, password: string) {
    // Mock login - just store in localStorage
    const mockUser = {
      id: "user_123",
      email: email,
      name: "Demo User",
      token: "mock_token_" + Date.now(),
    }

    if (typeof window !== "undefined") {
      localStorage.setItem("isLoggedIn", "true")
      localStorage.setItem("user", JSON.stringify(mockUser))
    }

    return {
      success: true,
      message: "Login successful",
      data: { user: mockUser, token: mockUser.token },
    }
  }

  // Projects
  async getProjects() {
    return this.request<any[]>("/projects")
  }

  async createProject(projectData: any) {
    return this.request<any>("/projects", {
      method: "POST",
      body: JSON.stringify(projectData),
    })
  }

  async getProject(id: string) {
    return this.request<any>(`/projects/${id}`)
  }

  async uploadFiles(projectId: string, files: File[]) {
    const formData = new FormData()
    files.forEach((file) => formData.append("files", file))

    return this.request<any>(`/projects/${projectId}/upload`, {
      method: "POST",
      body: formData,
    })
  }

  // Chat - Mock implementation
  async sendMessage(message: string, projectId: string, conversationId?: string) {
    // Mock chat response
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const mockResponse = {
      success: true,
      message: `Thank you for your question about "${message}". This is a mock response for project ${projectId}. In a real implementation, this would connect to an AI service.`,
      suggestions: ["How can I improve test coverage?", "What are the best QC practices?"],
    }

    return mockResponse
  }

  // Analytics - Mock implementation
  async getAnalytics(projectId?: string) {
    // Mock analytics data
    await new Promise((resolve) => setTimeout(resolve, 500))

    return {
      success: true,
      data: {
        totalProjects: 3,
        activeProjects: 2,
        completedProjects: 1,
        testCases: {
          total: 40,
          passed: 28,
          failed: 8,
          pending: 4,
        },
      },
    }
  }

  // Logout
  logout() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("isLoggedIn")
      localStorage.removeItem("user")
    }
  }
}

export const apiClient = new ApiClient()
