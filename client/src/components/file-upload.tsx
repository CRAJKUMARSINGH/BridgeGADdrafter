import { useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Upload, File, X } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { UploadResponse } from "@/lib/types";

interface FileUploadProps {
  onUploadSuccess: (projectId: string, projectData: any) => void;
}

export function FileUpload({ onUploadSuccess }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const { toast } = useToast();

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.toLowerCase().endsWith('.txt')) {
        setUploadedFile(file);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload a .txt file",
          variant: "destructive",
        });
      }
    }
  }, [toast]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.name.toLowerCase().endsWith('.txt')) {
        setUploadedFile(file);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload a .txt file",
          variant: "destructive",
        });
      }
    }
  }, [toast]);

  const handleUpload = async () => {
    if (!uploadedFile) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('gadFile', uploadedFile);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data: UploadResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      if (data.success && data.project) {
        toast({
          title: "File uploaded successfully",
          description: "Bridge parameters parsed and ready for generation",
        });
        onUploadSuccess(data.project.id, data.project);
      }
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
  };

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Upload className="text-primary mr-2" size={20} />
            Upload GAD Input File
          </h2>
          <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium">
            Step 1
          </span>
        </div>

        {!uploadedFile ? (
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
              dragActive ? "border-primary bg-primary/5" : "border-gray-300 hover:border-primary"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => document.getElementById('file-input')?.click()}
          >
            <div className="space-y-4">
              <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                <File className="text-gray-400" size={24} />
              </div>
              <div>
                <p className="text-lg font-medium text-gray-900">Upload GAD.txt File</p>
                <p className="text-sm text-gray-500 mt-1">
                  Click to browse or drag and drop your bridge parameter file
                </p>
              </div>
              <p className="text-xs text-gray-400">Supported format: .txt (max 10MB)</p>
            </div>
            <input
              id="file-input"
              type="file"
              accept=".txt"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <File className="text-primary" size={20} />
                  <div>
                    <p className="font-medium text-gray-900">{uploadedFile.name}</p>
                    <p className="text-sm text-gray-500">
                      {(uploadedFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={removeFile}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={16} />
                </Button>
              </div>
            </div>

            <Button
              onClick={handleUpload}
              disabled={uploading}
              className="w-full bg-primary hover:bg-primary/90"
            >
              {uploading ? "Uploading..." : "Upload and Process File"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
