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
}
