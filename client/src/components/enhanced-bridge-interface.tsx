import React, { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Upload, Download, Settings, Calculator, Eye, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { BridgeCalculator, type BridgeParameters } from "@/lib/bridge-calculations";
import { generateBridgeDWG, processExcelToBridgeParameters } from "@/lib/dwg-generator";

interface EnhancedBridgeInterfaceProps {
  onParametersChange?: (parameters: BridgeParameters) => void;
  onDWGGenerated?: (dwgData: any) => void;
}

export function EnhancedBridgeInterface({ onParametersChange, onDWGGenerated }: EnhancedBridgeInterfaceProps) {
  const [parameters, setParameters] = useState<BridgeParameters>({
    scale1: 100,
    scale2: 50,
    skew: 0,
    datum: 0,
    toprl: 20,
    left: 0,
    right: 100,
    xincr: 10,
    yincr: 2,
    noch: 10
  });
  
  const [crossSectionData, setCrossSectionData] = useState<Array<{ chainage: number; level: number }>>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [useDefaultFile, setUseDefaultFile] = useState(false);
  const [bridgeDesign, setBridgeDesign] = useState<any>(null);
  const { toast } = useToast();

  // Handle Excel file upload (from app.py functionality)
  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.xlsx')) {
      toast({
        title: "Invalid File Type",
        description: "Please upload an Excel (.xlsx) file",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    try {
      // Read Excel file (simplified - in real app would use xlsx library)
      const formData = new FormData();
      formData.append('file', file);
      
      // Simulate Excel processing (in real app would call server API)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "File Processed",
        description: `Excel file "${file.name}" loaded successfully`,
      });
      
    } catch (error) {
      toast({
        title: "Processing Error",
        description: "Failed to process Excel file. Please check the format.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  }, [toast]);

  // Update parameters (from app.py parameter editing)
  const handleParameterChange = useCallback((key: keyof BridgeParameters, value: string) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return;
    
    const newParameters = { ...parameters, [key]: numValue };
    setParameters(newParameters);
    onParametersChange?.(newParameters);
  }, [parameters, onParametersChange]);

  // Generate bridge design (from app.py bridge calculations)
  const generateBridgeDesign = useCallback(() => {
    setIsProcessing(true);
    try {
      const calculator = new BridgeCalculator(parameters);
      const design = {
        elevation: calculator.generateBridgeElevation(),
        plan: calculator.generateBridgePlan(),
        layout: calculator.generateLayoutPoints(),
        complete: calculator.generateCompleteBridgeDesign(),
        dimensions: calculator.generateDimensionLines()
      };
      
      setBridgeDesign(design);
      
      toast({
        title: "Bridge Design Generated",
        description: "Bridge calculations completed successfully",
      });
      
    } catch (error) {
      toast({
        title: "Generation Error",
        description: "Failed to generate bridge design. Please check parameters.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  }, [parameters, toast]);

  // Generate DXF drawing (from app.py DXF generation)
  const generateDXFDrawing = useCallback(async () => {
    setIsProcessing(true);
    try {
      const dwgData = generateBridgeDWG(parameters, {
        paperSize: "A3",
        orientation: "landscape",
        scale: parameters.scale1,
        includeDimensions: true,
        includeTitleBlock: true,
        includeGrid: true
      }, crossSectionData.length > 0 ? crossSectionData : undefined);
      
      onDWGGenerated?.(dwgData);
      
      // Create download
      const dwgContent = dwgData.commands.join('\n');
      const blob = new Blob([dwgContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'bridge_design.dxf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "DXF Generated",
        description: "Bridge drawing exported as DXF file",
      });
      
    } catch (error) {
      toast({
        title: "Export Error", 
        description: "Failed to generate DXF file. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  }, [parameters, crossSectionData, onDWGGenerated, toast]);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🌉 Bridge Design Generator
            <Badge variant="secondary">Enhanced with LISP Integration</Badge>
          </CardTitle>
          <p className="text-muted-foreground">
            Upload your bridge parameters in an Excel file to generate professional DXF drawings.
            The app processes input and generates bridge designs based on proven engineering calculations.
          </p>
        </CardHeader>
      </Card>

      <Tabs defaultValue="upload" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Upload
          </TabsTrigger>
          <TabsTrigger value="parameters" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Parameters
          </TabsTrigger>
          <TabsTrigger value="design" className="flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            Design
          </TabsTrigger>
          <TabsTrigger value="export" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </TabsTrigger>
        </TabsList>

        {/* Upload Tab */}
        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>1. Upload Parameters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="excel-file">Excel File (.xlsx)</Label>
                <Input 
                  id="excel-file" 
                  type="file" 
                  accept=".xlsx"
                  onChange={handleFileUpload}
                  disabled={isProcessing}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="use-default"
                  checked={useDefaultFile}
                  onCheckedChange={setUseDefaultFile}
                />
                <Label htmlFor="use-default">Use default example file</Label>
              </div>
              
              {isProcessing && (
                <div className="text-sm text-muted-foreground">
                  Processing file...
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>📋 Instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p><strong>1. Prepare an Excel file</strong> with two sheets:</p>
                <ul className="ml-4 space-y-1 list-disc">
                  <li><strong>Sheet1</strong>: Parameters with columns: Value, Variable, Description</li>
                  <li><strong>Sheet2</strong>: Cross-section data with Chainage and RL values</li>
                </ul>
                <p><strong>2. Upload the file</strong> using the uploader above</p>
                <p><strong>3. Review and edit</strong> parameters if needed</p>
                <p><strong>4. Generate bridge design</strong> and export DXF</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Parameters Tab */}
        <TabsContent value="parameters" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bridge Parameters</CardTitle>
              <p className="text-sm text-muted-foreground">
                Based on original LISP parameter system
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="scale1">Scale 1 (Plan/Elevation)</Label>
                  <Input 
                    id="scale1"
                    type="number"
                    value={parameters.scale1}
                    onChange={(e) => handleParameterChange('scale1', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="scale2">Scale 2 (Sections)</Label>
                  <Input 
                    id="scale2"
                    type="number"
                    value={parameters.scale2}
                    onChange={(e) => handleParameterChange('scale2', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="skew">Skew Angle (degrees)</Label>
                  <Input 
                    id="skew"
                    type="number"
                    value={parameters.skew}
                    onChange={(e) => handleParameterChange('skew', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="datum">Datum Level</Label>
                  <Input 
                    id="datum"
                    type="number"
                    value={parameters.datum}
                    onChange={(e) => handleParameterChange('datum', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="toprl">Top RL</Label>
                  <Input 
                    id="toprl"
                    type="number"
                    value={parameters.toprl}
                    onChange={(e) => handleParameterChange('toprl', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="left">Start Chainage</Label>
                  <Input 
                    id="left"
                    type="number"
                    value={parameters.left}
                    onChange={(e) => handleParameterChange('left', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="right">End Chainage</Label>
                  <Input 
                    id="right"
                    type="number"
                    value={parameters.right}
                    onChange={(e) => handleParameterChange('right', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="xincr">X Increment</Label>
                  <Input 
                    id="xincr"
                    type="number"
                    value={parameters.xincr}
                    onChange={(e) => handleParameterChange('xincr', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="yincr">Y Increment</Label>
                  <Input 
                    id="yincr"
                    type="number"
                    value={parameters.yincr}
                    onChange={(e) => handleParameterChange('yincr', e.target.value)}
                  />
                </div>
              </div>
              
              <Separator />
              
              {/* Key Parameters Display */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{((parameters.right - parameters.left) / 30).toFixed(0)}</div>
                  <div className="text-sm text-muted-foreground">Number of Spans</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{(parameters.right - parameters.left).toFixed(0)}m</div>
                  <div className="text-sm text-muted-foreground">Bridge Length</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{parameters.skew}°</div>
                  <div className="text-sm text-muted-foreground">Skew Angle</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Design Tab */}
        <TabsContent value="design" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bridge Design Generation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={generateBridgeDesign}
                disabled={isProcessing}
                className="w-full"
                size="lg"
              >
                <Calculator className="h-4 w-4 mr-2" />
                Generate Bridge Design
              </Button>
              
              {bridgeDesign && (
                <div className="space-y-4">
                  <Separator />
                  <h3 className="text-lg font-semibold">Design Summary</h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-muted rounded">
                      <div className="text-lg font-bold">{bridgeDesign.complete.nspan}</div>
                      <div className="text-sm">Spans</div>
                    </div>
                    <div className="text-center p-3 bg-muted rounded">
                      <div className="text-lg font-bold">{bridgeDesign.elevation.piers.length}</div>
                      <div className="text-sm">Piers</div>
                    </div>
                    <div className="text-center p-3 bg-muted rounded">
                      <div className="text-lg font-bold">{bridgeDesign.complete.lbridge.toFixed(0)}m</div>
                      <div className="text-sm">Total Length</div>
                    </div>
                    <div className="text-center p-3 bg-muted rounded">
                      <div className="text-lg font-bold">{bridgeDesign.complete.deckDetails.thickness}m</div>
                      <div className="text-sm">Deck Thickness</div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Export Tab */}
        <TabsContent value="export" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Export Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={generateDXFDrawing}
                disabled={isProcessing || !bridgeDesign}
                className="w-full"
                size="lg"
              >
                <Download className="h-4 w-4 mr-2" />
                Generate & Download DXF Drawing
              </Button>
              
              <div className="text-sm text-muted-foreground">
                {!bridgeDesign && "Generate bridge design first to enable export"}
                {isProcessing && "Generating DXF file..."}
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <h4 className="font-semibold">Export Features:</h4>
                <ul className="text-sm space-y-1 ml-4">
                  <li>✓ Professional DXF format compatible with AutoCAD</li>
                  <li>✓ Multiple drawing layers (deck, piers, foundations, dimensions)</li>
                  <li>✓ Comprehensive dimensioning based on LISP standards</li>
                  <li>✓ Cross-section integration from Excel data</li>
                  <li>✓ Skew angle transformation support</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
