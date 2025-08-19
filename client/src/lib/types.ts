export interface UploadResponse {
  success: boolean;
  project?: {
    id: string;
    fileName: string;
    fileSize: string;
    parameters: any;
  };
  error?: string;
}

export interface GenerationResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export interface ProjectStatus {
  id: string;
  fileName: string;
  fileSize: string;
  parameters: any;
  status: 'uploaded' | 'processing' | 'completed' | 'error';
  progress: string;
  dwgFilePath?: string | null;
  pdfFilePath?: string | null;
  lispFilePath?: string | null;
  errorMessage?: string | null;
  createdAt: string;
  updatedAt: string;
}
