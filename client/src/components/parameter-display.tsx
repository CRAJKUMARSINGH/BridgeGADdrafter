import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calculator, CheckCircle, Clock } from "lucide-react";
import type { BridgeParameters, CalculatedConstants } from "@/lib/bridge-calculations";

interface ParameterDisplayProps {
  parameters: BridgeParameters | null;
  calculatedConstants: CalculatedConstants | null;
  isCalculating?: boolean;
}

export function ParameterDisplay({ 
  parameters, 
  calculatedConstants, 
  isCalculating = false 
}: ParameterDisplayProps) {
  if (!parameters) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calculator className="mr-2 h-5 w-5 text-primary" />
            Input Parameters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Calculator className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Upload an input file to view parameters</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatChainage = (left: number, right: number) => {
    const formatSingle = (val: number) => {
      const km = Math.floor(val / 1000);
      const m = val % 1000;
      return `${km}+${m.toFixed(0).padStart(3, '0')}`;
    };
    return `${formatSingle(left)} to ${formatSingle(right)}`;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calculator className="mr-2 h-5 w-5 text-primary" />
            Input Parameters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="font-medium">Scale 1 (Plan/Elevation):</span>
              <span className="font-mono text-gray-700" data-testid="param-scale1">
                1:{parameters.scale1}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="font-medium">Scale 2 (Sections):</span>
              <span className="font-mono text-gray-700" data-testid="param-scale2">
                1:{parameters.scale2}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="font-medium">Skew Angle:</span>
              <span className="font-mono text-gray-700" data-testid="param-skew">
                {parameters.skew.toFixed(1)}°
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="font-medium">Datum Level:</span>
              <span className="font-mono text-gray-700" data-testid="param-datum">
                {parameters.datum.toFixed(3)}m
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="font-medium">Top RL:</span>
              <span className="font-mono text-gray-700" data-testid="param-toprl">
                {parameters.toprl.toFixed(3)}m
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="font-medium">Chainage Range:</span>
              <span className="font-mono text-gray-700" data-testid="param-chainage-range">
                {formatChainage(parameters.left, parameters.right)}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="font-medium">X Increment:</span>
              <span className="font-mono text-gray-700" data-testid="param-xincr">
                {parameters.xincr.toFixed(1)}m
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="font-medium">Y Increment:</span>
              <span className="font-mono text-gray-700" data-testid="param-yincr">
                {parameters.yincr.toFixed(1)}m
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="font-medium">No. of Chainages:</span>
              <span className="font-mono text-gray-700" data-testid="param-noch">
                {parameters.noch}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Calculator className="mr-2 h-5 w-5 text-primary" />
              Calculations
            </div>
            {isCalculating && (
              <Badge variant="secondary" className="animate-pulse">
                <Clock className="mr-1 h-3 w-3" />
                Processing
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded border border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-800" data-testid="validation-status">
                Input validation: Complete
              </span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded border border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-800" data-testid="transformation-status">
                Coordinate transformation: Ready
              </span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded border border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-800" data-testid="elevation-status">
                Bridge elevation: Ready
              </span>
            </div>
          </div>

          {calculatedConstants && (
            <div className="mt-4 p-3 bg-gray-50 rounded">
              <p className="text-xs font-medium text-gray-600 mb-2">Calculated Constants:</p>
              <div className="text-xs font-mono text-gray-700 space-y-1">
                <div className="flex justify-between">
                  <span>vvs (V scale factor):</span>
                  <span className="text-gray-900" data-testid="calc-vvs">
                    {calculatedConstants.vvs.toFixed(1)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>hhs (H scale factor):</span>
                  <span className="text-gray-900" data-testid="calc-hhs">
                    {calculatedConstants.hhs.toFixed(1)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>skew1 (radians):</span>
                  <span className="text-gray-900" data-testid="calc-skew1">
                    {calculatedConstants.skew1.toFixed(4)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>sc (scale ratio):</span>
                  <span className="text-gray-900" data-testid="calc-sc">
                    {calculatedConstants.sc.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
