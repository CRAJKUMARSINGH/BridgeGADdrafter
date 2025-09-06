import type { BridgeParameters } from "./bridge-calculations";

export interface DWGExportOptions {
  paperSize: "A4" | "A3" | "A2";
  orientation: "landscape" | "portrait";
  scale: number;
  includeDimensions: boolean;
  includeTitleBlock: boolean;
  includeGrid: boolean;
}

export class DWGGenerator {
  private parameters: BridgeParameters;
  private scale: number = 1;
  private skewAngle: number = 0;
  private skewSin: number = 0;
  private skewCos: number = 1;
  
  // Scale factors (from LISP code)
  private hhs: number = 1;  // Horizontal scale
  private vvs: number = 1;  // Vertical scale

  constructor(parameters: BridgeParameters) {
    this.parameters = this.initializeParameters(parameters);
  }

  private initializeParameters(params: BridgeParameters): BridgeParameters {
    // Set default values
    return {
      scale1: 100,
      datum: 0,
      left: 0,
      right: 100,
      toprl: 0,
      xincr: 10,
      yincr: 2,
      skew: 0,
      noch: 0,
      ...params
    };
  }

  // Convert coordinates (from LISP hpos/vpos functions)
  private hpos(x: number): number {
    return (x - this.parameters.left) * this.scale * this.hhs;
  }

  private vpos(y: number): number {
    return (y - this.parameters.datum) * this.scale * this.vvs;
  }

  // Apply skew transformation
  private applySkew(x: number, y: number): { x: number; y: number } {
    if (this.skewAngle === 0) return { x: this.hpos(x), y: this.vpos(y) };
    
    const x1 = x * this.skewCos - y * this.skewSin;
    const y1 = x * this.skewSin + y * this.skewCos;
    
    return { x: this.hpos(x1), y: this.vpos(y1) };
  }

  // Draw line with skew support
  private drawLine(
    x1: number, y1: number,
    x2: number, y2: number,
    layer: string = "0",
    color: number = 7,
    lineweight: number = 0.25
  ): string[] {
    const p1 = this.applySkew(x1, y1);
    const p2 = this.applySkew(x2, y2);
    
    return [
      '0', 'LINE',
      '8', layer,
      '62', color.toString(),
      '370', Math.round(lineweight * 100).toString(),
      '10', p1.x.toFixed(2),
      '20', p1.y.toFixed(2),
      '11', p2.x.toFixed(2),
      '21', p2.y.toFixed(2)
    ];
  }

  // Draw text with skew support
  private drawText(
    x: number, y: number,
    text: string,
    height: number = 2.5,
    layer: string = "TEXT",
    color: number = 7,
    angle: number = 0
  ): string[] {
    const pos = this.applySkew(x, y);
    const rotation = angle + this.parameters.skew;
    
    return [
      '0', 'TEXT',
      '8', layer,
      '62', color.toString(),
      '10', pos.x.toFixed(2),
      '20', pos.y.toFixed(2),
      '40', height.toFixed(2),
      '1', text,
      '50', rotation.toFixed(2)
    ];
  }

  // Generate DWG content
  generateDWG(options: DWGExportOptions): { commands: string[] } {
    this.scale = options.scale;
    const commands: string[] = ['0', 'SECTION', '2', 'ENTITIES'];

    // Add drawing elements here
    if (options.includeGrid) {
      this.drawGrid(commands);
    }
    
    // Add bridge components (to be implemented)
    this.drawBridge(commands);

    // Close the section
    commands.push('0', 'ENDSEC', '0', 'EOF');
    return { commands };
  }

  // Draw grid based on xincr/yincr
  private drawGrid(commands: string[]) {
    const { left, right, datum, toprl, xincr, yincr } = this.parameters;
    
    // Vertical grid lines
    for (let x = Math.ceil(left / xincr) * xincr; x <= right; x += xincr) {
      commands.push(...this.drawLine(x, datum - 10, x, toprl + 5, "GRID", 8, 0.15));
      if (x > left && x < right) {
        commands.push(...this.drawText(x, datum - 2, x.toString(), 1.8, "DIMENSIONS"));
      }
    }
    
    // Horizontal grid lines
    for (let y = Math.ceil(datum / yincr) * yincr; y <= toprl; y += yincr) {
      commands.push(...this.drawLine(left - 5, y, right + 5, y, "GRID", 8, 0.15));
      if (y > datum) {
        commands.push(...this.drawText(left - 2, y, y.toString(), 1.8, "DIMENSIONS", 7, 90));
      }
    }
  }

