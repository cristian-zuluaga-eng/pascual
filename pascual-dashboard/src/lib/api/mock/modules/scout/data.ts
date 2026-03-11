// ============================================================================
// SCOUT - Mock Data
// ============================================================================

import { DeepPartial, mergeWithDefaults } from "../../types/base";
import { ScoutData } from "./types";

const defaultScoutData: ScoutData = {
  id: "scout",
  name: "Scout",
  icon: "🔍",
  lema: "Toda la informacion, donde la necesites, cuando la necesites",
  description: "Maestro en Busqueda e Ingesta de Datos",
  status: "active",
  lastSync: "continua",
  quickActions: [
    { id: "search", label: "Buscar datos", icon: "🔍", prompt: "Pascual, busca informacion sobre [tema]" },
    { id: "monitor", label: "Monitorear tema", icon: "📡", prompt: "Pascual, monitorea actualizaciones sobre [tema]" },
    { id: "extract", label: "Extraer de URL", icon: "📥", prompt: "Pascual, extrae datos de [URL]" },
    { id: "synthesize", label: "Sintetizar", icon: "📊", prompt: "Pascual, sintetiza la informacion recopilada sobre [tema]" },
  ],
  recentMessages: [],
  metrics: {
    searchesToday: 245,
    searchAccuracy: 96,
    sourcesActive: 34,
    dataProcessed: "4.2 GB",
    alertsPending: 3,
    cacheHitRate: 78,
    avgSearchLatency: 1200,
    dailyQuotaUsed: 62,
  },
  recentSearches: [
    {
      id: "1",
      query: "AI market trends 2025",
      resultCount: 156,
      timestamp: "hace 2m",
      status: "completed",
      details: {
        source: "NewsAPI, Google Scholar",
        url: "https://api.newsapi.org/v2/everything?q=AI+market",
        searchTime: "1.2s",
        dataSize: "2.4 MB",
        agent: "Hunter",
        relevanceScore: 94,
        cachedResult: false,
        tags: ["AI", "market", "trends", "2025"],
      },
    },
    {
      id: "2",
      query: "React 19 features",
      resultCount: 89,
      timestamp: "hace 15m",
      status: "completed",
      details: {
        source: "GitHub, Dev.to, Medium",
        url: "https://api.github.com/search/repositories?q=react+19",
        searchTime: "0.8s",
        dataSize: "1.1 MB",
        agent: "Hunter",
        relevanceScore: 98,
        cachedResult: true,
        tags: ["React", "JavaScript", "frontend"],
      },
    },
    {
      id: "3",
      query: "Colombian economy 2025",
      resultCount: 234,
      timestamp: "hace 1h",
      status: "completed",
      details: {
        source: "Financial APIs, Reuters",
        url: "https://api.financialdata.com/economy/colombia",
        searchTime: "2.1s",
        dataSize: "4.7 MB",
        agent: "Harvester",
        relevanceScore: 87,
        cachedResult: false,
        tags: ["Colombia", "economy", "finance", "LATAM"],
      },
    },
  ],
  monitoredTrends: [
    { id: "1", name: "Bitcoin price", icon: "📈", change: "+2.3%", direction: "up" },
    { id: "2", name: "Tech news", icon: "📰", change: "12 new", direction: "up", newItems: 12 },
    { id: "3", name: "LaLiga standings", icon: "⚽", change: "Updated", direction: "neutral" },
    { id: "4", name: "S&P 500", icon: "📊", change: "-0.5%", direction: "down" },
    { id: "5", name: "Competitor activity", icon: "🌐", change: "3 new", direction: "up", newItems: 3 },
  ],
  dataSources: [
    { id: "1", name: "NewsAPI", status: "active", reliability: 98 },
    { id: "2", name: "Twitter/X", status: "active", reliability: 95 },
    { id: "3", name: "Financial APIs", status: "active", reliability: 99 },
    { id: "4", name: "Reddit", status: "rate_limited", reliability: 45 },
    { id: "5", name: "Google Scholar", status: "active", reliability: 92 },
  ],
  resourceUsage: { cpu: 28, memory: 45, api: 62 },
};

export function getScoutData(
  partial?: DeepPartial<ScoutData>
): ScoutData {
  return mergeWithDefaults(partial, defaultScoutData);
}

export const scoutData = defaultScoutData;
