// API utility functions for making requests to our Next.js API routes

interface ApiResponse<T> {
  success: boolean
  message: string
  data?: T
}

class ApiClient {
  private token: string | null = null

  constructor() {
    this.token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null
  }

  private getBaseUrl(): string {
    // Use environment variable if set, otherwise determine based on environment
    if (process.env.NEXT_PUBLIC_API_URL) {
      return process.env.NEXT_PUBLIC_API_URL
    }

    // Fallback for local development
    if (typeof window !== "undefined") {
      // Client-side: use current origin
      return window.location.origin
    }

    // Server-side fallback
    return process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const baseUrl = this.getBaseUrl()
    const url = `${baseUrl}/api${endpoint}`

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    }

    // Remove Content-Type for FormData
    if (options.body instanceof FormData) {
      delete (config.headers as any)["Content-Type"]
    }

    try {
      console.log(`Making API request to: ${url}`)

      const response = await fetch(url, config)

      // Check if response is HTML (404 page) instead of JSON
      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        console.error(`Invalid content type: ${contentType} for URL: ${url}`)
        throw new Error(`API endpoint not found: ${url}`)
      }

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`)
      }

      console.log(`API response from ${url}:`, data)
      return data
    } catch (error) {
      console.error("API Error:", error)
      throw error
    }
  }

  // Authentication
  async login(email: string, password: string) {
    const response = await this.request<{ user: any; token: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })

    if (response.success && response.data?.token) {
      this.token = response.data.token
      if (typeof window !== "undefined") {
        localStorage.setItem("auth_token", response.data.token)
        localStorage.setItem("user", JSON.stringify(response.data.user))
      }
    }

    return response
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

  // Chat
  async sendMessage(message: string, projectId: string, conversationId?: string) {
    return this.request<any>("/chat", {
      method: "POST",
      body: JSON.stringify({ message, projectId, conversationId }),
    })
  }

  // Analytics
  async getAnalytics(projectId?: string) {
    const params = projectId ? `?projectId=${projectId}` : ""
    return this.request<any>(`/analytics${params}`)
  }

  // Logout
  logout() {
    this.token = null
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token")
      localStorage.removeItem("user")
    }
  }

  // Get current API base URL (for debugging)
  getApiBaseUrl(): string {
    return this.getBaseUrl()
  }
}

export const apiClient = new ApiClient()
