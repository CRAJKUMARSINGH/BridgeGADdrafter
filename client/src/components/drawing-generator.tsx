import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Play, Compass } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { GenerationResponse } from "@/lib/types";

interface DrawingGeneratorProps {
  projectId: string | null;
  onGenerationStart: () => void;
  disabled: boolean;
}

export function DrawingGenerator({ projectId, onGenerationStart, disabled }: DrawingGeneratorProps) {
  const [generating, setGenerating] = useState(false);
  const [options, setOptions] = useState({
    elevation: true,
    plan: true,
    side: true,
  });
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!projectId) {
      toast({
        title: "No project selected",
        description: "Please upload a GAD file first",
        variant: "destructive",
      });
      return;
    }

    setGenerating(true);
    try {
      const response = await apiRequest('POST', `/api/projects/${projectId}/generate`);
      const data: GenerationResponse = await response.json();

      if (data.success) {
        toast({
          title: "Generation started",
          description: "Your bridge drawings are being generated",
        });
        onGenerationStart();
      } else {
        throw new Error(data.error || 'Generation failed');
      }
    } catch (error) {
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Compass className="text-primary mr-2" size={20} />
            Generate Drawings
          </h2>
          <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium">
            Step 2
          </span>
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Checkbox
                id="elevation"
                checked={options.elevation}
                onCheckedChange={(checked) => 
                  setOptions(prev => ({ ...prev, elevation: !!checked }))
                }
                className="border-gray-300"
              />
              <label htmlFor="elevation" className="font-medium text-gray-900 cursor-pointer">
                Main Bridge Elevation
              </label>
            </div>
            <span className="text-sm text-green-600">Fixed deficiencies</span>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Checkbox
                id="plan"
                checked={options.plan}
                onCheckedChange={(checked) => 
                  setOptions(prev => ({ ...prev, plan: !!checked }))
                }
                className="border-gray-300"
              />
              <label htmlFor="plan" className="font-medium text-gray-900 cursor-pointer">
                Bridge Plan View
              </label>
            </div>
            <span className="text-sm text-green-600">✓ Updated</span>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Checkbox
                id="side"
                checked={options.side}
                onCheckedChange={(checked) => 
                  setOptions(prev => ({ ...prev, side: !!checked }))
                }
                className="border-gray-300"
              />
              <label htmlFor="side" className="font-medium text-gray-900 cursor-pointer">
                Side Elevation
              </label>
            </div>
            <span className="text-sm text-green-600">✓ Corrected</span>
          </div>
        </div>

        <Button
          onClick={handleGenerate}
          disabled={disabled || generating || !projectId}
          className="w-full bg-primary hover:bg-primary/90"
        >
          <Play className="mr-2" size={16} />
          {generating ? "Generating Bridge Drawings..." : "Generate Bridge Drawings"}
        </Button>
      </CardContent>
    </Card>
  );
}
