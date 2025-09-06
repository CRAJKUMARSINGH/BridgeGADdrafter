// Bridge calculation functions based on the original LISP code
export interface BridgeParameters {
  scale1: number;
  scale2: number;
  skew: number;
  datum: number;
  toprl: number;
  left: number;
  right: number;
  xincr: number;
  yincr: number;
  noch: number;
}

export interface CalculatedConstants {
  vvs: number;  // Vertical scale factor
  hhs: number;  // Horizontal scale factor
  skew1: number; // Skew angle in radians
  s: number;    // Sin of skew angle
  c: number;    // Cos of skew angle
  tn: number;   // Tan of skew angle
  sc: number;   // Scale ratio
}

export interface Point2D {
  x: number;
  y: number;
}

export class BridgeCalculator {
  private params: BridgeParameters;
  private constants: CalculatedConstants;

  constructor(parameters: BridgeParameters) {
    this.params = parameters;
    this.constants = this.calculateConstants();
  }

  // Calculate transformation constants (from original reed() function)
  private calculateConstants(): CalculatedConstants {
    const vvs = 1000.0; // Convert meters to millimeters
    const hhs = 1000.0;
    const skew1 = this.params.skew * 0.0174532; // Convert degrees to radians
    const s = Math.sin(skew1);
    const c = Math.cos(skew1);
    const tn = s / c;
    const sc = this.params.scale1 / this.params.scale2;

    return { vvs, hhs, skew1, s, c, tn, sc };
  }

  // Vertical position transformation (from original vpos function)
  vpos(a: number): number {
    // Scale down for display (convert meters to drawing units)
    let result = (a - this.params.datum) * 5; // 5 units per meter for display
    return result;
  }

  // Horizontal position transformation (from original hpos function)
  hpos(a: number): number {
    // Scale down for display (convert meters to drawing units)
    let result = (a - this.params.left) * 2; // 2 units per meter for display
    return result;
  }

  // Vertical position with scale factor (from original v2pos function)
  v2pos(a: number): number {
    let result = this.constants.vvs * (a - this.params.datum);
    result = this.constants.sc * result;
    return this.params.datum + result;
  }

  // Horizontal position with scale factor (from original h2pos function)
  h2pos(a: number): number {
    let result = this.constants.hhs * (a - this.params.left);
    result = this.constants.sc * result;
    return this.params.left + result;
  }

  // Generate layout points (based on original layout() function)
  generateLayoutPoints(): {
    axes: { xAxis: Point2D[]; yAxis: Point2D[]; };
    grid: { xMarks: Array<{ position: Point2D; label: string }>; yMarks: Array<{ position: Point2D; label: string }>; };
    labels: Array<{ position: Point2D; text: string; angle: number }>;
  } {
    // Convert left to integer as in original LISP
    const left = this.params.left - (this.params.left % 1.0);
    const d1 = 20; // Distance between parallel lines in mm

    // Main axis points
    const pta1: Point2D = { x: 0, y: 0 }; // Start at origin
    const pta2: Point2D = { x: this.hpos(this.params.right), y: 0 };
    const ptd1: Point2D = { x: 0, y: this.vpos(this.params.toprl) };

    // X-axis and Y-axis lines
    const xAxis = [pta1, pta2];
    const yAxis = [{ x: 0, y: -(d1 * 2) }, ptd1];

    // Generate X-axis marks (chainages)
    const xMarks: Array<{ position: Point2D; label: string }> = [];
    const noh = this.params.right - this.params.left;
    const xSteps = Math.floor(noh / this.params.xincr);
    
    for (let i = 1; i <= xSteps; i++) {
      const ch = this.params.left + (i * this.params.xincr);
      const position: Point2D = { x: this.hpos(ch), y: 0 };
      const label = this.formatChainage(ch);
      xMarks.push({ position, label });
    }

    // Generate Y-axis marks (levels)
    const yMarks: Array<{ position: Point2D; label: string }> = [];
    const nov = this.params.toprl - this.params.datum;
    const ySteps = Math.floor(nov / this.params.yincr);
    
    for (let i = 0; i <= ySteps; i++) {
      const level = this.params.datum + (i * this.params.yincr);
      const position: Point2D = { x: 0, y: this.vpos(level) };
      const label = level.toFixed(3);
      yMarks.push({ position, label });
    }

    // Labels
    const labels = [
      {
        position: { x: -50, y: -10 },
        text: "BED LEVEL",
        angle: 0
      },
      {
        position: { x: -50, y: -30 },
        text: "CHAINAGE",
        angle: 0
      }
    ];

    return { axes: { xAxis, yAxis }, grid: { xMarks, yMarks }, labels };
  }

