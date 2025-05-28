"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { FileUploader } from "@/components/file-uploader"
import { Button } from "@/components/ui/button"
import { ArrowLeft, MessageSquare } from "lucide-react"

interface UploadPageProps {
  params: {
    id: string
  }
}

export default function UploadPage({ params }: UploadPageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [projectName, setProjectName] = useState("")
  const router = useRouter()
  const { id: projectId } = params

  useEffect(() => {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem("isLoggedIn")
    if (!isLoggedIn) {
      router.push("/")
      return
    }

    // Fetch project details
    const fetchProjectDetails = async () => {
      try {
        // This would be replaced with actual API call
        await new Promise((resolve) => setTimeout(resolve, 500))

        // Mock project data
        setProjectName("Project " + projectId)
      } catch (error) {
        console.error("Failed to fetch project details:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProjectDetails()
  }, [projectId, router])

  const handleFilesUploaded = () => {
    router.push(`/projects/${projectId}/chat`)
  }

  const handleBackToDashboard = () => {
    router.push("/dashboard")
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Button variant="ghost" onClick={handleBackToDashboard} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold">{projectName}</h1>
          <p className="text-gray-600 mt-1">Upload files for your project</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto">
        <FileUploader projectId={projectId} onUploadComplete={handleFilesUploaded} />

        <div className="mt-8 text-center">
          <p className="text-gray-500 mb-4">Already uploaded your files?</p>
          <Button variant="outline" onClick={handleFilesUploaded}>
            <MessageSquare className="mr-2 h-4 w-4" />
            Go to Chat
          </Button>
        </div>
      </div>
    </div>
  )
}
