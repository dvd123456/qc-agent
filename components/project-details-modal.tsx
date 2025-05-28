"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Clock, FileText, Users, Target, Activity, X } from "lucide-react"

interface ProjectDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  projectId: string
  projectName: string
}

interface ProjectDetails {
  id: string
  name: string
  metadata: {
    description: string
    startDate: string
    endDate: string
  }
  status: "active" | "completed" | "pending"
  progress: number
  filesUploaded: number
  totalFiles: number
  createdAt: string
  updatedAt: string
  team: string[]
  priority: "high" | "medium" | "low"
  testCase: {
    hasTestCases: boolean
    count: number
  }
}

export function ProjectDetailsModal({ isOpen, onClose, projectId, projectName }: ProjectDetailsModalProps) {
  const [projectDetails, setProjectDetails] = useState<ProjectDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (isOpen) {
      fetchProjectDetails()
    }
  }, [isOpen, projectId])

  const fetchProjectDetails = async () => {
    setIsLoading(true)

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.message || "Failed to fetch project details")
      }

      setProjectDetails(data.data)
    } catch (error) {
      console.error("Failed to fetch project details:", error)
      // Fallback to mock data if API fails
      const mockDetails: ProjectDetails = {
        id: projectId,
        name: projectName,
        metadata: {
          description:
            "This is a comprehensive quality control project focused on ensuring high standards across all deliverables. The project includes automated testing, manual review processes, and continuous monitoring.",
          startDate: "2024-01-15",
          endDate: "2024-03-30",
        },
        status: "active",
        progress: 65,
        filesUploaded: 8,
        totalFiles: 12,
        createdAt: "2024-01-10T10:00:00Z",
        updatedAt: "2024-01-28T15:30:00Z",
        team: ["John Doe", "Jane Smith", "Mike Johnson", "Sarah Wilson"],
        priority: "high",
        testCase: {
          hasTestCases: true,
          count: 12,
        },
      }

      setProjectDetails(mockDetails)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-accent text-accent-foreground"
      case "completed":
        return "bg-primary text-primary-foreground"
      case "pending":
        return "bg-secondary text-secondary-foreground"
      default:
        return "bg-secondary text-secondary-foreground"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <div>
            <DialogTitle className="text-2xl font-bold text-primary">Project Details</DialogTitle>
            <DialogDescription>Comprehensive overview of your project</DialogDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2 text-muted-foreground">Loading project details...</span>
          </div>
        ) : projectDetails ? (
          <div className="space-y-6">
            {/* Project Header */}
            <Card className="glass-effect">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">{projectDetails.name}</CardTitle>
                  <div className="flex gap-2">
                    <Badge className={getStatusColor(projectDetails.status)}>
                      {projectDetails.status.charAt(0).toUpperCase() + projectDetails.status.slice(1)}
                    </Badge>
                    <Badge className={getPriorityColor(projectDetails.priority)}>
                      {projectDetails.priority.charAt(0).toUpperCase() + projectDetails.priority.slice(1)} Priority
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{projectDetails.metadata.description}</p>
              </CardContent>
            </Card>

            {/* Project Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium">Start Date</p>
                      <p className="text-xs text-muted-foreground">{formatDate(projectDetails.metadata.startDate)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Target className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium">End Date</p>
                      <p className="text-xs text-muted-foreground">{formatDate(projectDetails.metadata.endDate)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium">Files</p>
                      <p className="text-xs text-muted-foreground">
                        {projectDetails.filesUploaded} / {projectDetails.totalFiles}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Activity className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium">Progress</p>
                      <p className="text-xs text-muted-foreground">{projectDetails.progress}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Progress Bar */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Project Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="w-full bg-secondary rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-primary to-accent h-3 rounded-full transition-all duration-300"
                    style={{ width: `${projectDetails.progress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-muted-foreground mt-2">{projectDetails.progress}% completed</p>
              </CardContent>
            </Card>

            {/* Team Members */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Users className="mr-2 h-5 w-5" />
                  Team Members
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {projectDetails.team.map((member, index) => (
                    <Badge key={index} variant="outline" className="px-3 py-1">
                      {member}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Clock className="mr-2 h-5 w-5" />
                  Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Created</span>
                  <span className="text-sm text-muted-foreground">{formatDate(projectDetails.createdAt)}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Last Modified</span>
                  <span className="text-sm text-muted-foreground">{formatDate(projectDetails.updatedAt)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              <Button className="btn-gradient text-white">Edit Project</Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Failed to load project details</p>
            <Button variant="outline" onClick={fetchProjectDetails} className="mt-4">
              Retry
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