  // Format chainage for display (e.g., 0+015)
  private formatChainage(chainage: number): string {
    const km = Math.floor(chainage / 1000);
    const m = chainage % 1000;
    return `${km}+${m.toFixed(0).padStart(3, '0')}`;
  }

  // Generate bridge elevation points (main GAD drawing based on LISP pier() function)
  generateBridgeElevation(): {
    deck: Point2D[];
    piers: Array<{ points: Point2D[]; width: number; height: number; chainage: number }>;
    abutments: Array<{ points: Point2D[]; width: number; height: number }>;
    foundations: Array<{ points: Point2D[]; width: number; depth: number }>;
    superstructure: Point2D[];
    dimensions: Array<{ start: Point2D; end: Point2D; value: string; level: number }>;
  } {
    const bridgeLength = this.params.right - this.params.left;
    const deckLevel = this.params.toprl - 1.5; // Deck level 1.5m below top RL
    const foundationLevel = this.params.datum - 3.0; // Foundation 3m below datum
    const bearingLevel = deckLevel - 0.5; // Bearing level

    // Bridge deck (main structural element)
    const deckThickness = 0.8; // 800mm deck thickness
    const deck: Point2D[] = [
      { x: this.hpos(this.params.left), y: this.vpos(deckLevel) },
      { x: this.hpos(this.params.right), y: this.vpos(deckLevel) },
      { x: this.hpos(this.params.right), y: this.vpos(deckLevel - deckThickness) },
      { x: this.hpos(this.params.left), y: this.vpos(deckLevel - deckThickness) }
    ];

    // Superstructure (parapet and railing)
    const parapetHeight = 1.2; // 1.2m parapet
    const superstructure: Point2D[] = [
      { x: this.hpos(this.params.left), y: this.vpos(deckLevel + parapetHeight) },
      { x: this.hpos(this.params.right), y: this.vpos(deckLevel + parapetHeight) }
    ];

    // Generate piers based on bridge span (realistic pier spacing)
    const piers: Array<{ points: Point2D[]; width: number; height: number; chainage: number }> = [];
    const spanLength = 30; // 30m typical span
    const pierCount = Math.max(0, Math.floor(bridgeLength / spanLength) - 1);
    const pierWidth = 1.8; // 1.8m pier width
    
    if (pierCount > 0) {
      const actualSpacing = bridgeLength / (pierCount + 1);
      
      for (let i = 1; i <= pierCount; i++) {
        const pierChainage = this.params.left + (actualSpacing * i);
        const pierHeight = bearingLevel - foundationLevel;
        const halfWidth = pierWidth / 2;
        
        piers.push({
          points: [
            { x: this.hpos(pierChainage - halfWidth), y: this.vpos(foundationLevel) },
            { x: this.hpos(pierChainage + halfWidth), y: this.vpos(foundationLevel) },
            { x: this.hpos(pierChainage + halfWidth), y: this.vpos(bearingLevel) },
            { x: this.hpos(pierChainage - halfWidth), y: this.vpos(bearingLevel) }
          ],
          width: pierWidth,
          height: pierHeight,
          chainage: pierChainage
        });
      }
    }

    // Abutments (end supports)
    const abutmentWidth = 2.5; // 2.5m abutment width
    const abutmentHeight = bearingLevel - this.params.datum;
    
    const abutments: Array<{ points: Point2D[]; width: number; height: number }> = [
      {
        points: [
          { x: this.hpos(this.params.left - abutmentWidth), y: this.vpos(this.params.datum) },
          { x: this.hpos(this.params.left), y: this.vpos(this.params.datum) },
          { x: this.hpos(this.params.left), y: this.vpos(bearingLevel) },
          { x: this.hpos(this.params.left - abutmentWidth), y: this.vpos(bearingLevel) }
        ],
        width: abutmentWidth,
        height: abutmentHeight
      },
      {
        points: [
          { x: this.hpos(this.params.right), y: this.vpos(this.params.datum) },
          { x: this.hpos(this.params.right + abutmentWidth), y: this.vpos(this.params.datum) },
          { x: this.hpos(this.params.right + abutmentWidth), y: this.vpos(bearingLevel) },
          { x: this.hpos(this.params.right), y: this.vpos(bearingLevel) }
        ],
        width: abutmentWidth,
        height: abutmentHeight
      }
    ];

    // Foundations for piers
    const foundations: Array<{ points: Point2D[]; width: number; depth: number }> = [];
    const foundationWidth = pierWidth + 1.0; // Foundation wider than pier
    const foundationDepth = 2.0; // 2m foundation depth
    
    for (const pier of piers) {
      const pierCenterX = (pier.points[0].x + pier.points[1].x) / 2;
      const halfFoundationWidth = foundationWidth / 2;
      
      foundations.push({
        points: [
          { x: pierCenterX - this.hpos(halfFoundationWidth), y: this.vpos(foundationLevel) },
          { x: pierCenterX + this.hpos(halfFoundationWidth), y: this.vpos(foundationLevel) },
          { x: pierCenterX + this.hpos(halfFoundationWidth), y: this.vpos(foundationLevel - foundationDepth) },
          { x: pierCenterX - this.hpos(halfFoundationWidth), y: this.vpos(foundationLevel - foundationDepth) }
        ],
        width: foundationWidth,
        depth: foundationDepth
      });
    }

    // Comprehensive dimensions (as per LISP drawing standards)
    const dimensions = [
      // Overall bridge length
      {
        start: { x: this.hpos(this.params.left), y: this.vpos(deckLevel) + 40 },
        end: { x: this.hpos(this.params.right), y: this.vpos(deckLevel) + 40 },
        value: `L = ${bridgeLength.toFixed(0)}m`,
        level: 1
      },
      // Deck level dimension
      {
        start: { x: this.hpos(this.params.left) - 30, y: this.vpos(this.params.datum) },
        end: { x: this.hpos(this.params.left) - 30, y: this.vpos(deckLevel) },
        value: `${(deckLevel - this.params.datum).toFixed(2)}m`,
        level: 2
      },
      // Bridge height
      {
        start: { x: this.hpos(this.params.left) - 60, y: this.vpos(foundationLevel) },
        end: { x: this.hpos(this.params.left) - 60, y: this.vpos(deckLevel + parapetHeight) },
        value: `H = ${(deckLevel + parapetHeight - foundationLevel).toFixed(1)}m`,
        level: 3
      }
    ];

    // Add span dimensions if piers exist
    if (piers.length > 0) {
      let prevChainage = this.params.left;
      
      for (let i = 0; i <= piers.length; i++) {
        const currentChainage = i < piers.length ? piers[i].chainage : this.params.right;
        const spanLength = currentChainage - prevChainage;
        
        dimensions.push({
          start: { x: this.hpos(prevChainage), y: this.vpos(deckLevel) + 20 },
          end: { x: this.hpos(currentChainage), y: this.vpos(deckLevel) + 20 },
          value: `${spanLength.toFixed(0)}m`,
          level: 0
        });
        
        prevChainage = currentChainage;
      }
    }

    return { deck, piers, abutments, foundations, superstructure, dimensions };
  }

