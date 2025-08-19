import React, { useCallback, useState } from "react";
import { cn } from "@/lib/utils";
import { Upload, File, X, AlertCircle } from "lucide-react";

interface FileUploadProps {
  onFileSelect: (content: string, filename: string) => void;
  accept?: string;
  maxSize?: number; // in bytes
  className?: string;
  disabled?: boolean;
}

export function FileUpload({
  onFileSelect,
  accept = ".txt",
  maxSize = 1024 * 1024, // 1MB default
  className,
  disabled = false
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = useCallback(async (files: FileList) => {
    const file = files[0];
    if (!file) return;

    setError(null);

    // Validate file type
    if (accept && !file.name.toLowerCase().endsWith(accept.replace(".", ""))) {
      setError(`Invalid file type. Expected ${accept} file.`);
      return;
    }

    // Validate file size
    if (file.size > maxSize) {
      setError(`File size exceeds ${(maxSize / 1024 / 1024).toFixed(1)}MB limit.`);
      return;
    }

    try {
      const content = await file.text();
      setSelectedFile(file);
      onFileSelect(content, file.name);
    } catch (err) {
      setError("Failed to read file content.");
    }
  }, [accept, maxSize, onFileSelect]);

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

    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  }, [disabled, handleFiles]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  }, [handleFiles]);

  const clearFile = useCallback(() => {
    setSelectedFile(null);
    setError(null);
  }, []);

  return (
    <div className={cn("w-full", className)}>
      <div
        className={cn(
          "relative border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer",
          dragActive ? "border-primary bg-primary/5" : "border-gray-300 hover:border-primary",
          disabled && "opacity-50 cursor-not-allowed",
          error && "border-destructive"
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !disabled && document.getElementById("file-input")?.click()}
        data-testid="file-upload-zone"
      >
        <input
          id="file-input"
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled}
          data-testid="file-input"
        />

        {selectedFile ? (
          <div className="flex items-center justify-center space-x-2">
            <File className="h-8 w-8 text-primary" />
            <div className="text-left">
              <p className="font-medium text-gray-900">{selectedFile.name}</p>
              <p className="text-sm text-gray-500">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                clearFile();
              }}
              className="ml-2 p-1 hover:bg-gray-100 rounded"
              data-testid="clear-file-button"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div>
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 mb-2">
              Drop your input file here or click to browse
            </p>
            <p className="text-sm text-gray-500">
              Supported: {accept} files (max {(maxSize / 1024 / 1024).toFixed(1)}MB)
            </p>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-2 flex items-center space-x-1 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          <span data-testid="file-upload-error">{error}</span>
        </div>
      )}

      {!error && selectedFile && (
        <div className="mt-4 p-3 bg-blue-50 rounded border-l-4 border-primary">
          <p className="text-sm text-blue-800 font-medium">Expected Format:</p>
          <p className="text-xs text-blue-600 mt-1 font-mono">
            scale1, scale2, skew, datum, toprl, left, right, xincr, yincr, noch, [chainages and levels...]
          </p>
        </div>
      )}
    </div>
  );
}
