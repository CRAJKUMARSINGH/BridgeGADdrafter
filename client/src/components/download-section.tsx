import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileCode, FileText, Code } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DownloadSectionProps {
  projectId: string | null;
  status: 'uploaded' | 'processing' | 'completed' | 'error';
}

export function DownloadSection({ projectId, status }: DownloadSectionProps) {
  const { toast } = useToast();

  const handleDownload = async (type: 'dwg' | 'pdf' | 'lisp') => {
    if (!projectId) {
      toast({
        title: "No project selected",
        description: "Please upload and generate a project first",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(`/api/projects/${projectId}/download/${type}`);
      
      if (!response.ok) {
        throw new Error('Download failed');
      }

      // Get filename from Content-Disposition header or use default
      const contentDisposition = response.headers.get('Content-Disposition');
      const filename = contentDisposition?.match(/filename="(.+)"/)?.[1] || `bridge_${projectId}.${type}`;

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Download started",
        description: `${type.toUpperCase()} file download initiated`,
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    }
  };

  const isDownloadDisabled = status !== 'completed';

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Download className="text-primary mr-2" size={20} />
          Download Files
        </h3>
        
        <div className="space-y-3">
          <Button
            variant="outline"
            className="w-full justify-between"
            onClick={() => handleDownload('dwg')}
            disabled={isDownloadDisabled}
          >
            <div className="flex items-center space-x-3">
              <FileCode className="text-primary" size={16} />
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900">AutoCAD DWG</p>
                <p className="text-xs text-gray-500">For PC AutoCAD usage</p>
              </div>
            </div>
            <Download className="text-gray-400" size={16} />
          </Button>
          
          <Button
            variant="outline"
            className="w-full justify-between"
            onClick={() => handleDownload('pdf')}
            disabled={isDownloadDisabled}
          >
            <div className="flex items-center space-x-3">
              <FileText className="text-red-500" size={16} />
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900">PDF Drawing</p>
                <p className="text-xs text-gray-500">For web viewing (A4 landscape)</p>
              </div>
            </div>
            <Download className="text-gray-400" size={16} />
          </Button>
          
          <Button
            variant="outline"
            className="w-full justify-between"
            onClick={() => handleDownload('lisp')}
            disabled={isDownloadDisabled}
          >
            <div className="flex items-center space-x-3">
              <Code className="text-blue-500" size={16} />
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900">Updated LISP Code</p>
                <p className="text-xs text-gray-500">Corrected deficiencies</p>
              </div>
            </div>
            <Download className="text-gray-400" size={16} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
