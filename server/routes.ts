import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { bridgeInputSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Parse bridge input data from text file
  app.post("/api/bridge/parse", async (req, res) => {
    try {
      const { inputData } = req.body;
      
      if (!inputData || typeof inputData !== 'string') {
        return res.status(400).json({ error: "Input data is required and must be a string" });
      }

      // Basic input size validation (10MB max)
      if (inputData.length > 10 * 1024 * 1024) {
        return res.status(413).json({ error: "Input file is too large (max 10MB)" });
      }

      // Parse the input data according to LISP format
      const lines = inputData.trim().split('\n').map(line => line.trim()).filter(line => line);
      
      if (lines.length < 10) {
        return res.status(400).json({ error: "Input file must contain at least 10 parameters" });
      }

      // Parse and validate numeric parameters
      const parseNumericParam = (value: string, name: string, isInt = false): number => {
        const num = isInt ? parseInt(value, 10) : parseFloat(value);
        if (isNaN(num) || (isInt && !Number.isInteger(num))) {
          throw new Error(`Invalid ${name}: ${value}`);
        }
        return num;
      };

      const parameters = {
        scale1: parseNumericParam(lines[0], 'scale1'),
        scale2: parseNumericParam(lines[1], 'scale2'),
        skew: parseNumericParam(lines[2], 'skew'),
        datum: parseNumericParam(lines[3], 'datum'),
        toprl: parseNumericParam(lines[4], 'toprl'),
        left: parseNumericParam(lines[5], 'left'),
        right: parseNumericParam(lines[6], 'right'),
        xincr: parseNumericParam(lines[7], 'xincr'),
        yincr: parseNumericParam(lines[8], 'yincr'),
        noch: parseNumericParam(lines[9], 'noch', true)
      };

      // Validate parameter relationships
      if (parameters.scale1 <= 0 || parameters.scale2 <= 0) {
        throw new Error('Scale values must be positive');
      }
      
      if (parameters.xincr <= 0 || parameters.yincr <= 0) {
        throw new Error('Increment values must be positive');
      }

      if (parameters.noch <= 0 || !Number.isInteger(parameters.noch)) {
        throw new Error('Number of chainages must be a positive integer');
      }

      if (parameters.right <= parameters.left) {
        throw new Error('Right chainage must be greater than left chainage');
      }

      if (parameters.toprl <= parameters.datum) {
        throw new Error('Top level must be greater than datum level');
      }

      // Parse cross-section data if present
      const crossSections = [];
      for (let i = 10; i < lines.length; i += 2) {
        if (i + 1 < lines.length) {
          const chainage = parseNumericParam(lines[i], 'chainage');
          const level = parseNumericParam(lines[i + 1], 'level');
          
          if (chainage < parameters.left || chainage > parameters.right) {
            throw new Error(`Chainage ${chainage} is outside the valid range [${parameters.left}, ${parameters.right}]`);
          }
          
          crossSections.push({ chainage, level });
        }
      }

      // Sort cross-sections by chainage
      crossSections.sort((a, b) => a.chainage - b.chainage);

      // Validate cross-sections cover the full range
      if (crossSections.length > 0) {
        if (crossSections[0].chainage > parameters.left || 
            crossSections[crossSections.length - 1].chainage < parameters.right) {
          throw new Error('Cross-sections must cover the full chainage range');
        }
      }

      // Validate parsed parameters against schema
      const validatedInput = bridgeInputSchema.parse({
        ...parameters,
        crossSections: crossSections.length > 0 ? crossSections : undefined
      });

      res.json({ 
        success: true, 
        parameters: validatedInput,
        calculatedValues: {
          vvs: 1000.0,
          hhs: 1000.0,
          skew1: validatedInput.skew * (Math.PI / 180), // Convert to radians
          sc: validatedInput.scale1 / validatedInput.scale2
        }
      });

    } catch (error) {
      console.error('Error parsing bridge input:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: "Invalid input parameters", 
          details: error.errors 
        });
      }
      
      res.status(400).json({ 
        error: error instanceof Error ? error.message : "Failed to parse input data" 
      });
    }
  });

  // Create new bridge project
  app.post("/api/bridge/project", async (req, res) => {
    try {
      const { name, inputData, parameters } = req.body;
      
      const project = await storage.createBridgeProject({
        name,
        inputData,
        parameters: JSON.stringify(parameters)
      });

      // Create bridge parameters
      await storage.createBridgeParameters({
        projectId: project.id,
        ...parameters
      });

      // Create cross-sections if provided
      if (parameters.crossSections) {
        for (let i = 0; i < parameters.crossSections.length; i++) {
          const section = parameters.crossSections[i];
          await storage.createBridgeCrossSection({
            projectId: project.id,
            chainage: section.chainage,
            level: section.level,
            sequence: i
          });
        }
      }

      res.json({ success: true, project });

    } catch (error) {
      console.error('Error creating bridge project:', error);
      res.status(500).json({ error: "Failed to create bridge project" });
    }
  });

  // Get bridge project with parameters
  app.get("/api/bridge/project/:id", async (req, res) => {
    try {
      const { id } = req.params;
      
      const project = await storage.getBridgeProject(id);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      const parameters = await storage.getBridgeParameters(id);
      const crossSections = await storage.getBridgeCrossSections(id);

      res.json({
        project: {
          ...project,
          parameters: parameters ? JSON.parse(project.parameters) : null
        },
        parameters,
        crossSections
      });

    } catch (error) {
      console.error('Error fetching bridge project:', error);
      res.status(500).json({ error: "Failed to fetch project" });
    }
  });

  // Generate LISP code
  app.post("/api/bridge/generate-lisp", async (req, res) => {
    try {
      const { parameters } = req.body;
      
      if (!parameters) {
        return res.status(400).json({ error: "Parameters are required" });
      }

      const lispCode = generateLispCode(parameters);
      
      res.json({ 
        success: true, 
        lispCode,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error generating LISP code:', error);
      res.status(500).json({ error: "Failed to generate LISP code" });
    }
  });

  // Generate DWG export data
  app.post("/api/bridge/export/dwg", async (req, res) => {
    try {
      const { projectId, exportSettings } = req.body;
      
      const project = await storage.getBridgeProject(projectId);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      // Generate DWG content (in a real app, this would generate actual DWG binary)
      const dwgGenerator = new DWGGenerator(project.parameters);
      const dwgData = dwgGenerator.exportDWG({
        paperSize: exportSettings.paperSize || "A4",
        orientation: "landscape",
        scale: parseFloat(exportSettings.drawingScale?.replace('1:', '') || '100'),
        includeDimensions: exportSettings.includeDimensions !== false,
        includeTitleBlock: exportSettings.includeTitleBlock !== false,
        includeGrid: exportSettings.includeGrid === true
      });

      // Set headers for file download
      const filename = `bridge_export_${new Date().toISOString().split('T')[0]}.dwg`;
      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      
      // In a real implementation, you would stream the DWG binary here
      // For now, we'll send the commands as text
      res.send(dwgData.commands.join('\n'));
      
    } catch (error) {
      console.error('DWG export error:', error);
      res.status(500).json({ error: "Failed to generate DWG export" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Helper function to generate LISP code based on parameters
function generateLispCode(parameters: any): string {
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
  
  ; Add labels
  (setq ptb3 (list (- left (* 25 scale1)) (- datum (* d1 0.5 scale1))))
  (command "text" ptb3 (* 2.5 scale1) 0 "BED LEVEL")
  (setq ptb3 (list (- left (* 25 scale1)) (- datum (* d1 1.5 scale1))))
  (command "text" ptb3 (* 2.5 scale1) 0 "CHAINAGE")
)

; Execute main function
(main)`;
}

// Helper function to generate drawing commands
function generateDrawingCommands(parameters: any): string[] {
  const commands = [];
  
  // Basic drawing setup
  commands.push("NEW");
  commands.push("UNITS 4 2 1 4 0 N");
  commands.push("LIMITS 0,0 420,297"); // A3 landscape in mm
  
  // Set up layers
  commands.push("LAYER N AXIS C 2 AXIS");
  commands.push("LAYER N BRIDGE C 1 BRIDGE");
  commands.push("LAYER N DIMENSIONS C 3 DIMENSIONS");
  
  // Draw coordinate system
  const leftMM = parameters.left * 1000;
  const rightMM = parameters.right * 1000;
  const datumMM = parameters.datum * 10; // Scale for drawing
  
  commands.push(`LINE ${leftMM},${datumMM} ${rightMM},${datumMM}`);
  commands.push(`LINE ${leftMM},${datumMM} ${leftMM},${datumMM + (parameters.toprl - parameters.datum) * 10}`);
  
  return commands;
}

class DWGGenerator {
  constructor(parameters: any) {
    this.parameters = parameters;
  }

  exportDWG(options: any) {
    const commands = generateDrawingCommands(this.parameters);
    // Add more commands based on options
    return { commands };
  }
}