  // Generate bridge plan view (top view)
  generateBridgePlan(): {
    deckOutline: Point2D[];
    piersInPlan: Array<{ points: Point2D[]; chainage: number }>;
    abutmentsInPlan: Array<{ points: Point2D[] }>;
    centerline: Point2D[];
    roadwayMarking: Point2D[];
    dimensions: Array<{ start: Point2D; end: Point2D; value: string }>;
  } {
    const bridgeWidth = 12.0; // 12m bridge width
    const roadwayWidth = 7.5; // 7.5m roadway width
    const halfWidth = bridgeWidth / 2;
    const halfRoadway = roadwayWidth / 2;

    // Bridge deck outline in plan
    const deckOutline: Point2D[] = [
      { x: this.hpos(this.params.left), y: this.vpos(this.params.datum + halfWidth) },
      { x: this.hpos(this.params.right), y: this.vpos(this.params.datum + halfWidth) },
      { x: this.hpos(this.params.right), y: this.vpos(this.params.datum - halfWidth) },
      { x: this.hpos(this.params.left), y: this.vpos(this.params.datum - halfWidth) }
    ];

    // Centerline
    const centerline: Point2D[] = [
      { x: this.hpos(this.params.left), y: this.vpos(this.params.datum) },
      { x: this.hpos(this.params.right), y: this.vpos(this.params.datum) }
    ];

    // Roadway marking
    const roadwayMarking: Point2D[] = [
      { x: this.hpos(this.params.left), y: this.vpos(this.params.datum + halfRoadway) },
      { x: this.hpos(this.params.right), y: this.vpos(this.params.datum + halfRoadway) },
      { x: this.hpos(this.params.right), y: this.vpos(this.params.datum - halfRoadway) },
      { x: this.hpos(this.params.left), y: this.vpos(this.params.datum - halfRoadway) }
    ];

    // Get elevation data for piers
    const elevationData = this.generateBridgeElevation();
    
    // Piers in plan view
    const piersInPlan: Array<{ points: Point2D[]; chainage: number }> = [];
    for (const pier of elevationData.piers) {
      const pierLength = 8.0; // Pier length across bridge width
      const halfLength = pierLength / 2;
      
      piersInPlan.push({
        points: [
          { x: pier.points[0].x, y: this.vpos(this.params.datum + halfLength) },
          { x: pier.points[1].x, y: this.vpos(this.params.datum + halfLength) },
          { x: pier.points[1].x, y: this.vpos(this.params.datum - halfLength) },
          { x: pier.points[0].x, y: this.vpos(this.params.datum - halfLength) }
        ],
        chainage: pier.chainage
      });
    }

    // Abutments in plan view
    const abutmentsInPlan: Array<{ points: Point2D[] }> = [
      {
        points: [
          { x: this.hpos(this.params.left - 2.5), y: this.vpos(this.params.datum + halfWidth) },
          { x: this.hpos(this.params.left), y: this.vpos(this.params.datum + halfWidth) },
          { x: this.hpos(this.params.left), y: this.vpos(this.params.datum - halfWidth) },
          { x: this.hpos(this.params.left - 2.5), y: this.vpos(this.params.datum - halfWidth) }
        ]
      },
      {
        points: [
          { x: this.hpos(this.params.right), y: this.vpos(this.params.datum + halfWidth) },
          { x: this.hpos(this.params.right + 2.5), y: this.vpos(this.params.datum + halfWidth) },
          { x: this.hpos(this.params.right + 2.5), y: this.vpos(this.params.datum - halfWidth) },
          { x: this.hpos(this.params.right), y: this.vpos(this.params.datum - halfWidth) }
        ]
      }
    ];

    // Plan view dimensions
    const dimensions = [
      {
        start: { x: this.hpos(this.params.left), y: this.vpos(this.params.datum + halfWidth + 20) },
        end: { x: this.hpos(this.params.right), y: this.vpos(this.params.datum + halfWidth + 20) },
        value: `${(this.params.right - this.params.left).toFixed(0)}m`
      },
      {
        start: { x: this.hpos(this.params.left) - 40, y: this.vpos(this.params.datum - halfWidth) },
        end: { x: this.hpos(this.params.left) - 40, y: this.vpos(this.params.datum + halfWidth) },
        value: `${bridgeWidth.toFixed(1)}m`
      }
    ];

    return { deckOutline, piersInPlan, abutmentsInPlan, centerline, roadwayMarking, dimensions };
  }

