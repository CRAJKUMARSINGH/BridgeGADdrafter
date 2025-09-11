// Shared helpers used by server routes and Vercel functions

export function generateLispCode(parameters: any): string {
  return `; Generated Bridge GAD LISP Code
; Based on input parameters and LISP functions

(defun main()
  ; Initialize parameters from input
  (setq scale1 ${parameters.scale1})
  (setq scale2 ${parameters.scale2})
  (setq skew ${parameters.skew})
  (setq datum ${parameters.datum})
  (setq toprl ${parameters.toprl})
  (setq left ${parameters.left})
  (setq right ${parameters.right})
  (setq xincr ${parameters.xincr})
  (setq yincr ${parameters.yincr})
  (setq noch ${parameters.noch})
  
  ; Calculate transformation constants
  (setq vvs 1000.0)
  (setq hhs 1000.0)
  (setq skew1 (* skew 0.0174532))
  (setq sc (/ scale1 scale2))
  
  ; Set dimension style
  (st)
  
  ; Generate layout
  (layout)
  
  ; Draw bridge elevation
  (draw-elevation)
)

; Position transformation functions as per original LISP
(defun vpos(a)
  (setq a (* vvs (- a datum)))
  (setq a (+ datum a))
)

(defun hpos(a)
  (setq a (* hhs (- a left)))
  (setq a (+ left a))
)

(defun v2pos(a)
  (setq a (* vvs (- a datum)))
  (setq a (* sc a))
  (setq a (+ datum a))
)

(defun h2pos(a)
  (setq a (* hhs (- a left)))
  (setq a (* sc a))
  (setq a (+ left a))
)

; Set dimension style (from original st() function)
(defun st()
  (command "-style" "Arial" "Arial" "" "" "" "" "")
  (command "DIMASZ" "150")
  (command "DIMDEC" "0")
  (command "DIMEXE" "400")
  (command "DIMEXO" "400")
  (command "DIMLFAC" "1")
  (command "DIMTXSTY" "Arial")
  (command "DIMTXT" "400")
  (command "DIMTAD" "0")
  (command "DIMTIH" "1")
  (command "-dimstyle" "save" "pmb100" "y")
)

; Layout generation (from original layout() function)
(defun layout()
  (setq os (getvar "OSMODE"))
  (setvar "OSMODE" 0)
  (setq left (- left (rem left 1.0)))
  (setq pta1 (list left datum))
  (setq d1 20)
  (setq ptb1 (list left (- datum (* d1 scale1))))
  (setq pta2 (list (hpos right) datum))
  (setq ptb2 (list (hpos right) (- datum (* d1 scale1))))
  (setq ptc1 (list left (- datum (* d1 scale1 2))))
  (setq ptc2 (list (hpos right) (- datum (* d1 scale1 2))))
  (setq ptd1 (list left (vpos toprl)))
  
  ; Draw axes
  (COMMAND "line" pta1 pta2 "")
  (COMMAND "line" ptb1 ptb2 "")
  (COMMAND "line" ptc1 ptc2 "")
  (COMMAND "line" ptc1 ptd1 "")
)

`;}

export function generateDrawingCommands(parameters: any): string[] {
  const commands: string[] = [];
  commands.push("NEW");
  commands.push("UNITS 4 2 1 4 0 N");
  commands.push("LIMITS 0,0 420,297");
  commands.push("LAYER N AXIS C 2 AXIS");
  commands.push("LAYER N BRIDGE C 1 BRIDGE");
  commands.push("LAYER N DIMENSIONS C 3 DIMENSIONS");

  const leftMM = parameters.left * 1000;
  const rightMM = parameters.right * 1000;
  const datumMM = parameters.datum * 10;
  commands.push(`LINE ${leftMM},${datumMM} ${rightMM},${datumMM}`);
  commands.push(`LINE ${leftMM},${datumMM} ${leftMM},${datumMM + (parameters.toprl - parameters.datum) * 10}`);
  return commands;
}

export function processExcelParameters(excelData: any) {
  const parameterMap: { [key: string]: string } = {
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

  const parameters: any = {};
  const defaults = {
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

  if (excelData && excelData.Sheet1) {
    excelData.Sheet1.forEach((row: any) => {
      const variable = row.Variable?.toString().toUpperCase();
      const value = parseFloat(row.Value);
      if (variable && parameterMap[variable] && !isNaN(value)) {
        parameters[parameterMap[variable]] = value;
      }
    });
  }
  return { ...defaults, ...parameters };
}

export class DWGGeneratorService {
  private readonly params: any;
  constructor(parameters: any) {
    this.params = parameters;
  }
  exportDWG(_options: any) {
    const commands = generateDrawingCommands(this.params);
    return { commands };
  }
}

