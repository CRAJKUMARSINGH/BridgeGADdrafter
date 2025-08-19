// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/storage.ts
import { randomUUID } from "crypto";
var MemStorage = class {
  users;
  bridgeProjects;
  bridgeParameters;
  bridgeCrossSections;
  constructor() {
    this.users = /* @__PURE__ */ new Map();
    this.bridgeProjects = /* @__PURE__ */ new Map();
    this.bridgeParameters = /* @__PURE__ */ new Map();
    this.bridgeCrossSections = /* @__PURE__ */ new Map();
  }
  async getUser(id) {
    return this.users.get(id);
  }
  async getUserByUsername(username) {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  async createUser(insertUser) {
    const id = randomUUID();
    const user = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  async createBridgeProject(insertProject) {
    const id = randomUUID();
    const project = {
      ...insertProject,
      id,
      userId: null,
      generatedDrawing: null,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.bridgeProjects.set(id, project);
    return project;
  }
  async getBridgeProject(id) {
    return this.bridgeProjects.get(id);
  }
  async getUserBridgeProjects(userId) {
    return Array.from(this.bridgeProjects.values()).filter(
      (project) => project.userId === userId
    );
  }
  async updateBridgeProject(id, updates) {
    const existing = this.bridgeProjects.get(id);
    if (!existing) return void 0;
    const updated = { ...existing, ...updates };
    this.bridgeProjects.set(id, updated);
    return updated;
  }
  async createBridgeParameters(params) {
    const id = randomUUID();
    const parameters = { ...params, id };
    this.bridgeParameters.set(params.projectId, parameters);
    return parameters;
  }
  async getBridgeParameters(projectId) {
    return this.bridgeParameters.get(projectId);
  }
  async createBridgeCrossSection(section) {
    const id = randomUUID();
    const crossSection = { ...section, id };
    const existing = this.bridgeCrossSections.get(section.projectId) || [];
    existing.push(crossSection);
    this.bridgeCrossSections.set(section.projectId, existing);
    return crossSection;
  }
  async getBridgeCrossSections(projectId) {
    return this.bridgeCrossSections.get(projectId) || [];
  }
};
var storage = new MemStorage();

// shared/schema.ts
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, real, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull()
});
var bridgeProjects = pgTable("bridge_projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  userId: varchar("user_id").references(() => users.id),
  inputData: text("input_data").notNull(),
  parameters: text("parameters").notNull(),
  // JSON string of bridge parameters
  generatedDrawing: text("generated_drawing"),
  // SVG or drawing data
  createdAt: text("created_at").default(sql`now()`)
});
var bridgeParameters = pgTable("bridge_parameters", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").references(() => bridgeProjects.id),
  scale1: real("scale1").notNull(),
  // scale for plan and elevation
  scale2: real("scale2").notNull(),
  // scale for sections
  skew: real("skew").notNull(),
  // skew angle in degrees
  datum: real("datum").notNull(),
  // datum level
  toprl: real("toprl").notNull(),
  // top level on Y axis
  left: real("left").notNull(),
  // start chainage of X axis
  right: real("right").notNull(),
  // end chainage of X axis
  xincr: real("xincr").notNull(),
  // interval of distances on X axis
  yincr: real("yincr").notNull(),
  // interval of levels on Y axis
  noch: integer("noch").notNull()
  // total number of chainages
});
var bridgeCrossSections = pgTable("bridge_cross_sections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").references(() => bridgeProjects.id),
  chainage: real("chainage").notNull(),
  level: real("level").notNull(),
  sequence: integer("sequence").notNull()
});
var insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true
});
var insertBridgeProjectSchema = createInsertSchema(bridgeProjects).pick({
  name: true,
  inputData: true,
  parameters: true
});
var insertBridgeParametersSchema = createInsertSchema(bridgeParameters).omit({
  id: true,
  projectId: true
});
var insertBridgeCrossSectionSchema = createInsertSchema(bridgeCrossSections).omit({
  id: true,
  projectId: true
});
var bridgeInputSchema = z.object({
  scale1: z.number().positive(),
  scale2: z.number().positive(),
  skew: z.number(),
  datum: z.number(),
  toprl: z.number(),
  left: z.number(),
  right: z.number(),
  xincr: z.number().positive(),
  yincr: z.number().positive(),
  noch: z.number().int().positive(),
  crossSections: z.array(z.object({
    chainage: z.number(),
    level: z.number()
  })).optional()
});