  getCalculatedConstants(): CalculatedConstants {
    return this.constants;
  }

  getParameters(): BridgeParameters {
    return this.params;
  }

  // Generate comprehensive bridge design (from LISP pier() function)
  generateCompleteBridgeDesign(): {
    nspan: number;
    lbridge: number;
    abtl: number;
    rtl: number;
    sofl: number;
    spans: Array<{
      span: number;
      futrl: number;
      futd: number;
      futw: number;
      futl: number;
      pier?: {
        capT: number;
        capB: number;
        capW: number;
        pierTW: number;
        pierST: number;
      };
    }>;
    kerbDetails: {
      width: number;
      depth: number;
    };
    deckDetails: {
      thickness: number;
      centerToCenterBridge: number;
      slabThickness: {
        center: number;
        edge: number;
        top: number;
      };
    };
  } {
    const bridgeLength = this.params.right - this.params.left;
    const nspan = Math.max(1, Math.floor(bridgeLength / 30)); // 30m spans
    
    return {
      nspan,
      lbridge: bridgeLength,
      abtl: this.params.left, // Abutment location
      rtl: this.params.toprl, // Road top level
      sofl: this.params.datum + 10, // Soffit level
      spans: Array.from({ length: nspan }, (_, i) => ({
        span: bridgeLength / nspan,
        futrl: this.params.datum - 2, // Foundation top RL
        futd: 2.5, // Foundation depth
        futw: 3.5, // Foundation width
        futl: 4.0, // Foundation length
        pier: i < nspan - 1 ? {
          capT: this.params.toprl - 2, // Cap top level
          capB: this.params.toprl - 2.5, // Cap bottom level
          capW: 2.2, // Cap width
          pierTW: 1.8, // Pier top width
          pierST: 8.0 // Pier stem height
        } : undefined
      })),
      kerbDetails: {
        width: 0.6, // 600mm kerb width
        depth: 0.8  // 800mm kerb depth
      },
      deckDetails: {
        thickness: 0.8, // 800mm deck thickness
        centerToCenterBridge: 12.0, // 12m c/c bridge width
        slabThickness: {
          center: 0.8, // 800mm at center
          edge: 0.6,   // 600mm at edge
          top: 1.0     // 1000mm top thickness
        }
      }
    };
  }