  // Draw comprehensive bridge components (from LISP pier() function)
  private drawBridge(commands: string[]) {
    const { left, right, toprl, datum } = this.parameters;
    const bridgeLength = right - left;
    const nspan = Math.max(1, Math.floor(bridgeLength / 30)); // 30m spans
    const spanLength = bridgeLength / nspan;
    
    // Bridge deck (main structural element)
    const deckLevel = toprl - 1.5;
    const deckThickness = 0.8;
    commands.push(...this.drawLine(left, deckLevel, right, deckLevel, "BRIDGE_DECK", 1, 0.8));
    commands.push(...this.drawLine(left, deckLevel - deckThickness, right, deckLevel - deckThickness, "BRIDGE_DECK", 1, 0.8));
    commands.push(...this.drawLine(left, deckLevel, left, deckLevel - deckThickness, "BRIDGE_DECK", 1, 0.8));
    commands.push(...this.drawLine(right, deckLevel, right, deckLevel - deckThickness, "BRIDGE_DECK", 1, 0.8));
    
    // Draw piers based on spans
    for (let i = 1; i < nspan; i++) {
      const pierChainage = left + (spanLength * i);
      this.drawPier(commands, pierChainage, deckLevel, datum);
    }
    
    // Draw abutments
    this.drawAbutment(commands, left, deckLevel, datum, "LEFT");
    this.drawAbutment(commands, right, deckLevel, datum, "RIGHT");
    
    // Draw superstructure (parapet)
    const parapetHeight = 1.2;
    commands.push(...this.drawLine(left, deckLevel + parapetHeight, right, deckLevel + parapetHeight, "PARAPET", 2, 0.5));
    
    // Add span dimensions (from LISP DIMLINEAR)
    this.addSpanDimensions(commands, left, right, deckLevel + 3, nspan, spanLength);
  }
  
  // Draw pier (from LISP pier() function logic)
  private drawPier(commands: string[], chainage: number, deckLevel: number, datum: number) {
    const pierWidth = 1.8; // 1.8m pier width
    const capWidth = 2.2;  // 2.2m cap width
    const capHeight = 0.5; // 500mm cap height
    const foundationLevel = datum - 3;
    const foundationWidth = 3.5;
    const foundationDepth = 2.5;
    
    // Pier cap
    const capLeft = chainage - capWidth / 2;
    const capRight = chainage + capWidth / 2;
    const capTop = deckLevel - 0.2;
    const capBottom = capTop - capHeight;
    
    commands.push(...this.drawLine(capLeft, capTop, capRight, capTop, "PIER_CAP", 3, 0.7));
    commands.push(...this.drawLine(capLeft, capBottom, capRight, capBottom, "PIER_CAP", 3, 0.7));
    commands.push(...this.drawLine(capLeft, capTop, capLeft, capBottom, "PIER_CAP", 3, 0.7));
    commands.push(...this.drawLine(capRight, capTop, capRight, capBottom, "PIER_CAP", 3, 0.7));
    
    // Pier stem
    const pierLeft = chainage - pierWidth / 2;
    const pierRight = chainage + pierWidth / 2;
    
    commands.push(...this.drawLine(pierLeft, capBottom, pierLeft, foundationLevel, "PIER_STEM", 4, 0.6));
    commands.push(...this.drawLine(pierRight, capBottom, pierRight, foundationLevel, "PIER_STEM", 4, 0.6));
    
    // Pier foundation
    const foundLeft = chainage - foundationWidth / 2;
    const foundRight = chainage + foundationWidth / 2;
    const foundTop = foundationLevel;
    const foundBottom = foundationLevel - foundationDepth;
    
    commands.push(...this.drawLine(foundLeft, foundTop, foundRight, foundTop, "FOUNDATION", 6, 0.8));
    commands.push(...this.drawLine(foundLeft, foundBottom, foundRight, foundBottom, "FOUNDATION", 6, 0.8));
    commands.push(...this.drawLine(foundLeft, foundTop, foundLeft, foundBottom, "FOUNDATION", 6, 0.8));
    commands.push(...this.drawLine(foundRight, foundTop, foundRight, foundBottom, "FOUNDATION", 6, 0.8));
    
    // Add pier dimensions
    commands.push(...this.drawText(chainage + 1, (capTop + capBottom) / 2, `${capWidth}m`, 1.5, "DIMENSIONS", 7, 0));
    commands.push(...this.drawText(chainage + 2, (foundTop + foundBottom) / 2, `${foundationWidth}m`, 1.2, "DIMENSIONS", 7, 0));
  }
  