// server/routes.ts
import { z as z2 } from "zod";
async function registerRoutes(app2) {
  app2.post("/api/bridge/parse", async (req, res) => {
    try {
      const { inputData } = req.body;
      if (!inputData || typeof inputData !== "string") {
        return res.status(400).json({ error: "Input data is required" });
      }
      const lines = inputData.trim().split("\n").map((line) => line.trim()).filter((line) => line);
      if (lines.length < 10) {
        return res.status(400).json({ error: "Input file must contain at least 10 parameters" });
      }
      const parameters = {
        scale1: parseFloat(lines[0]),
        scale2: parseFloat(lines[1]),
        skew: parseFloat(lines[2]),
        datum: parseFloat(lines[3]),
        toprl: parseFloat(lines[4]),
        left: parseFloat(lines[5]),
        right: parseFloat(lines[6]),
        xincr: parseFloat(lines[7]),
        yincr: parseFloat(lines[8]),
        noch: parseInt(lines[9])
      };
      const crossSections = [];
      for (let i = 10; i < lines.length; i += 2) {
        if (i + 1 < lines.length) {
          crossSections.push({
            chainage: parseFloat(lines[i]),
            level: parseFloat(lines[i + 1])
          });
        }
      }
      const validatedInput = bridgeInputSchema.parse({
        ...parameters,
        crossSections: crossSections.length > 0 ? crossSections : void 0
      });
      res.json({
        success: true,
        parameters: validatedInput,
        calculatedValues: {
          vvs: 1e3,
          hhs: 1e3,
          skew1: validatedInput.skew * 0.0174532,
          sc: validatedInput.scale1 / validatedInput.scale2
        }
      });
    } catch (error) {
      console.error("Error parsing bridge input:", error);
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ error: "Invalid input parameters", details: error.errors });
      }
      res.status(500).json({ error: "Failed to parse input data" });
    }
  });
  app2.post("/api/bridge/project", async (req, res) => {
    try {
      const { name, inputData, parameters } = req.body;
      const project = await storage.createBridgeProject({
        name,
        inputData,
        parameters: JSON.stringify(parameters)
      });
      await storage.createBridgeParameters({
        projectId: project.id,
        ...parameters
      });
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
      console.error("Error creating bridge project:", error);
      res.status(500).json({ error: "Failed to create bridge project" });
    }
  });
  app2.get("/api/bridge/project/:id", async (req, res) => {
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
      console.error("Error fetching bridge project:", error);
      res.status(500).json({ error: "Failed to fetch project" });
    }
  });
  app2.post("/api/bridge/generate-lisp", async (req, res) => {
    try {
      const { parameters } = req.body;
      if (!parameters) {
        return res.status(400).json({ error: "Parameters are required" });
      }
      const lispCode = generateLispCode(parameters);
      res.json({
        success: true,
        lispCode,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    } catch (error) {
      console.error("Error generating LISP code:", error);
      res.status(500).json({ error: "Failed to generate LISP code" });
    }
  });
  app2.post("/api/bridge/export/dwg", async (req, res) => {
    try {
      const { projectId } = req.body;
      const project = await storage.getBridgeProject(projectId);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      const drawingCommands = generateDrawingCommands(JSON.parse(project.parameters));
      res.json({
        success: true,
        filename: `${project.name}.dwg`,
        drawingCommands,
        format: "DWG",
        pages: 3,
        paperSize: "A4 Landscape"
      });
    } catch (error) {
      console.error("Error generating DWG export:", error);
      res.status(500).json({ error: "Failed to generate DWG export" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}
function generateLispCode(parameters) {
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
function generateDrawingCommands(parameters) {
  const commands = [];
  commands.push("NEW");
  commands.push("UNITS 4 2 1 4 0 N");
  commands.push("LIMITS 0,0 420,297");
  commands.push("LAYER N AXIS C 2 AXIS");
  commands.push("LAYER N BRIDGE C 1 BRIDGE");
  commands.push("LAYER N DIMENSIONS C 3 DIMENSIONS");
  const leftMM = parameters.left * 1e3;
  const rightMM = parameters.right * 1e3;
  const datumMM = parameters.datum * 10;
  commands.push(`LINE ${leftMM},${datumMM} ${rightMM},${datumMM}`);
  commands.push(`LINE ${leftMM},${datumMM} ${leftMM},${datumMM + (parameters.toprl - parameters.datum) * 10}`);
  return commands;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "3000", 10);
  const host = process.env.HOST || "127.0.0.1";
  const httpServer = server.listen(port, host, () => {
    log(`Server running at http://${host}:${port}`);
  });
  httpServer.on("error", (error) => {
    if (error.syscall !== "listen") {
      throw error;
    }
    switch (error.code) {
      case "EACCES":
        log(`Port ${port} requires elevated privileges`);
        process.exit(1);
        break;
      case "EADDRINUSE":
        log(`Port ${port} is already in use`);
        process.exit(1);
        break;
      default:
        throw error;
    }
  });
  process.on("SIGTERM", () => {
    log("SIGTERM received. Shutting down gracefully");
    httpServer.close(() => {
      log("Server stopped");
    });
  });
})();
