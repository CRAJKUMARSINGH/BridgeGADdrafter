import type { BridgeParameters } from "./bridge-calculations";

export interface DWGExportOptions {
  paperSize: "A4" | "A3" | "A2";
  orientation: "landscape" | "portrait";
  scale: number;
  includeDimensions: boolean;
  includeTitleBlock: boolean;
  includeGrid: boolean;
  includeCrossSection?: boolean; // mirror cs()
  useTextStyle?: boolean; // mirror st()
  includeDetailedPier?: boolean; // enhanced pier() geometry
  includeDetailedAbutment?: boolean; // enhanced abt1() geometry
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
    // Apply minimal defaults only when missing, without overwriting provided values
    return {
      ...params,
      scale1: params.scale1 ?? 100,
      scale2: params.scale2 ?? 50,
      datum: params.datum ?? 0,
      left: params.left ?? 0,
      right: params.right ?? 100,
      toprl: params.toprl ?? 10,
      xincr: params.xincr ?? 10,
      yincr: params.yincr ?? 2,
      skew: params.skew ?? 0,
      noch: params.noch ?? 0,
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

    // Optional text style akin to st()
    if (options.useTextStyle) {
      this.applyTextStyle(commands);
    }

    // Add drawing elements here
    if (options.includeGrid) {
      this.drawGrid(commands);
    }
    
    // Add bridge components (to be implemented)
    if (options.includeDetailedPier) {
      this.drawDetailedPiers(commands);
    } else {
      this.drawBridge(commands);
    }

    if (options.includeDetailedAbutment) {
      this.drawDetailedAbutments(commands);
      if (options.includeDimensions) {
        this.drawAbutmentDimensions(commands);
      }
    }

    // Dimensions and annotations
    if (options.includeDimensions) {
      this.drawDimensions(commands);
    }

    // Optional: Cross-section plotting similar to cs()
    if (options.includeCrossSection) {
      this.drawCrossSection(commands);
    }

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

  // Add dimension annotations approximating LISP layout/pier dimensions
  private drawDimensions(commands: string[]) {
    const { left, right, datum, toprl } = this.parameters;
    const bridgeLength = right - left;

    const deckY = toprl; // Using toprl as deck line for this placeholder
    const parapetHeight = 1.2;

    // Overall bridge length dimension above deck
    const dimOffset = 2.0; // meters above deck for text baseline
    commands.push(
      ...this.drawLine(left, deckY + dimOffset, right, deckY + dimOffset, "DIMENSIONS", 3, 0.15)
    );
    commands.push(
      ...this.drawText((left + right) / 2, deckY + dimOffset + 0.5, `L = ${bridgeLength.toFixed(0)} m`, 2.5, "DIMENSIONS", 3, 0)
    );

    // Vertical dimension at left: datum to deck and total height (deck + parapet down to datum)
    commands.push(
      ...this.drawLine(left - 1.0, datum, left - 1.0, deckY + parapetHeight, "DIMENSIONS", 3, 0.15)
    );
    commands.push(
      ...this.drawText(left - 0.8, (datum + deckY) / 2, `${(deckY - datum).toFixed(2)} m`, 2.0, "DIMENSIONS", 3, 90)
    );
    commands.push(
      ...this.drawText(left - 1.2, (datum + deckY + parapetHeight) / 2, `H ${(deckY + parapetHeight - datum).toFixed(2)} m`, 2.0, "DIMENSIONS", 3, 90)
    );

    // Span breakdown: assume nominal span length to place intermediate markers
    const nominalSpan = 30; // meters
    const pierCount = Math.max(0, Math.floor(bridgeLength / nominalSpan) - 1);
    if (pierCount > 0) {
      const spacing = bridgeLength / (pierCount + 1);
      let prev = left;
      for (let i = 1; i <= pierCount; i++) {
        const x = left + spacing * i;
        // Tick at pier
        commands.push(...this.drawLine(x, deckY - 0.5, x, deckY + 0.5, "DIMENSIONS", 3, 0.15));
        // Span dimension text between previous and current
        const mid = (prev + x) / 2;
        commands.push(
          ...this.drawText(mid, deckY + dimOffset - 0.5, `${(x - prev).toFixed(0)} m`, 2.0, "DIMENSIONS", 3, 0)
        );
        prev = x;
      }
      // Last span text
      const midLast = (prev + right) / 2;
      commands.push(
        ...this.drawText(midLast, deckY + dimOffset - 0.5, `${(right - prev).toFixed(0)} m`, 2.0, "DIMENSIONS", 3, 0)
      );
    }
  }

  // Detailed pier geometry inspired by LISP pier(): cap, stem with batter, footing
  private drawDetailedPiers(commands: string[]) {
    const { left, right, datum, toprl } = this.parameters;
    const bridgeLength = right - left;
    const nominalSpan = 30; // meters
    const pierCount = Math.max(0, Math.floor(bridgeLength / nominalSpan) - 1);
    if (pierCount <= 0) return;

    const spacing = bridgeLength / (pierCount + 1);

    // Nominal levels/thicknesses (meters) approximating LISP variables
    const deckY = toprl;
    const capTop = deckY - 0.5; // cap top below deck
    const capBottom = capTop - 0.8; // cap depth
    const capWidth = 3.5; // over pier
    const pierTopWidth = 1.8; // piertw
    const batterRatio = 8; // horizontal:vertical (approx from LISP battr)
    const stemHeight = 6.0; // from cap bottom to top of footing
    const footingTop = datum - 1.0;
    const footingDepth = 2.0;
    const footingWidth = 4.0;

    for (let i = 1; i <= pierCount; i++) {
      const xc = left + spacing * i;

      // Cap rectangle
      const capHalf = capWidth / 2;
      commands.push(
        ...this.drawLine(xc - capHalf, capTop, xc + capHalf, capTop, "PIER", 6, 0.25),
        ...this.drawLine(xc + capHalf, capTop, xc + capHalf, capBottom, "PIER", 6, 0.25),
        ...this.drawLine(xc + capHalf, capBottom, xc - capHalf, capBottom, "PIER", 6, 0.25),
        ...this.drawLine(xc - capHalf, capBottom, xc - capHalf, capTop, "PIER", 6, 0.25)
      );

      // Stem with batter (trapezoid)
      const halfTop = pierTopWidth / 2;
      const stemBottomY = Math.max(footingTop, capBottom - stemHeight);
      const vertical = capBottom - stemBottomY;
      const batterOffset = vertical / batterRatio; // each side
      const x1 = xc - halfTop - batterOffset; // bottom left
      const x2 = xc + halfTop + batterOffset; // bottom right
      const yTop = capBottom;
      const yBot = stemBottomY;
      commands.push(
        ...this.drawLine(xc - halfTop, yTop, xc + halfTop, yTop, "PIER", 6, 0.25),
        ...this.drawLine(xc + halfTop, yTop, x2, yBot, "PIER", 6, 0.25),
        ...this.drawLine(x2, yBot, x1, yBot, "PIER", 6, 0.25),
        ...this.drawLine(x1, yBot, xc - halfTop, yTop, "PIER", 6, 0.25)
      );

      // Footing rectangle centered under stem
      const footHalf = footingWidth / 2;
      const ftTop = footingTop;
      const ftBot = footingTop - footingDepth;
      commands.push(
        ...this.drawLine(xc - footHalf, ftTop, xc + footHalf, ftTop, "FOUNDATION", 94, 0.25),
        ...this.drawLine(xc + footHalf, ftTop, xc + footHalf, ftBot, "FOUNDATION", 94, 0.25),
        ...this.drawLine(xc + footHalf, ftBot, xc - footHalf, ftBot, "FOUNDATION", 94, 0.25),
        ...this.drawLine(xc - footHalf, ftBot, xc - footHalf, ftTop, "FOUNDATION", 94, 0.25)
      );

      // Labels
      commands.push(
        ...this.drawText(xc, capTop + 0.3, `PIER ${i}`, 2.0, "TEXT", 7, 0)
      );
    }
  }

  // Detailed abutment geometry inspired by LISP abt1(): multi-segment face and footing
  private drawDetailedAbutments(commands: string[]) {
    const { left, right, datum, toprl } = this.parameters;
    const deckY = toprl;

    // Parameters approximating abutment: dimensions in meters
    const capTop = deckY - 0.4;
    const capBottom = capTop - 0.6;
    const faceStep1 = capBottom - 1.2;
    const faceStep2 = faceStep1 - 1.0;
    const dirtWallThickness = 0.5;
    const offset1 = 1.2; // horizontal offsets creating batter segments
    const offset2 = 0.8;
    const footProj = 1.0; // plan projection along skew notionally
    const footThickness = 0.8;

    const drawAbutmentAt = (xEdge: number, isLeft: boolean) => {
      const sign = isLeft ? -1 : 1;
      // Key X positions
      const x0 = xEdge;                                 // roadway edge
      const x1 = x0 + sign * dirtWallThickness;         // dirt wall outer
      const x2 = x1 + sign * offset1;                   // batter 1
      const x3 = x2 + sign * offset2;                   // batter 2

      // Vertical points along face
      const y0 = capTop;
      const y1 = capBottom;
      const y2 = faceStep1;
      const y3 = faceStep2;

      // Footing rectangle under bottom segment
      const footTop = y3 - 0.5;
      const footBot = footTop - footThickness;
      const footIn = x3;                                 // inner
      const footOut = x3 + sign * (footProj + dirtWallThickness);

      // Draw cap face (small rectangle at top)
      commands.push(
        ...this.drawLine(x0, y0, x0, y1, "ABUTMENT", 5, 0.25),
        ...this.drawLine(x0, y1, x1, y1, "ABUTMENT", 5, 0.25),
        ...this.drawLine(x1, y1, x1, y0, "ABUTMENT", 5, 0.25),
        ...this.drawLine(x1, y0, x0, y0, "ABUTMENT", 5, 0.25)
      );

      // Main abutment stepped/battered face
      commands.push(
        ...this.drawLine(x1, y1, x2, y2, "ABUTMENT", 5, 0.25),
        ...this.drawLine(x2, y2, x3, y3, "ABUTMENT", 5, 0.25)
      );

      // Close back to roadway level for clarity
      commands.push(
        ...this.drawLine(x3, y3, x3, footTop, "ABUTMENT", 5, 0.25)
      );

      // Footing
      commands.push(
        ...this.drawLine(footIn, footTop, footOut, footTop, "FOUNDATION", 94, 0.25),
        ...this.drawLine(footOut, footTop, footOut, footBot, "FOUNDATION", 94, 0.25),
        ...this.drawLine(footOut, footBot, footIn, footBot, "FOUNDATION", 94, 0.25),
        ...this.drawLine(footIn, footBot, footIn, footTop, "FOUNDATION", 94, 0.25)
      );

      // Labels
      const labelX = x1 + sign * 0.6;
      const labelY = y1 + 0.3;
      commands.push(...this.drawText(labelX, labelY, isLeft ? 'ABUT L' : 'ABUT R', 2.0, "TEXT", 7, 0));
    };

    // Left abutment at left edge
    drawAbutmentAt(left, true);
    // Right abutment at right edge
    drawAbutmentAt(right, false);
  }

  // Dimension annotations for abutments (heights, footing thickness, offsets)
  private drawAbutmentDimensions(commands: string[]) {
    const { left, right, toprl } = this.parameters;
    const deckY = toprl;
    // Match the geometry assumptions in drawDetailedAbutments
    const capTop = deckY - 0.4;
    const capBottom = capTop - 0.6;
    const faceStep1 = capBottom - 1.2;
    const faceStep2 = faceStep1 - 1.0;
    const footTop = faceStep2 - 0.5;
    const footBot = footTop - 0.8;

    const annotateAt = (x: number, isLeft: boolean) => {
      const sign = isLeft ? -1 : 1;
      const xDim = x + sign * 2.0; // offset for dimension text

      // Cap depth
      commands.push(
        ...this.drawLine(xDim, capTop, xDim, capBottom, "DIMENSIONS", 3, 0.15),
        ...this.drawText(xDim + sign * 0.2, (capTop + capBottom) / 2, `Cap ${Math.abs(capTop - capBottom).toFixed(2)} m`, 2.0, "DIMENSIONS", 3, 90)
      );

      // Stem height (cap bottom to faceStep2)
      commands.push(
        ...this.drawLine(xDim + sign * 0.6, capBottom, xDim + sign * 0.6, faceStep2, "DIMENSIONS", 3, 0.15),
        ...this.drawText(xDim + sign * 0.8, (capBottom + faceStep2) / 2, `${Math.abs(capBottom - faceStep2).toFixed(2)} m`, 2.0, "DIMENSIONS", 3, 90)
      );

      // Footing thickness
      commands.push(
        ...this.drawLine(xDim + sign * 1.2, footTop, xDim + sign * 1.2, footBot, "DIMENSIONS", 3, 0.15),
        ...this.drawText(xDim + sign * 1.4, (footTop + footBot) / 2, `Footing ${Math.abs(footTop - footBot).toFixed(2)} m`, 2.0, "DIMENSIONS", 3, 90)
      );
    };

    annotateAt(left, true);
    annotateAt(right, false);
  }

  // Mimic a basic text style setup (st): approximate via STYLE entity in DXF stream
  private applyTextStyle(commands: string[]) {
    // STYLE entity (very simplified) to set a default text height/font hint
    commands.push(
      '0','STYLE',
      '2','Arial', // style name
      '3','Arial', // primary font file name hint
      '40','0.0',  // fixed height 0 => variable
      '41','1.0',  // width factor
      '50','0.0',  // oblique angle
      '71','0',    // flags
      '42','2.5'   // last height used
    );
  }

  // Draw cross-section (cs) using parameters.crossSection if available
  private drawCrossSection(commands: string[]) {
    const { crossSection, datum, left, xincr } = this.parameters as any;
    if (!crossSection || !Array.isArray(crossSection) || crossSection.length === 0) return;

    const d4 = 40; // matches layout() spacing multipliers notionally
    const d5 = d4 - 2;
    const d6 = 20 + 2;
    const d7 = 20 - 2;

    for (const pt of crossSection) {
      const x = pt.x;
      const y = pt.y;
      const xx = this.hpos(x);

      // main projection line from near datum up to datum
      commands.push(...this.drawLine(x, datum - 2, x, datum, "CS_GRID", 8, 0.15));

      // grid ticks similar to cs() conditional on xincr spacing
      const b = (x - left) % xincr;
      if (Math.abs(b) > 1e-6) {
        // chainage text
        commands.push(
          ...this.drawText(x, datum - (d4 / 10), x.toFixed(3), 1.8, "DIMENSIONS", 7, 90)
        );
        // tick lines
        commands.push(...this.drawLine(x, datum - (d4 / 10), x, datum - (d5 / 10), "CS_GRID", 8, 0.15));
        commands.push(...this.drawLine(x, datum - (d6 / 10), x, datum - (d7 / 10), "CS_GRID", 8, 0.15));
      }
      // vertical from slightly below to RL
      commands.push(...this.drawLine(x, datum - 2, x, y, "CS_PROFILE", 7, 0.25));
    }

    // Connect the river bed profile
    for (let i = 1; i < crossSection.length; i++) {
      const p0 = crossSection[i - 1];
      const p1 = crossSection[i];
      commands.push(...this.drawLine(p0.x, p0.y, p1.x, p1.y, "CS_PROFILE", 7, 0.35));
    }
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
