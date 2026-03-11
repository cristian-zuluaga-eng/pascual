// ============================================================================
// CONDOR360 - Tipos
// ============================================================================

import { ModuleBase, ConvictionLevel } from "../../types/base";

export interface Condor360Metrics {
  portfolioReturn: number;
  sharpeRatio: number;
  maxDrawdown: number;
  alpha: number;
  signalsActive: number;
  predictionAccuracy: number;
}

export interface PortfolioAllocation {
  asset: string;
  percentage: number;
  color: string;
}

export interface Condor360Holding {
  symbol: string;
  percentage: number;
  todayChange: number;
}

export interface MarketSignal {
  id: string;
  conviction: ConvictionLevel;
  symbol: string;
  title: string;
  target: number;
  current: number;
  upside: number;
  confidence: number;
  reason: string;
  action?: string;
}

export interface SectorPerformance {
  sector: string;
  change: number;
}

export interface ModelConfidence {
  sector: string;
  confidence: number;
  conviction: ConvictionLevel;
}

export interface FinancialNews {
  id: string;
  title: string;
  impact: "positive" | "negative" | "neutral";
  timestamp: string;
}

export interface AIRecommendation {
  id: string;
  type: "buy" | "sell" | "hold";
  asset: string;
  reason: string;
  confidence: number;
  timestamp: string;
}

export interface Condor360Data extends ModuleBase {
  metrics: Condor360Metrics;
  portfolioAllocation: PortfolioAllocation[];
  topHoldings: Condor360Holding[];
  marketSignals: MarketSignal[];
  sectorPerformance: SectorPerformance[];
  modelConfidence: ModelConfidence[];
  news: FinancialNews[];
  recommendations: AIRecommendation[];
  marketSentiment: "bullish" | "neutral" | "bearish";
  vix: number;
}
