import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { DraftingCompass, Expand, RotateCcw, ZoomIn, CheckCircle, Building, Map } from "lucide-react";
import { BridgeCalculator, type BridgeParameters } from "@/lib/bridge-calculations";

interface BridgeCanvasProps {
  parameters: BridgeParameters | null;
  isGenerating?: boolean;
}

export function BridgeCanvas({ parameters, isGenerating = false }: BridgeCanvasProps) {
  const [activeTab, setActiveTab] = useState<string>("elevation");
  const [zoom, setZoom] = useState(100);

  const bridgeData = useMemo(() => {
    if (!parameters) return null;
    
    const calculator = new BridgeCalculator(parameters);
    const layoutPoints = calculator.generateLayoutPoints();
    const bridgeElevation = calculator.generateBridgeElevation();
    const bridgePlan = calculator.generateBridgePlan();
    const completeBridgeDesign = calculator.generateCompleteBridgeDesign();
    const dimensionLines = calculator.generateDimensionLines();
    
    return {
      calculator,
      layoutPoints,
      bridgeElevation,
      bridgePlan,
      completeBridgeDesign,
      dimensionLines
    };
  }, [parameters]);

  if (!parameters || !bridgeData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <DraftingCompass className="mr-2 h-5 w-5 text-primary" />
            Bridge General Arrangement Drawing (GAD)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-gray-200 rounded-lg bg-white h-96 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <DraftingCompass className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">Ready to Generate Drawing</p>
              <p className="text-sm">Upload input parameters to create bridge elevation</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { layoutPoints, bridgeElevation, bridgePlan, completeBridgeDesign, dimensionLines } = bridgeData;
  const scale = zoom / 100;

  const renderElevationView = () => (
    <div className="relative border-2 border-gray-300 rounded-lg bg-white overflow-hidden" style={{ height: "600px" }}>
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: "linear-gradient(#000 0.5px, transparent 0.5px), linear-gradient(90deg, #000 0.5px, transparent 0.5px)",
        backgroundSize: "10px 10px"
      }} />
      
      <svg width="100%" height="100%" viewBox="0 0 800 600" className="absolute inset-0" style={{ transform: `scale(${scale})` }}>
        <text x="400" y="30" fontFamily="Arial, sans-serif" fontSize="16" fontWeight="bold" fill="#000" textAnchor="middle">
          BRIDGE ELEVATION - GENERAL ARRANGEMENT DRAWING
        </text>
        <text x="400" y="50" fontFamily="Arial, sans-serif" fontSize="12" fill="#666" textAnchor="middle">
          Scale 1:{parameters.scale1} | Length: {(parameters.right - parameters.left).toFixed(0)}m
        </text>

        <g id="coordinate-system" transform="translate(100, 450)">
          <line x1={layoutPoints.axes.xAxis[0].x} y1={-layoutPoints.axes.xAxis[0].y} 
                x2={layoutPoints.axes.xAxis[1].x} y2={-layoutPoints.axes.xAxis[1].y} 
                stroke="#333" strokeWidth="2" markerEnd="url(#arrowhead)" />
          <text x={layoutPoints.axes.xAxis[1].x + 20} y="15" fontFamily="Arial" fontSize="12" fill="#333">Chainage (m)</text>
          
          <line x1={layoutPoints.axes.yAxis[0].x} y1={-layoutPoints.axes.yAxis[0].y} 
                x2={layoutPoints.axes.yAxis[1].x} y2={-layoutPoints.axes.yAxis[1].y} 
                stroke="#333" strokeWidth="2" markerEnd="url(#arrowhead)" />
          <text x="-15" y={-layoutPoints.axes.yAxis[1].y - 10} fontFamily="Arial" fontSize="12" fill="#333">RL (m)</text>
          
          {layoutPoints.grid.xMarks.map((mark, index) => (
            <g key={`x-mark-${index}`}>
              <line x1={mark.position.x} y1={-5} x2={mark.position.x} y2={5} stroke="#333" strokeWidth="1" />
              <text x={mark.position.x} y="20" fontFamily="Arial" fontSize="10" fill="#333" textAnchor="middle">{mark.label}</text>
            </g>
          ))}
          
          {layoutPoints.grid.yMarks.map((mark, index) => (
            <g key={`y-mark-${index}`}>
              <line x1={-5} y1={-mark.position.y} x2={5} y2={-mark.position.y} stroke="#333" strokeWidth="1" />
              <text x="-10" y={-mark.position.y + 5} fontFamily="Arial" fontSize="10" fill="#333" textAnchor="end">{mark.label}</text>
            </g>
          ))}
        </g>

        <g id="bridge-structure" transform="translate(100, 450)">
          <polygon points={bridgeElevation.deck.map(p => `${p.x},${-p.y}`).join(' ')} 
                   fill="#4A90E2" stroke="#2C5282" strokeWidth="2" opacity="0.8" />
          
          <line x1={bridgeElevation.superstructure[0].x} y1={-bridgeElevation.superstructure[0].y}
                x2={bridgeElevation.superstructure[1].x} y2={-bridgeElevation.superstructure[1].y}
                stroke="#2C5282" strokeWidth="3" />
          
          {bridgeElevation.piers.map((pier, index) => (
            <g key={`pier-${index}`}>
              <polygon points={pier.points.map(p => `${p.x},${-p.y}`).join(' ')} 
                       fill="#8B4513" stroke="#654321" strokeWidth="2" />
              <text x={(pier.points[0].x + pier.points[1].x) / 2} y={-pier.points[0].y + 15} 
                    fontFamily="Arial" fontSize="10" fill="#000" textAnchor="middle">
                PIER {index + 1}
              </text>
            </g>
          ))}
          
          {bridgeElevation.abutments.map((abutment, index) => (
            <polygon key={`abutment-${index}`} points={abutment.points.map(p => `${p.x},${-p.y}`).join(' ')} 
                     fill="#696969" stroke="#2F4F4F" strokeWidth="2" />
          ))}
          
          {bridgeElevation.foundations.map((foundation, index) => (
            <polygon key={`foundation-${index}`} points={foundation.points.map(p => `${p.x},${-p.y}`).join(' ')} 
                     fill="#A0522D" stroke="#8B4513" strokeWidth="1" opacity="0.7" />
          ))}
          
          {bridgeElevation.dimensions.map((dim, index) => (
            <g key={`dimension-${index}`}>
              <line x1={dim.start.x} y1={-dim.start.y} x2={dim.end.x} y2={-dim.end.y} 
                    stroke="#FF6600" strokeWidth="1" markerStart="url(#dimArrow)" markerEnd="url(#dimArrow)" />
              <text x={(dim.start.x + dim.end.x) / 2} y={-dim.start.y - 5} 
                    fontFamily="Arial" fontSize="10" fill="#FF6600" textAnchor="middle" fontWeight="bold">
                {dim.value}
              </text>
            </g>
          ))}
        </g>

        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#333"/>
          </marker>
          <marker id="dimArrow" markerWidth="8" markerHeight="6" refX="4" refY="3" orient="auto">
            <polygon points="0 1, 6 3, 0 5" fill="#FF6600"/>
          </marker>
        </defs>
      </svg>
    </div>
  );

  const renderPlanView = () => (
    <div className="relative border-2 border-gray-300 rounded-lg bg-white overflow-hidden" style={{ height: "600px" }}>
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: "linear-gradient(#000 0.5px, transparent 0.5px), linear-gradient(90deg, #000 0.5px, transparent 0.5px)",
        backgroundSize: "10px 10px"
      }} />
      
      <svg width="100%" height="100%" viewBox="0 0 800 600" className="absolute inset-0" style={{ transform: `scale(${scale})` }}>
        <text x="400" y="30" fontFamily="Arial, sans-serif" fontSize="16" fontWeight="bold" fill="#000" textAnchor="middle">
          BRIDGE PLAN - GENERAL ARRANGEMENT DRAWING
        </text>
        <text x="400" y="50" fontFamily="Arial, sans-serif" fontSize="12" fill="#666" textAnchor="middle">
          Scale 1:{parameters.scale1} | Width: 12.0m
        </text>

        <g id="bridge-plan" transform="translate(100, 300)">
          <polygon points={bridgePlan.deckOutline.map(p => `${p.x},${-p.y}`).join(' ')} 
                   fill="#E8F4FD" stroke="#4A90E2" strokeWidth="3" />
          
          <polygon points={bridgePlan.roadwayMarking.map(p => `${p.x},${-p.y}`).join(' ')} 
                   fill="none" stroke="#FFD700" strokeWidth="2" strokeDasharray="5,5" />
          
          <line x1={bridgePlan.centerline[0].x} y1={-bridgePlan.centerline[0].y}
                x2={bridgePlan.centerline[1].x} y2={-bridgePlan.centerline[1].y}
                stroke="#FF0000" strokeWidth="2" strokeDasharray="10,5" />
          <text x={(bridgePlan.centerline[0].x + bridgePlan.centerline[1].x) / 2} y={-bridgePlan.centerline[0].y + 15}
                fontFamily="Arial" fontSize="10" fill="#FF0000" textAnchor="middle">℄ OF BRIDGE</text>
          
          {bridgePlan.piersInPlan.map((pier, index) => (
            <g key={`pier-plan-${index}`}>
              <polygon points={pier.points.map(p => `${p.x},${-p.y}`).join(' ')} 
                       fill="#8B4513" stroke="#654321" strokeWidth="2" />
              <text x={(pier.points[0].x + pier.points[2].x) / 2} y={-bridgePlan.centerline[0].y} 
                    fontFamily="Arial" fontSize="10" fill="#000" textAnchor="middle">
                P{index + 1}
              </text>
            </g>
          ))}
          
          {bridgePlan.abutmentsInPlan.map((abutment, index) => (
            <polygon key={`abutment-plan-${index}`} points={abutment.points.map(p => `${p.x},${-p.y}`).join(' ')} 
                     fill="#696969" stroke="#2F4F4F" strokeWidth="2" />
          ))}
          
          {bridgePlan.dimensions.map((dim, index) => (
            <g key={`plan-dimension-${index}`}>
              <line x1={dim.start.x} y1={-dim.start.y} x2={dim.end.x} y2={-dim.end.y} 
                    stroke="#FF6600" strokeWidth="1" markerStart="url(#dimArrow)" markerEnd="url(#dimArrow)" />
              <text x={(dim.start.x + dim.end.x) / 2} y={-dim.start.y - 5} 
                    fontFamily="Arial" fontSize="10" fill="#FF6600" textAnchor="middle" fontWeight="bold">
                {dim.value}
              </text>
            </g>
          ))}
        </g>

        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#333"/>
          </marker>
          <marker id="dimArrow" markerWidth="8" markerHeight="6" refX="4" refY="3" orient="auto">
            <polygon points="0 1, 6 3, 0 5" fill="#FF6600"/>
          </marker>
        </defs>
      </svg>
    </div>
  );

  const renderDetailsView = () => (
    <div className="space-y-6">
      {/* Bridge Design Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{completeBridgeDesign.nspan}</div>
              <div className="text-sm text-gray-600">Number of Spans</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{completeBridgeDesign.lbridge.toFixed(1)}m</div>
              <div className="text-sm text-gray-600">Total Length</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{completeBridgeDesign.deckDetails.thickness}m</div>
              <div className="text-sm text-gray-600">Deck Thickness</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{parameters.skew}°</div>
              <div className="text-sm text-gray-600">Skew Angle</div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* LISP-based Parameters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Bridge Parameters (From LISP System)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium">Scale 1 (Plan/Elevation):</span>
              <div className="text-blue-600 font-mono">1:{parameters.scale1}</div>
            </div>
            <div>
              <span className="font-medium">Scale 2 (Sections):</span>
              <div className="text-blue-600 font-mono">1:{parameters.scale2}</div>
            </div>
            <div>
              <span className="font-medium">Datum Level:</span>
              <div className="text-blue-600 font-mono">{parameters.datum} m</div>
            </div>
            <div>
              <span className="font-medium">Top RL:</span>
              <div className="text-blue-600 font-mono">{parameters.toprl} m</div>
            </div>
            <div>
              <span className="font-medium">Left Chainage:</span>
              <div className="text-blue-600 font-mono">{parameters.left} m</div>
            </div>
            <div>
              <span className="font-medium">Right Chainage:</span>
              <div className="text-blue-600 font-mono">{parameters.right} m</div>
            </div>
            <div>
              <span className="font-medium">X Increment:</span>
              <div className="text-blue-600 font-mono">{parameters.xincr} m</div>
            </div>
            <div>
              <span className="font-medium">Y Increment:</span>
              <div className="text-blue-600 font-mono">{parameters.yincr} m</div>
            </div>
            <div>
              <span className="font-medium">No. of Chainages:</span>
              <div className="text-blue-600 font-mono">{parameters.noch}</div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Structural Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Structural Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Deck Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Thickness:</span>
                  <span className="font-mono">{completeBridgeDesign.deckDetails.thickness} m</span>
                </div>
                <div className="flex justify-between">
                  <span>C/C Bridge Width:</span>
                  <span className="font-mono">{completeBridgeDesign.deckDetails.centerToCenterBridge} m</span>
                </div>
                <div className="flex justify-between">
                  <span>Slab Thickness (Center):</span>
                  <span className="font-mono">{completeBridgeDesign.deckDetails.slabThickness.center} m</span>
                </div>
                <div className="flex justify-between">
                  <span>Slab Thickness (Edge):</span>
                  <span className="font-mono">{completeBridgeDesign.deckDetails.slabThickness.edge} m</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">Kerb Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Kerb Width:</span>
                  <span className="font-mono">{completeBridgeDesign.kerbDetails.width} m</span>
                </div>
                <div className="flex justify-between">
                  <span>Kerb Depth:</span>
                  <span className="font-mono">{completeBridgeDesign.kerbDetails.depth} m</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Span Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Span Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {completeBridgeDesign.spans.map((span, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <h5 className="font-semibold">Span {index + 1}</h5>
                  <Badge variant="outline">{span.span.toFixed(1)} m</Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Foundation Top RL:</span>
                    <div className="font-mono">{span.futrl} m</div>
                  </div>
                  <div>
                    <span className="font-medium">Foundation Depth:</span>
                    <div className="font-mono">{span.futd} m</div>
                  </div>
                  <div>
                    <span className="font-medium">Foundation Width:</span>
                    <div className="font-mono">{span.futw} m</div>
                  </div>
                  <div>
                    <span className="font-medium">Foundation Length:</span>
                    <div className="font-mono">{span.futl} m</div>
                  </div>
                </div>
                {span.pier && (
                  <div className="mt-3 pt-3 border-t">
                    <h6 className="font-medium mb-2">Pier Details</h6>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span>Cap Top:</span>
                        <div className="font-mono">{span.pier.capT} m</div>
                      </div>
                      <div>
                        <span>Cap Bottom:</span>
                        <div className="font-mono">{span.pier.capB} m</div>
                      </div>
                      <div>
                        <span>Cap Width:</span>
                        <div className="font-mono">{span.pier.capW} m</div>
                      </div>
                      <div>
                        <span>Pier Top Width:</span>
                        <div className="font-mono">{span.pier.pierTW} m</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <DraftingCompass className="mr-2 h-5 w-5 text-primary" />
            Bridge General Arrangement Drawing (GAD)
            {isGenerating && (
              <Badge variant="secondary" className="ml-3 animate-pulse">
                <CheckCircle className="mr-1 h-3 w-3" />
                Generated
              </Badge>
            )}
          </CardTitle>
          
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => setZoom(Math.min(150, zoom + 25))}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            
            <Button variant="outline" size="sm" onClick={() => setZoom(Math.max(50, zoom - 25))}>
              <RotateCcw className="h-4 w-4" />
            </Button>
            
            <Button variant="outline" size="sm" onClick={() => setZoom(100)}>
              <Expand className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div>
            Bridge Length: {(parameters.right - parameters.left).toFixed(1)}m | 
            Height: {(parameters.toprl - parameters.datum).toFixed(1)}m |
            Scale: {zoom}%
          </div>
          <Badge variant="outline">Drawing Standards: BS 1192</Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="elevation" className="flex items-center">
              <Building className="mr-2 h-4 w-4" />
              ELEVATION
            </TabsTrigger>
            <TabsTrigger value="plan" className="flex items-center">
              <Map className="mr-2 h-4 w-4" />
              PLAN VIEW
            </TabsTrigger>
            <TabsTrigger value="details" className="flex items-center">
              <Layers className="mr-2 h-4 w-4" />
              DETAILS
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="elevation" className="mt-0">
            {renderElevationView()}
          </TabsContent>
          
          <TabsContent value="plan" className="mt-0">
            {renderPlanView()}
          </TabsContent>
          
          <TabsContent value="details" className="mt-0">
            {renderDetailsView()}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
