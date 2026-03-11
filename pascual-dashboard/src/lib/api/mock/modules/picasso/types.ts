// ============================================================================
// PICASSO - Tipos
// ============================================================================

import { ModuleBase } from "../../types/base";

export interface OptimusMetrics {
  uptime: number;
  loadTime: number;
  accessibilityScore: number;
  componentsCount: number;
  uxScore: number;
  errorRate: number;
  activeSessions: number;
}

export interface UxNeed {
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
}

export interface ComponentUsage {
  name: string;
  instances: number;
  isNew?: boolean;
}

export interface ImplementationLog {
  id: string;
  componentName: string;
  agentName: string;
  agentIcon: string;
  implementationDetails: string;
  timestamp: string;
}

export interface AccessibilityIssue {
  id: string;
  description: string;
  severity: "high" | "medium" | "low";
}

export interface PicassoData extends ModuleBase {
  metrics: OptimusMetrics;
  uxNeeds: UxNeed[];
  componentsUsage: ComponentUsage[];
  implementationLogs: ImplementationLog[];
  accessibilityReport: {
    wcagCompliance: number;
    checks: { name: string; passed: boolean }[];
    issues: AccessibilityIssue[];
  };
  lighthouseScore: number;
}
