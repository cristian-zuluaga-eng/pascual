// ============================================================================
// GAMBITO - Mock Data
// ============================================================================

import { DeepPartial, mergeWithDefaults } from "../../types/base";
import { GambitoData } from "./types";

const defaultGambitoData: GambitoData = {
  id: "gambito",
  name: "Gambito",
  icon: "🎯",
  lema: "La ventaja esta en los datos, la excelencia en la iteracion",
  description: "Estratega de Prediccion Deportiva",
  status: "active",
  lastSync: "cada 1h",
  quickActions: [
    { id: "analyze", label: "Analizar partido", icon: "⚽", prompt: "Pascual, analiza el partido [equipo1] vs [equipo2]" },
    { id: "models", label: "Ver modelos", icon: "📊", prompt: "Pascual, muestra el rendimiento actual de los modelos" },
    { id: "roi", label: "ROI report", icon: "💰", prompt: "Pascual, genera reporte de ROI del ultimo mes" },
    { id: "value", label: "Value bets", icon: "🎯", prompt: "Pascual, identifica value bets disponibles ahora" },
  ],
  recentMessages: [],
  metrics: {
    roi: 8.3,
    winRate: 57,
    modelAccuracy: 72,
    expectedValue: 0.034,
    sharpeRatio: 1.45,
    maxDrawdown: -4.2,
    predictionsToday: 12,
    highConfidenceCount: 3,
  },
  activePredictions: [
    {
      id: "1",
      sport: "Futbol",
      sportIcon: "⚽",
      match: "Real Madrid vs Barcelona",
      team1: "Real Madrid",
      team2: "Barcelona",
      odds: "1: 2.10 | X: 3.40 | 2: 3.20",
      prediction: "Victoria Local",
      predictedWinner: "1",
      modelConfidence: 78,
      possibleScore: "2-1",
      marketStatus: "Mercado a favor del local: -20%",
      marketDistribution: {
        team1Pct: 40,
        drawPct: 20,
        team2Pct: 40
      },
      value: 0.08,
      confidence: "high",
      timestamp: "Hoy",
      matchTime: "20:45",
      valueBet: {
        edge: 38,
        potentialProfit: 2.10,
        recommendation: "strong"
      }
    },
    {
      id: "2",
      sport: "Tenis",
      sportIcon: "🎾",
      match: "Djokovic vs Alcaraz",
      team1: "Djokovic",
      team2: "Alcaraz",
      odds: "1: 1.85 | 2: 2.05",
      prediction: "Victoria Visitante",
      predictedWinner: "2",
      modelConfidence: 67,
      possibleScore: "1-3",
      marketStatus: "Mercado equilibrado: +5%",
      marketDistribution: {
        team1Pct: 52,
        team2Pct: 48
      },
      value: 0.04,
      confidence: "medium",
      timestamp: "Manana",
      matchTime: "16:30",
      valueBet: {
        edge: 19,
        potentialProfit: 2.05,
        recommendation: "moderate"
      }
    },
    {
      id: "3",
      sport: "Basket",
      sportIcon: "🏀",
      match: "Lakers vs Celtics",
      team1: "Lakers",
      team2: "Celtics",
      odds: "Spread: -3.5 | Total: 224.5",
      prediction: "Over 224.5",
      predictedWinner: "none",
      modelConfidence: 62,
      possibleScore: "118-112",
      marketStatus: "Mercado under: -15%",
      marketDistribution: {
        team1Pct: 45,
        team2Pct: 55
      },
      value: 0.03,
      confidence: "medium",
      timestamp: "Hoy",
      matchTime: "01:15",
      valueBet: {
        edge: 7,
        potentialProfit: 1.90,
        recommendation: "low"
      }
    },
    {
      id: "4",
      sport: "Futbol",
      sportIcon: "⚽",
      match: "Liverpool vs Man City",
      team1: "Liverpool",
      team2: "Man City",
      odds: "1: 2.80 | X: 3.60 | 2: 2.30",
      prediction: "Empate",
      predictedWinner: "X",
      modelConfidence: 58,
      possibleScore: "1-1",
      marketStatus: "Mercado a favor visitante: -10%",
      marketDistribution: {
        team1Pct: 25,
        drawPct: 30,
        team2Pct: 45
      },
      value: 0.05,
      confidence: "medium",
      timestamp: "Manana",
      matchTime: "18:00",
      valueBet: {
        edge: 28,
        potentialProfit: 3.60,
        recommendation: "strong"
      }
    },
    {
      id: "5",
      sport: "Tenis",
      sportIcon: "🎾",
      match: "Nadal vs Federer",
      team1: "Nadal",
      team2: "Federer",
      odds: "1: 1.75 | 2: 2.15",
      prediction: "Victoria Local",
      predictedWinner: "1",
      modelConfidence: 81,
      possibleScore: "3-1",
      marketStatus: "Mercado a favor: +8%",
      marketDistribution: {
        team1Pct: 58,
        team2Pct: 42
      },
      value: 0.07,
      confidence: "high",
      timestamp: "Pasado manana",
      matchTime: "14:00",
      valueBet: {
        edge: 23,
        potentialProfit: 1.75,
        recommendation: "moderate"
      }
    }
  ],
  sportConfidence: [
    { sport: "Futbol", icon: "⚽", confidence: 84, bestModel: "Poisson Model", accuracy: 78 },
    { sport: "Tenis", icon: "🎾", confidence: 76, bestModel: "ELO Dynamic", accuracy: 71 },
    { sport: "Basket", icon: "🏀", confidence: 81, bestModel: "ML Ensemble", accuracy: 79 },
    { sport: "Baseball", icon: "⚾", confidence: 68, bestModel: "Dixon-Coles", accuracy: 82 },
    { sport: "MMA", icon: "🥊", confidence: 72, bestModel: "ML Ensemble", accuracy: 79 },
  ],
  modelStats: [
    { name: "Poisson Model", accuracy: 78, lastCalibration: "hace 2h" },
    { name: "Dixon-Coles", accuracy: 82, lastCalibration: "hace 4h" },
    { name: "ELO Dynamic", accuracy: 71, lastCalibration: "hace 6h" },
    { name: "ML Ensemble", accuracy: 79, lastCalibration: "hace 3h" },
  ],
  bankroll: {
    initial: 10000,
    current: 10830,
    pnl: 830,
    pnlPercent: 8.3,
    avgStake: 2.3,
    kellyFraction: 35,
  },
};

export function getGambitoData(
  partial?: DeepPartial<GambitoData>
): GambitoData {
  return mergeWithDefaults(partial, defaultGambitoData);
}

export const gambitoData = defaultGambitoData;
