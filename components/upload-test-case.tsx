import * as React from "react";
import { Button } from "@/components/ui/button";
import { UploadCloud } from "lucide-react";

interface UploadTestCaseProps {
  projectId?: string;
  onUploaded: () => void;
}

export function UploadTestCase({ projectId, onUploaded }: UploadTestCaseProps) {
  const [files, setFiles] = React.useState<File[]>([]);
  const [isUploading, setIsUploading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [showPopup, setShowPopup] = React.useState(false);
  const [progress, setProgress] = React.useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(Array.from(e.target.files));
      setError(null);
    }
  };

  // Hàm kiểm tra project đã có testCase chưa
  const checkProjectHasTestCase = async (projectId: string) => {
    try {
      const res = await fetch(`/api/projects/${projectId}`);
      const data = await res.json();
      return (
        Array.isArray(data?.data?.testCase) && data.data.testCase.length > 0
      );
    } catch {
      return false;
    }
  };

  const handleUpload = async () => {
    if (!files.length || !projectId) {
      setError("Please select at least one file and ensure project is valid.");
      return;
    }
    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));

      setShowPopup(true);
      setProgress(10);

      // Upload file
      const res = await fetch(`/api/projects/${projectId}/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        setFiles([]);
        let percent = 20;
        setProgress(percent);

        // Progress interval: tăng đều mỗi 200ms
        let running = true;
        const progressInterval = setInterval(() => {
          percent = Math.min(percent + 1, 95);
          setProgress(percent);
          if (!running || percent >= 95) clearInterval(progressInterval);
        }, 200);

        // API check interval: 5s/lần
        const checkInterval = setInterval(async () => {
          const hasTestCase = await checkProjectHasTestCase(projectId);
          if (hasTestCase) {
            running = false;
            setProgress(100);
            clearInterval(progressInterval);
            clearInterval(checkInterval);
            setTimeout(() => {
              setShowPopup(false);
              setIsUploading(false);
              onUploaded();
            }, 800);
          }
        }, 5000);
      } else {
        setError(data.message || "Upload failed");
        setShowPopup(false);
        setIsUploading(false);
      }
    } catch (err) {
      setError("Upload failed. Please try again.");
      setShowPopup(false);
      setIsUploading(false);
    }
  };

  return (
    <>
      {/* Popup loading */}
      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg p-8 flex flex-col items-center min-w-[320px]">
            <div className="mb-4 text-lg font-semibold text-primary">
              File đang được upload lên, vui lòng đợi...
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
              <div
                className="bg-primary h-3 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="text-sm text-muted-foreground">{progress}%</div>
          </div>
        </div>
      )}

      <div className="flex flex-col items-center justify-center gap-4 p-6 border rounded-lg bg-muted w-full max-w-md mx-auto">
        <UploadCloud className="w-10 h-10 text-primary mb-2" />
        <div className="text-lg font-semibold mb-2">
          Upload Test Case File(s)
        </div>
        <input
          type="file"
          accept=".csv,.xlsx,.xls,.json"
          multiple
          onChange={handleFileChange}
          className="mb-2"
          disabled={isUploading}
        />
        {files.length > 0 && (
          <div className="text-sm text-muted-foreground mb-2">
            Selected: {files.map((f) => f.name).join(", ")}
          </div>
        )}
        {error && <div className="text-sm text-red-500 mb-2">{error}</div>}
        <Button
          onClick={handleUpload}
          disabled={files.length === 0 || isUploading}
          className="w-full flex items-center justify-center"
        >
          {isUploading && (
            <span className="animate-spin mr-2 h-4 w-4 border-2 border-t-transparent border-primary rounded-full" />
          )}
          {isUploading ? "Uploading..." : "Upload"}
        </Button>
      </div>
    </>
  );
}