  // Generate cross-section points (from LISP cs() function)
  generateCrossSection(crossSectionData: Array<{ chainage: number; level: number }>): {
    points: Point2D[];
    markers: Array<{ position: Point2D; chainage: string; level: string }>;
    gridLines: {
      vertical: Array<{ x: number; label: string }>;
      horizontal: Array<{ y: number; label: string }>;
    };
  } {
    const points: Point2D[] = [];
    const markers: Array<{ position: Point2D; chainage: string; level: string }> = [];

    crossSectionData.forEach((point, index) => {
      const x = this.hpos(point.chainage);
      const y = this.vpos(point.level);
      
      points.push({ x, y });
      
      // Add markers for chainage and level (based on LISP text commands)
      const chainageStr = this.formatChainage(point.chainage);
      const levelStr = point.level.toFixed(3);
      
      // Only mark chainages that are not on grid increments (as per LISP logic)
      const chainageRemainder = (point.chainage - this.params.left) % this.params.xincr;
      if (Math.abs(chainageRemainder) > 0.01) {
        markers.push({
          position: { x: x + 5, y: y - 10 },
          chainage: chainageStr,
          level: levelStr
        });
      }
    });

    // Generate grid lines (from LISP layout function)
    const gridLines = {
      vertical: [] as Array<{ x: number; label: string }>,
      horizontal: [] as Array<{ y: number; label: string }>
    };

    // Vertical grid lines (chainages)
    const noh = this.params.right - this.params.left;
    const xSteps = Math.floor(noh / this.params.xincr);
    for (let i = 1; i <= xSteps; i++) {
      const chainage = this.params.left + (i * this.params.xincr);
      gridLines.vertical.push({
        x: this.hpos(chainage),
        label: this.formatChainage(chainage)
      });
    }

    // Horizontal grid lines (levels)
    const nov = this.params.toprl - this.params.datum;
    const ySteps = Math.floor(nov / this.params.yincr);
    for (let i = 0; i <= ySteps; i++) {
      const level = this.params.datum + (i * this.params.yincr);
      gridLines.horizontal.push({
        y: this.vpos(level),
        label: level.toFixed(3)
      });
    }

    return { points, markers, gridLines };
  }

