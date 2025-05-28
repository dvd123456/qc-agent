"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { PlusIcon } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ProjectForm } from "@/components/project-form"
import type { Project } from "@/types/project"

interface CreateProjectButtonProps {
  onProjectCreated?: (project: Project) => void
}

export function CreateProjectButton({ onProjectCreated }: CreateProjectButtonProps) {
  const [open, setOpen] = useState(false)

  const handleProjectCreated = (project: Project) => {
    setOpen(false)
    onProjectCreated?.(project)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusIcon className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>Fill in the details to create a new quality control project.</DialogDescription>
        </DialogHeader>
        <ProjectForm onSuccess={handleProjectCreated} />
      </DialogContent>
    </Dialog>
  )
}
