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
import { EnhancedBridgeInterface } from "@/components/enhanced-bridge-interface";
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
  const [bridgeData, setBridgeData] = useState<ParsedBridgeData | null>(null);
  const [currentProject, setCurrentProject] = useState<string | null>(null);
  const [dwgData, setDwgData] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Handle parameter changes from enhanced interface
  const handleParametersChange = (parameters: BridgeParameters) => {
    setBridgeData({
      parameters,
      calculatedValues: {
        vvs: 1000,
        hhs: 1000, 
        skew1: parameters.skew * 0.0174532,
        sc: parameters.scale1 / parameters.scale2
      }
    });
  };

  // Handle DWG generation from enhanced interface
  const handleDWGGenerated = (data: any) => {
    setDwgData(data);
    
    // Save project if parameters exist
    if (bridgeData?.parameters && !currentProject) {
      createProjectMutation.mutate({
        name: `Bridge Project ${new Date().toISOString().split('T')[0]}`,
        inputData: JSON.stringify(bridgeData.parameters),
        parameters: bridgeData.parameters as BridgeInput
      });
    }
  };

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

  return (
    <div className="min-h-screen bg-background p-6">
      <EnhancedBridgeInterface 
        onParametersChange={handleParametersChange}
        onDWGGenerated={handleDWGGenerated}
      />
      
      {/* Optional: Show traditional bridge canvas when data exists */}
      {bridgeData && (
        <div className="mt-6 space-y-6">
          <BridgeCanvas
            parameters={bridgeData.parameters}
            isGenerating={createProjectMutation.isPending}
          />
          
          <ExportOptions
            parameters={bridgeData.parameters}
            projectId={currentProject || undefined}
          />
        </div>
      )}
    </div>
  );
}
