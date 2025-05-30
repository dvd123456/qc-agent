"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ProjectList } from "@/components/project-list";
import { CreateProjectButton } from "@/components/create-project-button";
import type { Project } from "@/types/project";

export function DashboardClient() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log("Dashboard: Fetching projects...");

      const response = await fetch("/api/projects", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store", // Ensure fresh data
      });

      console.log("Dashboard: Response status:", response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Dashboard: Response data:", data);

      if (!data.success) {
        throw new Error(data.message || "Failed to fetch projects");
      }

      const projectsData = data.data || [];
      console.log("Dashboard: Setting projects:", projectsData);
      setProjects(projectsData);
    } catch (error) {
      console.error("Dashboard: Failed to fetch projects:", error);
      setError(
        error instanceof Error ? error.message : "Failed to load projects"
      );

      // Set empty array as fallback
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    console.log("Dashboard: Refreshing projects...");
    fetchProjects();
  };

  const handleProjectCreated = (newProject: Project) => {
    console.log("Dashboard: New project created:", newProject);
    setProjects((prev) => [newProject, ...prev]);
  };

  const handleProjectDeleted = (projectId: string) => {
    console.log("Dashboard: Deleting project:", projectId);
    setProjects((prev) => prev.filter((p) => p.id !== projectId));
  };

  return (
    <div className="container mx-auto py-8">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gradient mb-2">QC Agent AI</h1>
          <p className="text-muted-foreground text-lg">
            Manage and monitor your quality control projects
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            ✅ Demo Mode - Mock Data
          </p>
        </div>
        <div className="flex gap-4">
          <CreateProjectButton onProjectCreated={handleProjectCreated} />
        </div>
      </header>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 font-medium">Error loading projects</p>
          <p className="text-red-600 text-sm">{error}</p>
          <Button
            variant="outline"
            onClick={handleRefresh}
            className="mt-2"
            size="sm"
          >
            Try Again
          </Button>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="text-lg text-muted-foreground">
              Loading projects...
            </span>
          </div>
        </div>
      ) : (
        <div>
          <div className="mb-4 text-sm text-muted-foreground">
            Found {projects.length} project{projects.length !== 1 ? "s" : ""}
          </div>
          <ProjectList
            projects={projects}
            onProjectDeleted={handleProjectDeleted}
          />
        </div>
      )}
    </div>
  );
}
