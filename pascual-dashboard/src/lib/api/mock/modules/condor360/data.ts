// ============================================================================
// CONDOR360 - Mock Data
// ============================================================================

import { DeepPartial, mergeWithDefaults } from "../../types/base";
import { Condor360Data } from "./types";

const defaultCondor360Data: Condor360Data = {
  id: "condor360",
  name: "Condor360",
  icon: "📈",
  lema: "Vision panoramica - Precision microscopica",
  description: "Sistema de Inteligencia Financiera",
  status: "active",
  lastSync: "real-time (markets)",
  quickActions: [
    { id: "analyze", label: "Analizar activo", icon: "📊", prompt: "Pascual, analiza [ticker] con analisis tecnico y fundamental" },
    { id: "portfolio", label: "Mi portafolio", icon: "💼", prompt: "Pascual, genera un reporte de mi portafolio actual" },
    { id: "opportunities", label: "Oportunidades", icon: "🎯", prompt: "Pascual, identifica oportunidades de inversion segun mi perfil" },
    { id: "rebalance", label: "Rebalancear", icon: "⚖️", prompt: "Pascual, sugiere rebalanceo optimo de mi portafolio" },
  ],
  recentMessages: [],
  metrics: {
    portfolioReturn: 12.4,
    sharpeRatio: 1.8,
    maxDrawdown: -8.2,
    alpha: 3.2,
    signalsActive: 7,
    predictionAccuracy: 68,
  },
  portfolioAllocation: [
    { asset: "Stocks", percentage: 65, color: "#00d9ff" },
    { asset: "Bonds", percentage: 20, color: "#39ff14" },
    { asset: "Crypto", percentage: 10, color: "#ff006e" },
    { asset: "Cash", percentage: 5, color: "#ffaa00" },
  ],
  topHoldings: [
    { symbol: "AAPL", percentage: 15.2, todayChange: 2.3 },
    { symbol: "MSFT", percentage: 12.8, todayChange: 1.1 },
    { symbol: "NVDA", percentage: 10.5, todayChange: 4.2 },
    { symbol: "GOOGL", percentage: 8.3, todayChange: -0.5 },
  ],
  marketSignals: [
    { id: "1", conviction: "high", symbol: "NVDA", title: "Strong momentum", target: 950, current: 875, upside: 8.5, confidence: 92, reason: "Fuerte momentum tecnico y fundamentales solidos" },
    { id: "2", conviction: "medium", symbol: "AMZN", title: "Earnings catalyst", target: 195, current: 182, upside: 7.1, confidence: 74, reason: "Catalizador de earnings proximo" },
    { id: "3", conviction: "low", symbol: "XYZ", title: "Deteriorating fundamentals", target: 0, current: 45, upside: -50, confidence: 68, reason: "Fundamentales deteriorandose", action: "Reduce position 50%" },
  ],
  sectorPerformance: [
    { sector: "Technology", change: 2.1 },
    { sector: "Healthcare", change: 1.2 },
    { sector: "Finance", change: 0.8 },
    { sector: "Energy", change: 0.3 },
    { sector: "Consumer", change: -0.2 },
    { sector: "Utilities", change: -0.5 },
  ],
  modelConfidence: [
    { sector: "Tecnologia", confidence: 92, conviction: "high" },
    { sector: "Energia", confidence: 87, conviction: "high" },
    { sector: "Petroleo", confidence: 78, conviction: "medium" },
    { sector: "Divisas", confidence: 84, conviction: "medium" },
    { sector: "Salud", confidence: 71, conviction: "medium" },
    { sector: "Finanzas", confidence: 89, conviction: "high" },
    { sector: "Consumo", confidence: 68, conviction: "medium" },
    { sector: "Inmobiliario", confidence: 62, conviction: "low" },
    { sector: "Criptomonedas", confidence: 58, conviction: "low" },
    { sector: "Materiales", confidence: 74, conviction: "medium" },
    { sector: "Industriales", confidence: 81, conviction: "medium" },
    { sector: "Telecomunicaciones", confidence: 66, conviction: "medium" },
  ],
  news: [
    { id: "1", title: "Fed signals rate pause", impact: "positive", timestamp: "hace 2h" },
    { id: "2", title: "NVDA beats estimates", impact: "positive", timestamp: "hace 5h" },
    { id: "3", title: "Oil prices rising", impact: "neutral", timestamp: "hace 8h" },
  ],
  recommendations: [
    { id: "1", type: "buy", asset: "NVDA", reason: "Fuerte momentum + catalizador de earnings", confidence: 87, timestamp: "hace 1h" },
    { id: "2", type: "hold", asset: "AAPL", reason: "Consolidacion antes de nuevo ciclo de iPhone", confidence: 72, timestamp: "hace 3h" },
    { id: "3", type: "sell", asset: "INTC", reason: "Perdida de market share en servidores", confidence: 65, timestamp: "hace 5h" },
  ],
  marketSentiment: "bullish",
  vix: 14.2,
};

export function getCondor360Data(
  partial?: DeepPartial<Condor360Data>
): Condor360Data {
  return mergeWithDefaults(partial, defaultCondor360Data);
}

export const condor360Data = defaultCondor360Data;
