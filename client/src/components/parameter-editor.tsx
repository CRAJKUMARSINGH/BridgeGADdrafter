import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Settings, Save, RotateCcw, Calculator } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { BridgeParameters } from "@/lib/bridge-calculations";

interface ParameterEditorProps {
  parameters: BridgeParameters | null;
  onParametersChange: (parameters: BridgeParameters) => void;
  isCalculating?: boolean;
}

export function ParameterEditor({ 
  parameters, 
  onParametersChange, 
  isCalculating = false 
}: ParameterEditorProps) {
  const [editableParams, setEditableParams] = useState<BridgeParameters | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (parameters) {
      setEditableParams(parameters);
      setHasChanges(false);
    }
  }, [parameters]);

  const handleParameterChange = (field: keyof BridgeParameters, value: string) => {
    if (!editableParams) return;

    const numValue = field === 'noch' ? parseInt(value) || 0 : parseFloat(value) || 0;
    const updated = { ...editableParams, [field]: numValue };
    setEditableParams(updated);
    setHasChanges(true);
  };

  const handleSave = () => {
    if (!editableParams) return;

    // Validate parameters
    if (editableParams.scale1 <= 0 || editableParams.scale2 <= 0) {
      toast({
        title: "Validation Error",
        description: "Scale values must be greater than 0",
        variant: "destructive"
      });
      return;
    }

    if (editableParams.left >= editableParams.right) {
      toast({
        title: "Validation Error", 
        description: "Right chainage must be greater than left chainage",
        variant: "destructive"
      });
      return;
    }

    if (editableParams.datum >= editableParams.toprl) {
      toast({
        title: "Validation Error",
        description: "Top RL must be greater than datum level",
        variant: "destructive"
      });
      return;
    }

    onParametersChange(editableParams);
    setHasChanges(false);
    toast({
      title: "Parameters Updated",
      description: "Bridge drawing will refresh with new values"
    });
  };

  const handleReset = () => {
    if (parameters) {
      setEditableParams(parameters);
      setHasChanges(false);
    }
  };

  if (!editableParams) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="mr-2 h-5 w-5 text-primary" />
            Parameter Editor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Settings className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Upload an input file to enable parameter editing</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Settings className="mr-2 h-5 w-5 text-primary" />
            Parameter Editor
          </CardTitle>
          <div className="flex items-center space-x-2">
            {hasChanges && (
              <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                Modified
              </Badge>
            )}
            {isCalculating && (
              <Badge variant="secondary" className="animate-pulse">
                <Calculator className="mr-1 h-3 w-3" />
                Calculating
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Scale Parameters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="scale1" className="text-sm font-medium">
                Scale 1 (Plan/Elevation)
              </Label>
              <Input
                id="scale1"
                type="number"
                value={editableParams.scale1}
                onChange={(e) => handleParameterChange('scale1', e.target.value)}
                className="font-mono"
                data-testid="input-scale1"
              />
              <p className="text-xs text-gray-500">Drawing scale for plan and elevation views</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="scale2" className="text-sm font-medium">
                Scale 2 (Sections)
              </Label>
              <Input
                id="scale2"
                type="number"
                value={editableParams.scale2}
                onChange={(e) => handleParameterChange('scale2', e.target.value)}
                className="font-mono"
                data-testid="input-scale2"
              />
              <p className="text-xs text-gray-500">Drawing scale for cross-sections</p>
            </div>
          </div>

          {/* Geometry Parameters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="skew" className="text-sm font-medium">
                Skew Angle (degrees)
              </Label>
              <Input
                id="skew"
                type="number"
                step="0.1"
                value={editableParams.skew}
                onChange={(e) => handleParameterChange('skew', e.target.value)}
                className="font-mono"
                data-testid="input-skew"
              />
              <p className="text-xs text-gray-500">Bridge skew angle in degrees</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="noch" className="text-sm font-medium">
                Number of Chainages
              </Label>
              <Input
                id="noch"
                type="number"
                value={editableParams.noch}
                onChange={(e) => handleParameterChange('noch', e.target.value)}
                className="font-mono"
                data-testid="input-noch"
              />
              <p className="text-xs text-gray-500">Total number of chainage points</p>
            </div>
          </div>

          {/* Level Parameters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="datum" className="text-sm font-medium">
                Datum Level (m)
              </Label>
              <Input
                id="datum"
                type="number"
                step="0.001"
                value={editableParams.datum}
                onChange={(e) => handleParameterChange('datum', e.target.value)}
                className="font-mono"
                data-testid="input-datum"
              />
              <p className="text-xs text-gray-500">Reference datum level in meters</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="toprl" className="text-sm font-medium">
                Top RL (m)
              </Label>
              <Input
                id="toprl"
                type="number"
                step="0.001"
                value={editableParams.toprl}
                onChange={(e) => handleParameterChange('toprl', e.target.value)}
                className="font-mono"
                data-testid="input-toprl"
              />
              <p className="text-xs text-gray-500">Top reduced level in meters</p>
            </div>
          </div>

          {/* Chainage Parameters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="left" className="text-sm font-medium">
                Left Chainage (m)
              </Label>
              <Input
                id="left"
                type="number"
                step="0.001"
                value={editableParams.left}
                onChange={(e) => handleParameterChange('left', e.target.value)}
                className="font-mono"
                data-testid="input-left"
              />
              <p className="text-xs text-gray-500">Start chainage of X-axis</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="right" className="text-sm font-medium">
                Right Chainage (m)
              </Label>
              <Input
                id="right"
                type="number"
                step="0.001"
                value={editableParams.right}
                onChange={(e) => handleParameterChange('right', e.target.value)}
                className="font-mono"
                data-testid="input-right"
              />
              <p className="text-xs text-gray-500">End chainage of X-axis</p>
            </div>
          </div>

          {/* Increment Parameters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="xincr" className="text-sm font-medium">
                X Increment (m)
              </Label>
              <Input
                id="xincr"
                type="number"
                step="0.1"
                value={editableParams.xincr}
                onChange={(e) => handleParameterChange('xincr', e.target.value)}
                className="font-mono"
                data-testid="input-xincr"
              />
              <p className="text-xs text-gray-500">Distance interval on X-axis</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="yincr" className="text-sm font-medium">
                Y Increment (m)
              </Label>
              <Input
                id="yincr"
                type="number"
                step="0.1"
                value={editableParams.yincr}
                onChange={(e) => handleParameterChange('yincr', e.target.value)}
                className="font-mono"
                data-testid="input-yincr"
              />
              <p className="text-xs text-gray-500">Level interval on Y-axis</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-gray-600">
              <span className="font-medium">Bridge Length:</span> {(editableParams.right - editableParams.left).toFixed(1)}m
              <span className="ml-4 font-medium">Height Range:</span> {(editableParams.toprl - editableParams.datum).toFixed(1)}m
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                disabled={!hasChanges}
                data-testid="reset-parameters-button"
              >
                <RotateCcw className="mr-1 h-4 w-4" />
                Reset
              </Button>
              
              <Button
                onClick={handleSave}
                disabled={!hasChanges || isCalculating}
                data-testid="save-parameters-button"
              >
                {isCalculating ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                    Calculating...
                  </>
                ) : (
                  <>
                    <Save className="mr-1 h-4 w-4" />
                    Apply Changes
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Calculated Values Display */}
          <div className="bg-gray-50 rounded-lg p-3">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Calculated Constants</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-gray-500">vvs:</span>
                <span className="ml-1 font-mono text-gray-900">1000.0</span>
              </div>
              <div>
                <span className="text-gray-500">hhs:</span>
                <span className="ml-1 font-mono text-gray-900">1000.0</span>
              </div>
              <div>
                <span className="text-gray-500">skew1:</span>
                <span className="ml-1 font-mono text-gray-900">
                  {(editableParams.skew * 0.0174532).toFixed(4)}
                </span>
              </div>
              <div>
                <span className="text-gray-500">sc:</span>
                <span className="ml-1 font-mono text-gray-900">
                  {(editableParams.scale1 / editableParams.scale2).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}