  // Draw abutment (from LISP abutment logic)
  private drawAbutment(commands: string[], chainage: number, deckLevel: number, datum: number, side: "LEFT" | "RIGHT") {
    const abutmentWidth = 2.5;
    const abutmentHeight = deckLevel - datum;
    const direction = side === "LEFT" ? -1 : 1;
    
    const abutLeft = side === "LEFT" ? chainage - abutmentWidth : chainage;
    const abutRight = side === "LEFT" ? chainage : chainage + abutmentWidth;
    
    // Abutment wall
    commands.push(...this.drawLine(abutLeft, datum, abutRight, datum, "ABUTMENT", 5, 0.7));
    commands.push(...this.drawLine(abutLeft, deckLevel, abutRight, deckLevel, "ABUTMENT", 5, 0.7));
    commands.push(...this.drawLine(abutLeft, datum, abutLeft, deckLevel, "ABUTMENT", 5, 0.7));
    commands.push(...this.drawLine(abutRight, datum, abutRight, deckLevel, "ABUTMENT", 5, 0.7));
    
    // Abutment dimension
    commands.push(...this.drawText(chainage + direction * 1.5, (datum + deckLevel) / 2, `${abutmentHeight.toFixed(1)}m`, 1.2, "DIMENSIONS", 7, 90));
  }
  
  // Add comprehensive span dimensions (from LISP DIMLINEAR commands)
  private addSpanDimensions(commands: string[], left: number, right: number, level: number, nspan: number, spanLength: number) {
    // Overall bridge length
    const totalLength = right - left;
    commands.push(...this.drawText((left + right) / 2, level, `Total: ${totalLength.toFixed(0)}m`, 2.0, "DIMENSIONS", 1, 0));
    
    // Individual span dimensions
    for (let i = 0; i < nspan; i++) {
      const spanStart = left + (spanLength * i);
      const spanEnd = left + (spanLength * (i + 1));
      const spanCenter = (spanStart + spanEnd) / 2;
      
      commands.push(...this.drawText(spanCenter, level - 1, `Span ${i + 1}: ${spanLength.toFixed(0)}m`, 1.5, "DIMENSIONS", 7, 0));
    }
  }

  // Add cross-section drawing (from LISP cs() function)
  addCrossSection(commands: string[], crossSectionData: Array<{ chainage: number; level: number }>) {
    if (crossSectionData.length < 2) return;
    
    // Draw cross-section line
    for (let i = 1; i < crossSectionData.length; i++) {
      const prev = crossSectionData[i - 1];
      const curr = crossSectionData[i];
      
      commands.push(...this.drawLine(
        prev.chainage, prev.level,
        curr.chainage, curr.level,
        "CROSS_SECTION", 6, 0.6
      ));
    }
    
    // Add chainage and level markers (based on LISP text commands)
    crossSectionData.forEach((point, index) => {
      const { xincr } = this.parameters;
      const chainageRemainder = (point.chainage - this.parameters.left) % xincr;
      
      // Only mark chainages that are not on grid increments (as per LISP logic)
      if (Math.abs(chainageRemainder) > 0.01) {
        const chainageStr = this.formatChainage(point.chainage);
        const levelStr = point.level.toFixed(3);
        
        commands.push(...this.drawText(
          point.chainage + 0.5, point.level - 1,
          chainageStr,
          1.8, "DIMENSIONS", 7, 90
        ));
        
        commands.push(...this.drawText(
          point.chainage + 0.5, point.level - 2,
          levelStr,
          1.8, "DIMENSIONS", 7, 90
        ));
      }
    });
  }
  
