"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileDown, Eye, FileText } from "lucide-react";
import { ChatInterface } from "@/components/chat-interface";
import { ProjectDetailsModal } from "@/components/project-details-modal";
import { TestCasePreviewModal } from "@/components/test-case-preview-modal";
import { ProjectDocument } from "@/models/project";

interface ChatPageClientProps {
  projectId: string;
}

export function ChatPageClient({ projectId }: ChatPageClientProps) {
  const [reload, setReload] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [projectData, setProjectData] = useState<ProjectDocument>();
  const router = useRouter();
  const [showProjectDetails, setShowProjectDetails] = useState(false);
  const [showTestCasePreview, setShowTestCasePreview] = useState(false);

  useEffect(() => {
    if (reload === true) {
      fetchProjectDetails();
      setReload(false);
    }
  }, [projectId, reload]);

  const fetchProjectDetails = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/projects/${projectId}`);
      const data = await res.json();
      if (data.success && data.data) {
        setProjectData(data.data);
      } else {
        setProjectData(undefined);
      }
    } catch (error) {
      console.error("Failed to fetch project details:", error);
      setProjectData(undefined);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToDashboard = () => {
    router.push("/dashboard");
  };

  const handleExportFile = async () => {
    try {
      const res = await fetch(`/api/projects/export?projectId=${projectId}`);
      if (!res.ok) {
        throw new Error("Export failed");
      }
      const blob = await res.blob();
      // Lấy tên file từ header nếu có
      const disposition = res.headers.get("Content-Disposition");
      let fileName = "test-cases.json";
      if (disposition) {
        const match = disposition.match(/filename="(.+)"/);
        if (match) fileName = match[1];
      }
      // Tạo link download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert("Export failed!");
    }
  };

  const handlePreviewFile = () => {
    setShowTestCasePreview(true);
  };

  const handleViewProjectDetails = () => {
    setShowProjectDetails(true);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="text-lg text-muted-foreground">
            Loading project...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <header className="border-b border-primary/10 p-4 bg-gradient-card">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4 min-w-0">
            <Button size="sm" onClick={handleBackToDashboard}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <h1 className="text-xl font-bold text-gradient truncate max-w-xs block">
              {projectData?.name}
            </h1>
          </div>
          <div className="flex space-x-2">
            <Button size="sm" onClick={handleViewProjectDetails}>
              <FileText className="mr-2 h-4 w-4" />
              Project Details
            </Button>
            <Button size="sm" onClick={handlePreviewFile}>
              <Eye className="mr-2 h-4 w-4" />
              Preview Test Cases
            </Button>
            <Button size="sm" onClick={handleExportFile}>
              <FileDown className="mr-2 h-4 w-4" />
              Export File
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-hidden">
        <ChatInterface project={projectData} reload={() => setReload(true)} />
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
  );
}
