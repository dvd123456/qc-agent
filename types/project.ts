export interface Project {
  id?: string
  name: string
  description: string
  startDate: string
  endDate: string
  createdAt: string
  updatedAt?: string
  status?: "active" | "completed" | "pending"
  priority?: "high" | "medium" | "low"
  progress?: number
  filesUploaded?: number
  totalFiles?: number
  team?: string[]
  userId?: string
}
