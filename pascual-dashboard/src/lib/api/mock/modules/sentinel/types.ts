// ============================================================================
// SENTINEL - Tipos
// ============================================================================

import { ModuleBase } from "../../types/base";

export interface SentinelMetrics {
  securityScore: number;
  uptime: number;
  threatsDetected: number;
  threatsBlocked: number;
  mttd: number;
  mttr: number;
  complianceScore: number;
  failedLogins24h: number;
  activeApiKeys: number;
  activeSessions: number;
  diskUsage: number;
  diskTotal: string;
  diskUsed: string;
}

export interface ThreatEvent {
  id: string;
  severity: "critical" | "warning" | "info";
  title: string;
  description: string;
  timestamp: string;
  status: "active" | "resolved" | "investigating";
  details?: {
    source?: string;
    targetSystem?: string;
    attackVector?: string;
    affectedUsers?: number;
    mitigationSteps?: string;
    detectedBy?: string;
    responseTime?: string;
    relatedIncidents?: number;
    riskLevel?: string;
    recommendations?: string;
  };
}

export interface SystemResource {
  name: string;
  usage: number;
  status: "ok" | "warning" | "critical";
}

export interface AccessLog {
  id: string;
  user: string;
  action: "login" | "logout" | "api_call" | "failed_login";
  timestamp: string;
  success: boolean;
  ip?: string;
}

export interface VulnerabilityScan {
  lastScan: string;
  critical: number;
  high: number;
  medium: number;
  low: number;
}

export interface BackupStatus {
  lastBackup: string;
  nextBackup: string;
  recoveryTestStatus: "passed" | "failed" | "pending";
  size: string;
}

export interface ImplementedImprovement {
  id: string;
  title: string;
  description: string;
  implementedAt: string;
  implementedBy: string;
  category: "security" | "performance" | "resilience" | "compliance" | "optimization";
  impact: "high" | "medium" | "low";
  details?: {
    beforeState?: string;
    afterState?: string;
    metricsImproved?: string;
    affectedSystems?: string;
    testingStatus?: string;
    rollbackPlan?: string;
    documentation?: string;
    nextSteps?: string;
  };
}

export interface ActivityHeatmapData {
  data: { value: number; label?: string }[][];
  xLabels: string[];
  yLabels: string[];
}

export interface SentinelData extends ModuleBase {
  metrics: SentinelMetrics;
  threats: ThreatEvent[];
  systemResources: SystemResource[];
  accessLogs: AccessLog[];
  vulnerabilities: VulnerabilityScan;
  backup: BackupStatus;
  improvements: ImplementedImprovement[];
  activityHeatmap: ActivityHeatmapData;
}
