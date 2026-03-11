// ============================================================================
// GAMBITO - Tipos
// ============================================================================

import { ModuleBase, ConvictionLevel } from "../../types/base";

export interface GambitoMetrics {
  roi: number;
  winRate: number;
  modelAccuracy: number;
  expectedValue: number;
  sharpeRatio: number;
  maxDrawdown: number;
  predictionsToday: number;
  highConfidenceCount: number;
}

export interface Prediction {
  id: string;
  sport: string;
  sportIcon: string;
  match: string;
  team1: string;
  team2: string;
  odds: string;
  prediction: string;
  predictedWinner: "1" | "X" | "2" | "none";
  modelConfidence: number;
  possibleScore: string;
  marketStatus: string;
  marketDistribution: {
    team1Pct: number;
    drawPct?: number;
    team2Pct: number;
  };
  value: number;
  confidence: ConvictionLevel;
  timestamp: string;
  matchTime: string;
  valueBet: {
    edge: number;
    potentialProfit: number;
    recommendation: "strong" | "moderate" | "low" | "none";
  };
}

export interface SportConfidence {
  sport: string;
  icon: string;
  confidence: number;
  bestModel: string;
  accuracy: number;
}

export interface ModelStats {
  name: string;
  accuracy: number;
  lastCalibration: string;
}

export interface BankrollInfo {
  initial: number;
  current: number;
  pnl: number;
  pnlPercent: number;
  avgStake: number;
  kellyFraction: number;
}

export interface GambitoData extends ModuleBase {
  metrics: GambitoMetrics;
  activePredictions: Prediction[];
  sportConfidence: SportConfidence[];
  modelStats: ModelStats[];
  bankroll: BankrollInfo;
}
