"use client"

import type React from "react"

import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Upload, File, X, CheckCircle } from "lucide-react"

interface FileUploaderProps {
  projectId: string
  onUploadComplete: () => void
}

interface UploadedFile {
  id: string
  name: string
  size: number
  progress: number
  status: "uploading" | "complete" | "error"
}

export function FileUploader({ projectId, onUploadComplete }: FileUploaderProps) {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const { toast } = useToast()

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files)
    }
  }

  const handleFiles = (fileList: FileList) => {
    const newFiles = Array.from(fileList).map((file) => ({
      id: Math.random().toString(36).substring(2, 9),
      name: file.name,
      size: file.size,
      progress: 0,
      status: "uploading" as const,
    }))

    setFiles((prev) => [...prev, ...newFiles])
    simulateUpload(newFiles)
  }

  const simulateUpload = (newFiles: UploadedFile[]) => {
    setIsUploading(true)

    newFiles.forEach((file) => {
      const interval = setInterval(() => {
        setFiles((prevFiles) => {
          const updatedFiles = prevFiles.map((f) => {
            if (f.id === file.id) {
              const newProgress = Math.min(f.progress + 10, 100)

              if (newProgress === 100) {
                clearInterval(interval)

                if (
                  prevFiles.every((file) => file.status === "complete" || (file.id === f.id && newProgress === 100))
                ) {
                  setTimeout(() => {
                    setIsUploading(false)
                    toast({
                      title: "Upload complete",
                      description: "All files have been uploaded successfully.",
                    })
                  }, 500)
                }

                return { ...f, progress: newProgress, status: "complete" as const }
              }

              return { ...f, progress: newProgress }
            }
            return f
          })

          return updatedFiles
        })
      }, 300)
    })
  }

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((file) => file.id !== id))

    if (files.length === 1) {
      setIsUploading(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const allUploaded = files.length > 0 && files.every((file) => file.status === "complete")

  return (
    <div className="space-y-6">
      <Card
        className={`border-2 border-dashed p-6 text-center glass-effect ${
          isDragging ? "border-primary bg-primary/5" : "border-gray-300"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <CardContent className="flex flex-col items-center justify-center py-10 space-y-4">
          <div className="rounded-full bg-primary/10 p-4">
            <Upload className="h-8 w-8 text-primary" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Drag and drop your files</h3>
            <p className="text-sm text-gray-500">or click to browse from your computer</p>
          </div>
          <label className="cursor-pointer">
            <Button variant="outline">Select Files</Button>
            <input type="file" multiple className="hidden" onChange={handleFileChange} />
          </label>
          <p className="text-xs text-muted-foreground">Mock upload - Files are simulated</p>
        </CardContent>
      </Card>

      {files.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Files</h3>
          <div className="space-y-3">
            {files.map((file) => (
              <div key={file.id} className="flex items-center justify-between rounded-lg border p-3 glass-effect">
                <div className="flex items-center space-x-3">
                  <File className="h-6 w-6 text-gray-500" />
                  <div>
                    <p className="font-medium">{file.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {file.status === "uploading" ? (
                    <div className="w-24">
                      <Progress value={file.progress} className="h-2" />
                    </div>
                  ) : file.status === "complete" ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <span className="text-xs text-red-500">Error</span>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(file.id)}
                    disabled={isUploading && file.status !== "complete"}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end">
            <Button onClick={onUploadComplete} disabled={!allUploaded} className="btn-gradient text-white">
              Continue to Chat
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
