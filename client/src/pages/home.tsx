import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileUpload } from "@/components/file-upload";
import { DrawingGenerator } from "@/components/drawing-generator";
import { ProgressTracker } from "@/components/progress-tracker";
import { DownloadSection } from "@/components/download-section";
import { BusFront, Info, Settings, HelpCircle, Book, Bug } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProjectStatus } from "@/lib/types";

export default function Home() {
  const [currentProject, setCurrentProject] = useState<string | null>(null);
  const [projectData, setProjectData] = useState<any>(null);

  // Poll for project status updates
  const { data: project, refetch } = useQuery<ProjectStatus>({
    queryKey: ['/api/projects', currentProject],
    enabled: !!currentProject,
    refetchInterval: currentProject ? 2000 : false, // Poll every 2 seconds when active
  });

  const handleUploadSuccess = (projectId: string, data: any) => {
    setCurrentProject(projectId);
    setProjectData(data);
  };

  const handleGenerationStart = () => {
    // Start polling for updates
    refetch();
  };

  const getProgress = (): number => {
    if (!project) return 0;
    return parseInt(project.progress) || 0;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-primary text-white p-2 rounded-lg">
                <BusFront size={24} />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">BusFront GAD Drafter</h1>
                <p className="text-sm text-gray-500">General Arrangement Drawing Generator</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <HelpCircle className="mr-2" size={16} />
                Help
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="mr-2" size={16} />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Banner */}
        <Alert className="mb-6 bg-blue-50 border-blue-200">
          <Info className="h-4 w-4 text-primary" />
          <AlertDescription className="text-blue-800">
            <strong>LISP Code Enhancement Status:</strong> Main bridge elevation drawing deficiencies corrected. 
            All coordinate transformations and scaling functions updated.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <FileUpload onUploadSuccess={handleUploadSuccess} />
            
            {projectData && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-medium text-gray-900 mb-3">BusFront Parameters Preview</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Plan Scale:</span>
                      <span className="ml-2 font-medium">1:{projectData.parameters?.planScale || 100}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Section Scale:</span>
                      <span className="ml-2 font-medium">1:{projectData.parameters?.sectionScale || 50}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Skew Angle:</span>
                      <span className="ml-2 font-medium">{projectData.parameters?.skewAngle || 0}°</span>
                    </div>
                    <div>
                      <span className="text-gray-500">BusFront Length:</span>
                      <span className="ml-2 font-medium">{projectData.parameters?.bridgeLength || 0}m</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <DrawingGenerator 
              projectId={currentProject}
              onGenerationStart={handleGenerationStart}
              disabled={!currentProject}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <ProgressTracker 
              status={project?.status || 'uploaded'}
              progress={getProgress()}
              errorMessage={project?.errorMessage || undefined}
            />

            {/* LISP Code Status */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <BusFront className="text-primary mr-2" size={20} />
                  LISP Code Status
                </h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-green-800">Main Elevation Fixed</p>
                      <p className="text-xs text-green-600">Coordinate transformation corrected</p>
                    </div>
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-green-800">Scaling Functions</p>
                      <p className="text-xs text-green-600">vpos, hpos, v2pos, h2pos updated</p>
                    </div>
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-green-800">Drawing Commands</p>
                      <p className="text-xs text-green-600">AutoCAD plotting commands verified</p>
                    </div>
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <DownloadSection 
              projectId={currentProject}
              status={project?.status || 'uploaded'}
            />
          </div>
        </div>

        {/* Technical Specifications */}
        <Card className="mt-8">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <Settings className="text-primary mr-2" size={20} />
              Technical Specifications & LISP Code Corrections
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Input Parameters</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Scale factors (plan/elevation/sections)</li>
                  <li>• Skew angle in degrees</li>
                  <li>• Datum and reference levels</li>
                  <li>• Chainage start/end points</li>
                  <li>• Increment intervals (X/Y axis)</li>
                  <li>• Total number of chainages</li>
                </ul>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Drawing Views</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Main bridge elevation (corrected)</li>
                  <li>• Plan view with dimensions</li>
                  <li>• Side elevation views</li>
                  <li>• Cross-sectional details</li>
                  <li>• A4 landscape layout format</li>
                  <li>• AutoCAD dimension styles</li>
                </ul>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Code Corrections</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Fixed coordinate transformation functions</li>
                  <li>• Corrected scaling calculations (vvs/hhs)</li>
                  <li>• Updated plot command sequences</li>
                  <li>• Enhanced dimension style settings</li>
                  <li>• Improved layout positioning</li>
                  <li>• Maintained existing variable structure</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <p className="text-sm text-gray-500">BusFront GAD Drafter v2.1</p>
              <span className="text-gray-300">|</span>
              <p className="text-sm text-gray-500">Engineering Drawing Automation</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="text-gray-500">
                <Book className="mr-1" size={14} />
                Documentation
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-500">
                <Bug className="mr-1" size={14} />
                Report Issue
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-500">
                <Info className="mr-1" size={14} />
                About
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
