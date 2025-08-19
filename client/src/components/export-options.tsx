import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { FileText, File, Code, Download, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { BridgeParameters } from "@/lib/bridge-calculations";

interface ExportOptionsProps {
  parameters: BridgeParameters | null;
  projectId?: string;
}

interface ExportSettings {
  paperSize: "A4" | "A3" | "A2";
  drawingScale: string;
  includeDimensions: boolean;
  includeTitleBlock: boolean;
  includeGrid: boolean;
}

export function ExportOptions({ parameters, projectId }: ExportOptionsProps) {
  const [exportSettings, setExportSettings] = useState<ExportSettings>({
    paperSize: "A4",
    drawingScale: parameters ? `1:${parameters.scale1}` : "1:100",
    includeDimensions: true,
    includeTitleBlock: true,
    includeGrid: false
  });
  const [isExporting, setIsExporting] = useState<Record<string, boolean>>({});
  const [lispCode, setLispCode] = useState<string>("");
  const [showLispCode, setShowLispCode] = useState(false);
  const { toast } = useToast();

  const handleExportDWG = async () => {
    if (!projectId) {
      toast({
        title: "Export Error",
        description: "No project selected for export.",
        variant: "destructive"
      });
      return;
    }

    setIsExporting(prev => ({ ...prev, dwg: true }));
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/bridge/export/dwg`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId,
          exportSettings: {
            paperSize: exportSettings.paperSize,
            drawingScale: exportSettings.drawingScale,
            includeDimensions: exportSettings.includeDimensions,
            includeTitleBlock: exportSettings.includeTitleBlock,
            includeGrid: exportSettings.includeGrid
          }
        }),
        credentials: 'include'
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Failed to generate DWG export');
      }

      // Get the filename from the Content-Disposition header or create one
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `bridge_export_${new Date().toISOString().split('T')[0]}.dwg`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }

      // Get the response as a blob and create a download link
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "DWG Export Complete",
        description: "The drawing has been exported as a DWG file."
      });
      
    } catch (error) {
      console.error('DWG export error:', error);
      toast({
        title: "Export Failed",
        description: error instanceof Error ? error.message : "Failed to generate DWG export. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsExporting(prev => ({ ...prev, dwg: false }));
    }
  };

  const handleExportPDF = async () => {
    if (!parameters) {
      toast({
        title: "Export Error",
        description: "No drawing data available for PDF export.",
        variant: "destructive"
      });
      return;
    }

    setIsExporting(prev => ({ ...prev, pdf: true }));
    
    try {
      // Find the canvas element - try different selectors to be safe
      let canvas = document.querySelector('.bridge-canvas') as HTMLCanvasElement || 
                  document.querySelector('canvas');
      
      if (!canvas) {
        // If canvas not found, try to find it in the DOM after a small delay
        await new Promise(resolve => setTimeout(resolve, 500));
        canvas = document.querySelector('.bridge-canvas') as HTMLCanvasElement || 
                document.querySelector('canvas');
      }

      if (!canvas) {
        throw new Error('Drawing canvas not found. Please ensure the drawing is loaded.');
      }
      
      // Create a temporary canvas to ensure we have enough resolution
      const tempCanvas = document.createElement('canvas');
      const ctx = tempCanvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Could not create canvas context');
      }
      
      // Set higher resolution for better quality
      const scale = 2; // Increase for better quality
      tempCanvas.width = canvas.width * scale;
      tempCanvas.height = canvas.height * scale;
      ctx.scale(scale, scale);
      
      // Draw the original canvas onto our high-res canvas
      ctx.drawImage(canvas, 0, 0);
      
      // Get the image data
      const imageData = tempCanvas.toDataURL('image/png', 1.0);
      
      // Create PDF with proper dimensions
      const { jsPDF } = await import('jspdf');
      const pdf = new jsPDF({
        orientation: exportSettings.paperSize === 'A4' ? 'portrait' : 'landscape',
        unit: 'mm',
        format: exportSettings.paperSize.toLowerCase()
      });

      // Calculate dimensions
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const ratio = tempCanvas.width / tempCanvas.height;
      
      let imgWidth = pageWidth - 20; // 10mm margin on each side
      let imgHeight = imgWidth / ratio;
      
      // Adjust height if image is too tall
      if (imgHeight > pageHeight - 20) {
        imgHeight = pageHeight - 20;
        imgWidth = imgHeight * ratio;
      }
      
      // Center the image on the page
      const x = (pageWidth - imgWidth) / 2;
      const y = (pageHeight - imgHeight) / 2;
      
      // Add the image to the PDF
      pdf.addImage(imageData, 'PNG', x, y, imgWidth, imgHeight);
      
      // Add title block if enabled
      if (exportSettings.includeTitleBlock) {
        pdf.setFontSize(12);
        pdf.text(`Bridge GAD Drawing - Scale: ${exportSettings.drawingScale}`, 14, 20);
        pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 28);
      }
      
      // Save the PDF
      pdf.save(`bridge_drawing_${new Date().toISOString().split('T')[0]}.pdf`);
      
      toast({
        title: "PDF Export Complete",
        description: "The drawing has been exported as a PDF file."
      });
      
    } catch (error) {
      console.error('PDF export error:', error);
      toast({
        title: "Export Failed",
        description: error instanceof Error ? error.message : "Failed to generate PDF. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsExporting(prev => ({ ...prev, pdf: false }));
    }
  };

  const handleGenerateLisp = async () => {
    if (!parameters) {
      toast({
        title: "Generation Error",
        description: "No parameters available for LISP code generation.",
        variant: "destructive"
      });
      return;
    }

    setIsExporting(prev => ({ ...prev, lisp: true }));
    
    try {
      const response = await apiRequest("POST", "/api/bridge/generate-lisp", { parameters });
      const data = await response.json();
      
      if (data.success) {
        setLispCode(data.lispCode);
        setShowLispCode(true);
        toast({
          title: "LISP Code Generated",
          description: "AutoCAD LISP script is ready for use"
        });
      }
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Unable to generate LISP code. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsExporting(prev => ({ ...prev, lisp: false }));
    }
  };

  const copyLispCode = () => {
    navigator.clipboard.writeText(lispCode);
    toast({
      title: "Copied",
      description: "LISP code copied to clipboard"
    });
  };

  if (!parameters) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Download className="mr-2 h-5 w-5 text-primary" />
            Export Options
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Download className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Generate a drawing first to enable export options</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Download className="mr-2 h-5 w-5 text-primary" />
            Export Options
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border border-gray-200 rounded-lg p-4 hover:border-primary transition-colors">
              <div className="text-center">
                <FileText className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                <h4 className="font-semibold">DWG Format</h4>
                <p className="text-sm text-gray-600 mt-1">AutoCAD Drawing File</p>
                <p className="text-xs text-gray-500 mt-2">3 A4 Landscape Pages</p>
                <Button
                  onClick={handleExportDWG}
                  disabled={isExporting.dwg}
                  className="mt-3 w-full bg-orange-500 hover:bg-orange-600 text-white"
                  data-testid="export-dwg-button"
                >
                  {isExporting.dwg ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                      Exporting...
                    </>
                  ) : (
                    "Export DWG"
                  )}
                </Button>
              </div>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4 hover:border-primary transition-colors">
              <div className="text-center">
                <File className="h-8 w-8 text-red-600 mx-auto mb-2" />
                <h4 className="font-semibold">PDF Format</h4>
                <p className="text-sm text-gray-600 mt-1">Portable Document</p>
                <p className="text-xs text-gray-500 mt-2">Print Ready A4</p>
                <Button
                  onClick={handleExportPDF}
                  disabled={isExporting.pdf}
                  className="mt-3 w-full bg-red-600 hover:bg-red-700 text-white"
                  data-testid="export-pdf-button"
                >
                  {isExporting.pdf ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                      Exporting...
                    </>
                  ) : (
                    "Export PDF"
                  )}
                </Button>
              </div>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4 hover:border-primary transition-colors">
              <div className="text-center">
                <Code className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h4 className="font-semibold">LISP Code</h4>
                <p className="text-sm text-gray-600 mt-1">AutoCAD LISP Script</p>
                <p className="text-xs text-gray-500 mt-2">Generated Commands</p>
                <Button
                  onClick={handleGenerateLisp}
                  disabled={isExporting.lisp}
                  className="mt-3 w-full bg-green-600 hover:bg-green-700 text-white"
                  data-testid="generate-lisp-button"
                >
                  {isExporting.lisp ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                      Generating...
                    </>
                  ) : (
                    "Generate Code"
                  )}
                </Button>
              </div>
            </div>
          </div>
          
          {/* Export Settings */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium flex items-center">
                <Settings className="mr-2 h-4 w-4" />
                Export Settings
              </h4>
              {parameters && (
                <Badge variant="outline" data-testid="current-scale">
                  Current Scale: 1:{parameters.scale1}
                </Badge>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Paper Size</label>
                <Select
                  value={exportSettings.paperSize}
                  onValueChange={(value: "A4" | "A3" | "A2") => 
                    setExportSettings(prev => ({ ...prev, paperSize: value }))
                  }
                >
                  <SelectTrigger data-testid="paper-size-selector">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A4">A4 Landscape</SelectItem>
                    <SelectItem value="A3">A3 Landscape</SelectItem>
                    <SelectItem value="A2">A2 Landscape</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Drawing Scale</label>
                <Select
                  value={exportSettings.drawingScale}
                  onValueChange={(value) => 
                    setExportSettings(prev => ({ ...prev, drawingScale: value }))
                  }
                >
                  <SelectTrigger data-testid="drawing-scale-selector">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={`1:${parameters.scale1}`}>1:{parameters.scale1} (Plan/Elevation)</SelectItem>
                    <SelectItem value={`1:${parameters.scale2}`}>1:{parameters.scale2} (Sections)</SelectItem>
                    <SelectItem value="custom">Custom Scale</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="mt-4 flex flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include-dimensions"
                  checked={exportSettings.includeDimensions}
                  onCheckedChange={(checked) =>
                    setExportSettings(prev => ({ ...prev, includeDimensions: checked as boolean }))
                  }
                  data-testid="include-dimensions-checkbox"
                />
                <label htmlFor="include-dimensions" className="text-sm">Include dimensions</label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include-title-block"
                  checked={exportSettings.includeTitleBlock}
                  onCheckedChange={(checked) =>
                    setExportSettings(prev => ({ ...prev, includeTitleBlock: checked as boolean }))
                  }
                  data-testid="include-title-block-checkbox"
                />
                <label htmlFor="include-title-block" className="text-sm">Include title block</label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include-grid"
                  checked={exportSettings.includeGrid}
                  onCheckedChange={(checked) =>
                    setExportSettings(prev => ({ ...prev, includeGrid: checked as boolean }))
                  }
                  data-testid="include-grid-checkbox"
                />
                <label htmlFor="include-grid" className="text-sm">Include grid lines</label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* LISP Code Preview */}
      {showLispCode && lispCode && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <Code className="mr-2 h-5 w-5 text-primary" />
                Generated LISP Code Preview
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={copyLispCode}
                data-testid="copy-lisp-button"
              >
                <Download className="mr-1 h-4 w-4" />
                Copy Code
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-900 text-gray-100 rounded-lg p-4 font-mono text-sm overflow-x-auto max-h-80 overflow-y-auto">
              <pre data-testid="lisp-code-display">{lispCode}</pre>
            </div>
            
            <div className="mt-3 text-sm text-gray-600 flex items-start space-x-2">
              <Code className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <p>
                This code implements the exact LISP functions from your reference file, including 
                coordinate transformations and AutoCAD drawing commands. Load this into AutoCAD 
                using the APPLOAD command.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
