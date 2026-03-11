// ============================================================================
// NEXUS - Tipos
// ============================================================================

import { ModuleBase, Priority } from "../../types/base";

export interface NexusMetrics {
  testCoverage: number;
  codeComplexity: number;
  maintainabilityIndex: number;
  documentationCoverage: number;
  technicalDebt: "low" | "medium" | "high";
  architectureCoherence: number;
  deploysThisWeek: number;
  deploySuccessRate: number;
  prsOpen: number;
  prsMerged: number;
  bugsOpen: number;
  avgResponseTime: number;
  tokenUsageDaily: number;
}

export interface PipelineItem {
  id: string;
  title: string;
  stage: "analysis" | "design" | "implement" | "testing" | "review" | "deploy";
  priority: Priority;
}

export interface OpenProject {
  id: string;
  name: string;
  description: string;
  type: "agent" | "user";
  ownerAgent?: {
    name: string;
    icon: string;
  };
  status: "active" | "blocked" | "waiting";
  assignedAgent?: {
    name: string;
    icon: string;
    task: string;
  };
  blockReason?: "approval" | "resources" | "external" | "priority" | null;
  blockDetail?: string;
  progress: number;
  lastUpdate: string;
}

export interface Commit {
  hash: string;
  message: string;
  author: string;
  time: string;
}

export interface ModelPerformance {
  model: string;
  accuracy: number;
  avgResponseTime: number;
}

export interface ScriptImprovement {
  id: string;
  name: string;
  description: string;
  agentsInvolved: { name: string; icon: string }[];
  expectedOutcome: string;
  status: "pending" | "in_progress" | "completed" | "testing";
  impact: "high" | "medium" | "low";
  category: "performance" | "reliability" | "feature" | "security" | "optimization";
  timestamp: string;
}

export interface CodeReview {
  id: string;
  title: string;
  author: string;
  branch: string;
  project: string;
  status: "approved" | "changes_requested" | "pending" | "in_review";
  comments: number;
  filesChanged: number;
  additions: number;
  deletions: number;
  githubUrl: string;
  timestamp: string;
}

export interface NexusData extends ModuleBase {
  metrics: NexusMetrics;
  pipeline: PipelineItem[];
  openProjects: OpenProject[];
  recentCommits: Commit[];
  modelPerformance: ModelPerformance[];
  scriptImprovements: ScriptImprovement[];
  codeReviews: CodeReview[];
}