  // Apply skew transformation (from LISP skew calculations)
  applySkewTransformation(point: Point2D): Point2D {
    if (this.params.skew === 0) return point;
    
    const { s, c } = this.constants;
    return {
      x: point.x * c - point.y * s,
      y: point.x * s + point.y * c
    };
  }

  // Generate professional dimension lines (from LISP DIMLINEAR commands)
  generateDimensionLines(): Array<{
    type: 'linear' | 'angular' | 'radial';
    start: Point2D;
    end: Point2D;
    dimLinePosition: Point2D;
    text: string;
    style: {
      arrowSize: number;
      textHeight: number;
      extensionLineLength: number;
      extensionLineOffset: number;
    };
  }> {
    const dimensions = [];
    const style = {
      arrowSize: 150,  // DIMASZ from LISP
      textHeight: 400, // DIMTXT from LISP
      extensionLineLength: 400, // DIMEXE from LISP
      extensionLineOffset: 400  // DIMEXO from LISP
    };

    // Overall bridge length dimension
    dimensions.push({
      type: 'linear' as const,
      start: { x: this.hpos(this.params.left), y: this.vpos(this.params.toprl) },
      end: { x: this.hpos(this.params.right), y: this.vpos(this.params.toprl) },
      dimLinePosition: { x: this.hpos((this.params.left + this.params.right) / 2), y: this.vpos(this.params.toprl) + 50 },
      text: `${(this.params.right - this.params.left).toFixed(1)}m`,
      style
    });

    return dimensions;
  }

  // Generate AutoCAD-style drawing commands (from LISP command generation)
  generateDrawingCommands(): Array<{
    command: string;
    parameters: any[];
    layer?: string;
    color?: number;
  }> {
    const commands = [];
    
    // Set dimension style (from st() function)
    commands.push({
      command: 'DIMSTYLE',
      parameters: ['Arial', 150, 0, 400, 400, 1, 'Arial', 400, 0, 1]
    });

    // Generate layout (from layout() function)
    const d1 = 20;
    const leftAdjusted = this.params.left - (this.params.left % 1.0);
    
    commands.push({
      command: 'LINE',
      parameters: [[leftAdjusted, this.params.datum], [this.hpos(this.params.right), this.params.datum]],
      layer: 'AXES',
      color: 7
    });

    return commands;
  }

  // Excel parameter processing (from app.py integration)
  static processExcelParameters(excelData: any): BridgeParameters {
    // Process Sheet1 parameters as in the Streamlit app
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
}
