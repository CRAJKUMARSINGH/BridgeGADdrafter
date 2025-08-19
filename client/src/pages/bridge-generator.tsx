import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Play } from "lucide-react";
import { FileUpload } from "@/components/ui/file-upload";
import { ParameterDisplay } from "@/components/parameter-display";
import { ParameterEditor } from "@/components/parameter-editor";
import { BridgeCanvas } from "@/components/bridge-canvas";
import { ExportOptions } from "@/components/export-options";
import { apiRequest } from "@/lib/queryClient";
import { BridgeCalculator, type BridgeParameters } from "@/lib/bridge-calculations";
import type { BridgeInput } from "@shared/schema";

interface ParsedBridgeData {
  parameters: BridgeParameters;
  calculatedValues: {
    vvs: number;
    hhs: number;
    skew1: number;
    sc: number;
  };
}

export default function BridgeGenerator() {
  const [inputData, setInputData] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const [bridgeData, setBridgeData] = useState<ParsedBridgeData | null>(null);
  const [currentProject, setCurrentProject] = useState<string | null>(null);
  const [showParameterEditor, setShowParameterEditor] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Parse input file mutation
  const parseInputMutation = useMutation({
    mutationFn: async (inputContent: string) => {
      const response = await apiRequest("POST", "/api/bridge/parse", {
        inputData: inputContent
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        setBridgeData({
          parameters: data.parameters,
          calculatedValues: data.calculatedValues
        });
        toast({
          title: "Input Parsed Successfully",
          description: "Bridge parameters loaded and validated"
        });
      }
    },
    onError: (error: any) => {
      const errorMsg = error?.message || "Failed to parse input file";
      toast({
        title: "Parse Error",
        description: errorMsg,
        variant: "destructive"
      });
    }
  });

  // Create project mutation
  const createProjectMutation = useMutation({
    mutationFn: async (data: { name: string; inputData: string; parameters: BridgeInput }) => {
      const response = await apiRequest("POST", "/api/bridge/project", data);
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        setCurrentProject(data.project.id);
        toast({
          title: "Project Created",
          description: "Bridge project saved successfully"
        });
      }
    },
    onError: () => {
      toast({
        title: "Project Creation Failed",
        description: "Unable to save bridge project",
        variant: "destructive"
      });
    }
  });

  const handleFileSelect = (content: string, filename: string) => {
    setInputData(content);
    setFileName(filename);
    parseInputMutation.mutate(content);
  };

  const handleGenerateDrawing = () => {
    if (!bridgeData) {
      toast({
        title: "No Data",
        description: "Please upload an input file first",
        variant: "destructive"
      });
      return;
    }

    // Create project with the parsed data
    const projectName = fileName.replace(/\.[^/.]+$/, "") || "Bridge Project";
    
    createProjectMutation.mutate({
      name: projectName,
      inputData: inputData,
      parameters: bridgeData.parameters
    });
  };

  const handleParametersChange = (newParameters: BridgeParameters) => {
    if (bridgeData) {
      setBridgeData({
        ...bridgeData,
        parameters: newParameters
      });
    }
  };

  const calculator = bridgeData ? new BridgeCalculator(bridgeData.parameters) : null;
  const calculatedConstants = calculator?.getCalculatedConstants() || null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-white shadow-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-white rounded flex items-center justify-center">
                <span className="text-primary font-bold text-sm">B</span>
              </div>
              <h1 className="text-xl font-bold" data-testid="app-title">Bridge GAD Generator</h1>
              <span className="bg-blue-800 px-2 py-1 rounded text-xs">v2025.1</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="secondary" 
                size="sm" 
                className="bg-blue-800 hover:bg-blue-900"
                onClick={() => setShowParameterEditor(!showParameterEditor)}
                data-testid="parameter-editor-toggle"
              >
                {showParameterEditor ? "Hide Editor" : "Edit Parameters"}
              </Button>
              <Button 
                variant="secondary" 
                size="sm" 
                className="bg-blue-800 hover:bg-blue-900"
                data-testid="help-button"
              >
                Help
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Input Panel */}
          <div className="lg:col-span-1 space-y-6">
            {/* File Upload Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">
                  Input Data File
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FileUpload
                  onFileSelect={handleFileSelect}
                  accept=".txt"
                  maxSize={1024 * 1024}
                  disabled={parseInputMutation.isPending}
                />
              </CardContent>
            </Card>

            {/* Parameters Display or Editor */}
            {showParameterEditor ? (
              <ParameterEditor
                parameters={bridgeData?.parameters || null}
                onParametersChange={handleParametersChange}
                isCalculating={parseInputMutation.isPending}
              />
            ) : (
              <ParameterDisplay
                parameters={bridgeData?.parameters || null}
                calculatedConstants={calculatedConstants}
                isCalculating={parseInputMutation.isPending}
              />
            )}

            {/* Generate Button */}
            <Button
              onClick={handleGenerateDrawing}
              disabled={!bridgeData || createProjectMutation.isPending}
              className="w-full h-12 text-lg"
              data-testid="generate-drawing-button"
            >
              {createProjectMutation.isPending ? (
                <>
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2" />
                  Creating Project...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-5 w-5" />
                  Generate Bridge Drawing
                </>
              )}
            </Button>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Drawing Canvas */}
            <BridgeCanvas
              parameters={bridgeData?.parameters || null}
              isGenerating={parseInputMutation.isPending || createProjectMutation.isPending}
            />

            {/* Export Options */}
            <ExportOptions
              parameters={bridgeData?.parameters || null}
              projectId={currentProject || undefined}
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-secondary text-white py-3 mt-8">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4">
              <span className="flex items-center space-x-1">
                <div className="h-2 w-2 bg-green-400 rounded-full"></div>
                <span data-testid="status-ready">Ready</span>
              </span>
              <span data-testid="calculations-status">
                Calculations: {bridgeData ? "Complete" : "Waiting for input"}
              </span>
              <span data-testid="last-generated">
                Last Generated: {currentProject ? new Date().toLocaleString() : "None"}
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span>Bridge GAD Generator v2025.1</span>
              <span>Based on AutoCAD LISP</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
