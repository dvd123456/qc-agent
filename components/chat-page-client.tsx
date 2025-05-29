"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, FileDown, Eye, FileText } from "lucide-react"
import { ChatInterface } from "@/components/chat-interface"
import { ProjectDetailsModal } from "@/components/project-details-modal"
import { TestCasePreviewModal } from "@/components/test-case-preview-modal"

interface ChatPageClientProps {
  projectId: string
}

export function ChatPageClient({ projectId }: ChatPageClientProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [projectName, setProjectName] = useState("")
  const [projectData, setProjectData] = useState(null)
  const router = useRouter()
  const [showProjectDetails, setShowProjectDetails] = useState(false)
  const [showTestCasePreview, setShowTestCasePreview] = useState(false)

  useEffect(() => {
    fetchProjectDetails()
  }, [projectId])

  const fetchProjectDetails = async () => {
    try {
      setIsLoading(true)
      // In a real app, this would be an API call
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Mock project data
      const mockProject = {
        id: projectId,
        name: `Project ${projectId}`,
        status: "active",
        priority: "high",
        metadata: {
          description: "This is a quality control project for testing purposes",
          startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        },
        testCase: {
          count: 12,
          passed: 8,
          failed: 2,
          pending: 2,
        },
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
      }

      setProjectName(mockProject.name)
      setProjectData(mockProject)
    } catch (error) {
      console.error("Failed to fetch project details:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBackToDashboard = () => {
    router.push("/dashboard")
  }

  const handleExportFile = () => {
    // This would be replaced with actual export functionality
    alert("Export file functionality would be implemented here")
  }

  const handlePreviewFile = () => {
    setShowTestCasePreview(true)
  }

  const handleViewProjectDetails = () => {
    setShowProjectDetails(true)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="text-lg text-muted-foreground">Loading project...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen">
      <header className="border-b border-primary/10 p-4 bg-gradient-card">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={handleBackToDashboard} className="hover:bg-primary/10">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <h1 className="text-xl font-bold text-gradient">{projectName}</h1>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleViewProjectDetails}
              className="border-primary/20 hover:bg-primary/5"
            >
              <FileText className="mr-2 h-4 w-4" />
              Project Details
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviewFile}
              className="border-secondary/20 hover:bg-secondary/5"
            >
              <Eye className="mr-2 h-4 w-4" />
              Preview Test Cases
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportFile}
              className="border-accent/20 hover:bg-accent/5"
            >
              <FileDown className="mr-2 h-4 w-4" />
              Export File
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-hidden">
        <ChatInterface projectId={projectId} />
      </div>

      {projectData && (
        <ProjectDetailsModal
          isOpen={showProjectDetails}
          onClose={() => setShowProjectDetails(false)}
          project={projectData}
        />
      )}

      <TestCasePreviewModal
        isOpen={showTestCasePreview}
        onClose={() => setShowTestCasePreview(false)}
        projectId={projectId}
      />
    </div>
  )
}
