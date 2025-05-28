"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Project } from "@/types/project"
import { formatDate } from "@/lib/utils"
import { Progress } from "@/components/ui/progress"
import { Calendar, FileText, TrendingUp, Trash2 } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"

interface ProjectListProps {
  projects: Project[]
  onProjectDeleted?: (projectId: string) => void
}

export function ProjectList({ projects, onProjectDeleted }: ProjectListProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [deletingProjects, setDeletingProjects] = useState<Set<string>>(new Set())

  const calculateProgress = (startDate: string, endDate: string): number => {
    const start = new Date(startDate).getTime()
    const end = new Date(endDate).getTime()
    const current = new Date().getTime()

    if (current < start) return 0
    if (current > end) return 100

    const totalDuration = end - start
    const elapsed = current - start
    return Math.round((elapsed / totalDuration) * 100)
  }

  const getStatusColor = (progress: number) => {
    if (progress === 100) return "bg-accent text-accent-foreground"
    if (progress >= 70) return "bg-secondary text-secondary-foreground"
    if (progress >= 30) return "bg-warning text-white"
    return "bg-primary text-primary-foreground"
  }

  const getStatusText = (progress: number) => {
    if (progress === 100) return "Completed"
    if (progress >= 70) return "Near Completion"
    if (progress >= 30) return "In Progress"
    return "Getting Started"
  }

  const handleOpenProject = (projectId: string) => {
    router.push(`/projects/${projectId}/chat`)
  }

  const handleDeleteProject = async (projectId: string, projectName: string) => {
    if (!confirm(`Are you sure you want to delete "${projectName}"? This action cannot be undone.`)) {
      return
    }

    setDeletingProjects((prev) => new Set([...prev, projectId]))

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.message || "Failed to delete project")
      }

      toast({
        title: "Project deleted",
        description: `"${projectName}" has been deleted successfully.`,
      })

      onProjectDeleted?.(projectId)
    } catch (error) {
      console.error("Delete project error:", error)
      toast({
        title: "Failed to delete project",
        description: error instanceof Error ? error.message : "An error occurred while deleting the project.",
        variant: "destructive",
      })
    } finally {
      setDeletingProjects((prev) => {
        const newSet = new Set(prev)
        newSet.delete(projectId)
        return newSet
      })
    }
  }

  if (projects.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="glass-effect rounded-2xl p-8 max-w-md mx-auto">
          <FileText className="h-16 w-16 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gradient mb-2">No projects found</h2>
          <p className="text-muted-foreground">Create your first quality control project to get started</p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => {
        const progress = calculateProgress(project.startDate, project.endDate)
        const isDeleting = deletingProjects.has(project.id!)
        return (
          <Card
            key={project.id}
            className="glass-effect hover:shadow-card-hover transition-all duration-300 group flex flex-col h-full"
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg group-hover:text-primary transition-colors">{project.name}</CardTitle>
                  <CardDescription className="flex items-center mt-1">
                    <Calendar className="h-3 w-3 mr-1" />
                    Created {formatDate(project.createdAt)}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(progress)}>{getStatusText(progress)}</Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteProject(project.id!, project.name)}
                    disabled={isDeleting}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    {isDeleting ? (
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-500"></div>
                    ) : (
                      <Trash2 className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4 flex-grow">
              <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-3 w-3 text-primary" />
                  <div>
                    <p className="font-medium">Start</p>
                    <p className="text-muted-foreground">{formatDate(project.startDate)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-3 w-3 text-secondary" />
                  <div>
                    <p className="font-medium">End</p>
                    <p className="text-muted-foreground">{formatDate(project.endDate)}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1 text-primary" />
                    Progress
                  </span>
                  <span className="font-semibold text-primary">{progress}%</span>
                </div>
                <div className="relative">
                  <Progress value={progress} className="h-2" />
                  <div
                    className="absolute top-0 left-0 h-2 rounded-full progress-gradient transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </CardContent>

            <CardFooter className="pt-3 mt-auto">
              <Button
                className="w-full btn-gradient text-white font-medium"
                onClick={() => handleOpenProject(project.id!)}
                disabled={isDeleting}
              >
                Open Project
              </Button>
            </CardFooter>
          </Card>
        )
      })}
    </div>
  )
}
