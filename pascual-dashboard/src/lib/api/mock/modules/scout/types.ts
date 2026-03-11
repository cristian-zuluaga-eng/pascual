// ============================================================================
// SCOUT - Tipos
// ============================================================================

import { ModuleBase } from "../../types/base";

export interface ScoutMetrics {
  searchesToday: number;
  searchAccuracy: number;
  sourcesActive: number;
  dataProcessed: string;
  alertsPending: number;
  cacheHitRate: number;
  avgSearchLatency: number;
  dailyQuotaUsed: number;
}

export interface SearchResult {
  id: string;
  query: string;
  resultCount: number;
  timestamp: string;
  status: "completed" | "processing" | "failed";
  details?: {
    source?: string;
    url?: string;
    searchTime?: string;
    dataSize?: string;
    agent?: string;
    relevanceScore?: number;
    cachedResult?: boolean;
    tags?: string[];
  };
}

export interface MonitoredTrend {
  id: string;
  name: string;
  icon: string;
  change: string;
  direction: "up" | "down" | "neutral";
  newItems?: number;
}

export interface DataSource {
  id: string;
  name: string;
  status: "active" | "rate_limited" | "offline" | "error";
  reliability: number;
}

export interface ScoutData extends ModuleBase {
  metrics: ScoutMetrics;
  recentSearches: SearchResult[];
  monitoredTrends: MonitoredTrend[];
  dataSources: DataSource[];
  resourceUsage: { cpu: number; memory: number; api: number };
}
