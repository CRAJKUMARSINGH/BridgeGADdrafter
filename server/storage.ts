import { 
  type User, 
  type InsertUser, 
  type BridgeProject, 
  type InsertBridgeProject,
  type BridgeParameters,
  type InsertBridgeParameters,
  type BridgeCrossSection,
  type InsertBridgeCrossSection
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  createBridgeProject(project: InsertBridgeProject): Promise<BridgeProject>;
  getBridgeProject(id: string): Promise<BridgeProject | undefined>;
  getUserBridgeProjects(userId: string): Promise<BridgeProject[]>;
  updateBridgeProject(id: string, updates: Partial<BridgeProject>): Promise<BridgeProject | undefined>;
  
  createBridgeParameters(params: InsertBridgeParameters & { projectId: string }): Promise<BridgeParameters>;
  getBridgeParameters(projectId: string): Promise<BridgeParameters | undefined>;
  
  createBridgeCrossSection(section: InsertBridgeCrossSection & { projectId: string }): Promise<BridgeCrossSection>;
  getBridgeCrossSections(projectId: string): Promise<BridgeCrossSection[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private bridgeProjects: Map<string, BridgeProject>;
  private bridgeParameters: Map<string, BridgeParameters>;
  private bridgeCrossSections: Map<string, BridgeCrossSection[]>;

  constructor() {
    this.users = new Map();
    this.bridgeProjects = new Map();
    this.bridgeParameters = new Map();
    this.bridgeCrossSections = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createBridgeProject(insertProject: InsertBridgeProject): Promise<BridgeProject> {
    const id = randomUUID();
    const project: BridgeProject = {
      ...insertProject,
      id,
      userId: null,
      generatedDrawing: null,
      createdAt: new Date().toISOString(),
    };
    this.bridgeProjects.set(id, project);
    return project;
  }

  async getBridgeProject(id: string): Promise<BridgeProject | undefined> {
    return this.bridgeProjects.get(id);
  }

  async getUserBridgeProjects(userId: string): Promise<BridgeProject[]> {
    return Array.from(this.bridgeProjects.values()).filter(
      (project) => project.userId === userId
    );
  }

  async updateBridgeProject(id: string, updates: Partial<BridgeProject>): Promise<BridgeProject | undefined> {
    const existing = this.bridgeProjects.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updates };
    this.bridgeProjects.set(id, updated);
    return updated;
  }

  async createBridgeParameters(params: InsertBridgeParameters & { projectId: string }): Promise<BridgeParameters> {
    const id = randomUUID();
    const parameters: BridgeParameters = { ...params, id };
    this.bridgeParameters.set(params.projectId, parameters);
    return parameters;
  }

  async getBridgeParameters(projectId: string): Promise<BridgeParameters | undefined> {
    return this.bridgeParameters.get(projectId);
  }

  async createBridgeCrossSection(section: InsertBridgeCrossSection & { projectId: string }): Promise<BridgeCrossSection> {
    const id = randomUUID();
    const crossSection: BridgeCrossSection = { ...section, id };
    
    const existing = this.bridgeCrossSections.get(section.projectId) || [];
    existing.push(crossSection);
    this.bridgeCrossSections.set(section.projectId, existing);
    
    return crossSection;
  }

  async getBridgeCrossSections(projectId: string): Promise<BridgeCrossSection[]> {
    return this.bridgeCrossSections.get(projectId) || [];
  }
}

export const storage = new MemStorage();
