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

  // Draw bridge components (placeholder)
  private drawBridge(commands: string[]) {
    // TODO: Implement bridge deck, piers, abutments based on LISP code
    const { left, right, toprl } = this.parameters;
    
    // Example: Draw bridge deck
    commands.push(...this.drawLine(left, toprl, right, toprl, "BRIDGE_DECK", 7, 0.5));
    
    // Add more bridge components here
  }
}

// Export a simple function to generate DWG
export function generateDWG(
  parameters: BridgeParameters,
  options: DWGExportOptions
): { commands: string[] } {
  const generator = new DWGGenerator(parameters);
  return generator.generateDWG(options);
}
