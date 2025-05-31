"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FileText, Download, Eye } from "lucide-react";
import type { TestCase } from "@/types/project";

interface TestCasePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
}

export function TestCasePreviewModal({
  isOpen,
  onClose,
  projectId,
}: TestCasePreviewModalProps) {
  const [selectedTestCase, setSelectedTestCase] = useState<TestCase | null>(
    null
  );
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadTestCases();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, projectId]);

  const loadTestCases = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch project data to get test cases
      const response = await fetch(`/api/projects/${projectId}`);
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to load project");
      }

      // Extract test cases from project data
      setTestCases(data.data.testCase || []);
    } catch (error) {
      console.error("Failed to load test cases:", error);
      setError(
        error instanceof Error ? error.message : "Failed to load test cases"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-800";
      case "Medium":
        return "bg-yellow-100 text-yellow-800";
      case "Low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <div>
            <DialogTitle className="text-2xl font-bold text-primary flex items-center">
              <FileText className="mr-2 h-6 w-6" />
              Test Cases Preview - Project {projectId}
            </DialogTitle>
            <DialogDescription>Quality control test cases</DialogDescription>
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2 text-muted-foreground">
              Loading test cases...
            </span>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600 font-medium">{error}</p>
            <Button variant="outline" onClick={loadTestCases} className="mt-4">
              Retry
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Total Tests</p>
                      <p className="text-2xl font-bold">{testCases.length}</p>
                    </div>
                    <FileText className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Test Cases Table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Test Cases</span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      Export
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {testCases.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      No test cases found for this project.
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Test Case ID</TableHead>
                        <TableHead>Module</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {testCases.map((testCase) => (
                        <TableRow
                          key={testCase.testCaseId}
                          className="hover:bg-muted/50"
                        >
                          <TableCell className="font-medium">
                            {testCase.testCaseId}
                          </TableCell>
                          <TableCell>{testCase.module}</TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{testCase.title}</p>
                              <p className="text-sm text-muted-foreground">
                                {testCase.preconditions && (
                                  <>Preconditions: {testCase.preconditions}</>
                                )}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={getPriorityColor(testCase.priority)}
                            >
                              {testCase.priority}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedTestCase(testCase)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            {/* Test Case Details Modal */}
            {selectedTestCase && (
              <Dialog
                open={!!selectedTestCase}
                onOpenChange={() => setSelectedTestCase(null)}
              >
                <DialogContent className="max-w-4xl">
                  <DialogHeader>
                    <DialogTitle className="flex items-center">
                      {selectedTestCase.testCaseId} - {selectedTestCase.title}
                    </DialogTitle>
                    <DialogDescription>
                      Module: {selectedTestCase.module}
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2">Test Information</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Test Case ID:</span>
                            <span className="font-medium">
                              {selectedTestCase.testCaseId}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Module:</span>
                            <span>{selectedTestCase.module}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Priority:</span>
                            <Badge
                              className={getPriorityColor(
                                selectedTestCase.priority
                              )}
                            >
                              {selectedTestCase.priority}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span>Remarks:</span>
                            <span>{selectedTestCase.remarks}</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Preconditions</h4>
                        <p className="text-sm bg-gray-50 p-3 rounded border">
                          {selectedTestCase.preconditions}
                        </p>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Test Steps</h4>
                      <ol className="list-decimal list-inside space-y-1 text-sm">
                        {selectedTestCase.testSteps.map((step, idx) => (
                          <li key={idx}>{step}</li>
                        ))}
                      </ol>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2">Expected Result</h4>
                        <p className="text-sm bg-green-50 p-3 rounded border">
                          {selectedTestCase.expectedResult}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Actual Result</h4>
                        <p className="text-sm bg-yellow-50 p-3 rounded border">
                          {selectedTestCase.actualResult}
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => setSelectedTestCase(null)}
                      >
                        Close
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