  // Format chainage display (e.g., 0+015)
  private formatChainage(chainage: number): string {
    const km = Math.floor(chainage / 1000);
    const m = chainage % 1000;
    return `${km}+${m.toFixed(0).padStart(3, '0')}`;
  }
}

// Export a simple function to generate DWG
// Enhanced bridge-specific DWG generation with Excel support
export function generateBridgeDWG(
  parameters: BridgeParameters,
  options: DWGExportOptions,
  crossSectionData?: Array<{ chainage: number; level: number }>
): { 
  commands: string[];
  layers: Array<{ name: string; color: number; lineweight: number }>;
  dimensions: Array<{ start: [number, number]; end: [number, number]; text: string }>;
} {
  const generator = new DWGGenerator(parameters);
  
  // Enhanced DWG with cross-section support
  const result = generator.generateDWG(options);
  
  // Add cross-section if provided (from Excel Sheet2)
  if (crossSectionData && crossSectionData.length > 0) {
    generator.addCrossSection(result.commands, crossSectionData);
  }
  
  // Layer definitions (from LISP layer setup)
  const layers = [
    { name: "BRIDGE_DECK", color: 1, lineweight: 0.8 },
    { name: "PIER_CAP", color: 3, lineweight: 0.7 },
    { name: "PIER_STEM", color: 4, lineweight: 0.6 },
    { name: "ABUTMENT", color: 5, lineweight: 0.7 },
    { name: "FOUNDATION", color: 6, lineweight: 0.8 },
    { name: "PARAPET", color: 2, lineweight: 0.5 },
    { name: "GRID", color: 8, lineweight: 0.15 },
    { name: "DIMENSIONS", color: 7, lineweight: 0.25 }
  ];
  
  // Extract dimensions for separate handling
  const dimensions = [];
  const totalLength = parameters.right - parameters.left;
  dimensions.push({
    start: [parameters.left, parameters.toprl + 3] as [number, number],
    end: [parameters.right, parameters.toprl + 3] as [number, number],
    text: `${totalLength.toFixed(0)}m`
  });
  
  return { commands: result.commands, layers, dimensions };
}

export function generateDWG(
  parameters: BridgeParameters,
  options: DWGExportOptions
): { commands: string[] } {
  const generator = new DWGGenerator(parameters);
  return generator.generateDWG(options);
}

// Process Excel input for bridge parameters (from app.py integration)
export function processExcelToBridgeParameters(excelData: any): {
  parameters: BridgeParameters;
  crossSectionData?: Array<{ chainage: number; level: number }>;
} {
  const parameters = processExcelParameters(excelData);
  let crossSectionData: Array<{ chainage: number; level: number }> | undefined;
  
  // Process Sheet2 for cross-section data (if available)
  if (excelData && excelData.Sheet2) {
    crossSectionData = excelData.Sheet2.map((row: any) => ({
      chainage: parseFloat(row.Chainage) || 0,
      level: parseFloat(row.RL) || 0
    })).filter((point: any) => !isNaN(point.chainage) && !isNaN(point.level));
  }
  
  return { parameters, crossSectionData };
}

function processExcelParameters(excelData: any): BridgeParameters {
  const parameterMap: { [key: string]: keyof BridgeParameters } = {
    'SCALE1': 'scale1',
    'SCALE2': 'scale2', 
    'SKEW': 'skew',
    'DATUM': 'datum',
    'TOPRL': 'toprl',
    'LEFT': 'left',
    'RIGHT': 'right',
    'XINCR': 'xincr',
    'YINCR': 'yincr',
    'NOCH': 'noch'
  };

  const parameters: Partial<BridgeParameters> = {};
  
  // Default values
  const defaults: BridgeParameters = {
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
  };

  // Process Excel data if available
  if (excelData && excelData.Sheet1) {
    excelData.Sheet1.forEach((row: any) => {
      const variable = row.Variable?.toString().toUpperCase();
      const value = parseFloat(row.Value);
      
      if (variable && parameterMap[variable] && !isNaN(value)) {
        (parameters as any)[parameterMap[variable]] = value;
      }
    });
  }

  return { ...defaults, ...parameters };
}
