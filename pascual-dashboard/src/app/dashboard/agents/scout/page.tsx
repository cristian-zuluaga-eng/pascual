"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import {
  AgentHeader,
  SubAgentStatusGrid,
  Canvas,
  SectionCard,
  ExpandableListItem,
  FilterTabs,
  AgentConfigModal,
  useAgentConfig,
} from "@/components/agents";
import { useGrowl } from "@/components/growl";
import { scoutData } from "@/lib/api/mock/pascual-agents";

export default function ScoutDashboard() {
  const [data] = useState(scoutData);
  const [sourceFilter, setSourceFilter] = useState<"all" | "active" | "rate_limited" | "offline" | "error">("all");
  const [sourceSearch, setSourceSearch] = useState("");
  const [searchFilter, setSearchFilter] = useState<"all" | "completed" | "processing" | "pending" | "failed">("all");
  const [searchSearch, setSearchSearch] = useState("");
  const { sendToAgent } = useGrowl();

  // Usar el hook reutilizable para configuración del agente
  const {
    showConfigModal,
    agentData,
    handleAgentModelChange,
    handleSubAgentModelChange,
    openConfig,
    closeConfig,
  } = useAgentConfig("scout");

  const getSourceStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-[#39ff14]";
      case "rate_limited": return "bg-amber-500";
      case "offline": return "bg-zinc-600";
      case "error": return "bg-[#ff006e]";
      default: return "bg-zinc-600";
    }
  };

  const getTrendDirection = (direction: string) => {
    switch (direction) {
      case "up": return { icon: "▲", color: "text-[#39ff14]" };
      case "down": return { icon: "▼", color: "text-[#ff006e]" };
      default: return { icon: "●", color: "text-zinc-500" };
    }
  };

  return (
    <div className="space-y-4">
      <AgentHeader
        name={data.name}
        icon={data.icon}
        lema={data.lema}
        status={data.status}
        showTimeRange={true}
        usage={{
          data: [45, 62, 58, 71, 68, 82, 75, 89, 84, 91],
          dataByRange: {
            "24h": [45, 62, 58, 71, 68, 82, 75, 89, 84, 91],
            "7d": [320, 410, 385, 445, 490, 520, 478],
            "1m": [1200, 1450, 1380, 1520, 1650, 1420, 1580, 1720, 1680, 1850, 1920, 1780],
            "1y": [12500, 14200, 13800, 15600, 16200, 17800, 18500, 19200, 20100, 21500, 22800, 24100],
          },
          color: "#00d9ff",
        }}
        kpis={[
          {
            label: "Búsquedas",
            value: data.metrics.searchesToday,
            values: { "24h": data.metrics.searchesToday, "7d": 847, "1m": 3420, "1y": 41500 },
            status: "neutral",
          },
          {
            label: "Precisión",
            value: `${data.metrics.searchAccuracy}%`,
            values: { "24h": `${data.metrics.searchAccuracy}%`, "7d": "91%", "1m": "89%", "1y": "87%" },
            status: data.metrics.searchAccuracy >= 90 ? "good" : "warning",
            statuses: { "24h": "good", "7d": "good", "1m": "warning", "1y": "warning" },
          },
          {
            label: "Fuentes",
            value: data.metrics.sourcesActive,
            status: "neutral",
          },
          {
            label: "Data",
            value: data.metrics.dataProcessed,
            values: { "24h": data.metrics.dataProcessed, "7d": "18.2GB", "1m": "72.5GB", "1y": "845GB" },
            status: "neutral",
          },
          {
            label: "Cache",
            value: `${data.metrics.cacheHitRate}%`,
            values: { "24h": `${data.metrics.cacheHitRate}%`, "7d": "68%", "1m": "71%", "1y": "74%" },
            status: data.metrics.cacheHitRate >= 70 ? "good" : "warning",
            statuses: { "24h": "good", "7d": "warning", "1m": "good", "1y": "good" },
          },
        ]}
      />

      {/* Sub-Agents Status Grid */}
      <SubAgentStatusGrid
        subAgents={data.subAgents}
        onSettings={openConfig}
      />

      {/* Canvas, Searches, Trends & Data Sources - 2x2 Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Canvas - Lienzo de respuestas de Pascual */}
        <Canvas
          title="Canvas"
          placeholder="¿Qué quieres buscar con Scout?"
          onSendMessage={(msg) => sendToAgent("scout", "Scout", "🔍", msg)}
          minHeight="180px"
          quickPrompts={[
            { label: "Tendencias AI", prompt: "¿Cuáles son las tendencias actuales en AI?" },
            { label: "Noticias tech", prompt: "Busca las últimas noticias de tecnología" },
            { label: "Análisis mercado", prompt: "Analiza el mercado de criptomonedas" },
          ]}
        />

        {/* Recent Searches */}
        <SectionCard
          title="Búsquedas Recientes"
          action={
            <FilterTabs
              options={[
                { value: "all", label: "Todos" },
                { value: "completed", label: "done" },
                { value: "processing", label: "running" },
                { value: "pending", label: "pending" },
                { value: "failed", label: "failed" },
              ]}
              value={searchFilter}
              onChange={setSearchFilter}
              searchValue={searchSearch}
              onSearchChange={setSearchSearch}
              searchPlaceholder="Buscar..."
            />
          }
          maxHeight="320px"
        >
          <div className="space-y-2">
            {data.recentSearches
              .filter((search) => searchFilter === "all" || search.status === searchFilter)
              .filter((search) => searchSearch === "" || search.query.toLowerCase().includes(searchSearch.toLowerCase()))
              .map((search) => (
                <ExpandableListItem
                  key={search.id}
                  title={search.query}
                  subtitle={`${search.resultCount} resultados`}
                  timestamp={search.timestamp}
                  status={search.status}
                  expandable={!!search.details}
                  details={search.details ? [
                    { label: "Fuente", value: search.details.source || "-" },
                    { label: "Agente", value: search.details.agent || "-" },
                    { label: "Tiempo", value: search.details.searchTime || "-" },
                    { label: "Tamaño", value: search.details.dataSize || "-" },
                    { label: "Relevancia", value: `${search.details.relevanceScore}%` },
                    { label: "Cache", value: search.details.cachedResult ? "Sí" : "No" },
                    { label: "URL", value: search.details.url || "-" },
                    { label: "Tags", value: search.details.tags?.join(", ") || "-" },
                  ] : undefined}
                />
              ))}
            {data.recentSearches
              .filter((search) => searchFilter === "all" || search.status === searchFilter)
              .filter((search) => searchSearch === "" || search.query.toLowerCase().includes(searchSearch.toLowerCase()))
              .length === 0 && (
              <p className="font-mono text-xs text-zinc-500 text-center py-4">
                No hay búsquedas {searchSearch && `que contengan "${searchSearch}"`} {searchFilter !== "all" && `con estado "${searchFilter}"`}
              </p>
            )}
          </div>
        </SectionCard>

        {/* Monitored Trends */}
        <SectionCard
          title="Tendencias Monitoreadas"
          action={
            <Badge variant="info">{data.metrics.alertsPending} alertas</Badge>
          }
          maxHeight="320px"
        >
          <div className="space-y-2">
            {data.monitoredTrends.map((trend) => {
              const dir = getTrendDirection(trend.direction);
              return (
                <div
                  key={trend.id}
                  className="flex items-center justify-between p-2 bg-zinc-900 rounded-sm"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{trend.icon}</span>
                    <span className="font-mono text-xs text-white">{trend.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`font-mono text-xs ${dir.color}`}>
                      {dir.icon} {trend.change}
                    </span>
                    {trend.newItems && (
                      <Badge variant="info" className="text-[9px]">new</Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>

        {/* Data Sources */}
        <SectionCard
          title="Fuentes de Datos"
          action={
            <FilterTabs
              options={[
                { value: "all", label: "Todos" },
                { value: "active", label: "active" },
                { value: "rate_limited", label: "limited" },
                { value: "offline", label: "offline" },
                { value: "error", label: "error" },
              ]}
              value={sourceFilter}
              onChange={setSourceFilter}
              searchValue={sourceSearch}
              onSearchChange={setSourceSearch}
              searchPlaceholder="Buscar fuente..."
            />
          }
          maxHeight="320px"
        >
          <div className="space-y-2">
            {data.dataSources
              .filter((source) => sourceFilter === "all" || source.status === sourceFilter)
              .filter((source) => sourceSearch === "" || source.name.toLowerCase().includes(sourceSearch.toLowerCase()))
              .map((source) => (
                <div
                  key={source.id}
                  className="flex items-center justify-between p-2 bg-zinc-900 rounded-sm"
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${getSourceStatusColor(source.status)}`} />
                    <span className="font-mono text-xs text-white">{source.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-16">
                      <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#00d9ff] rounded-full"
                          style={{ width: `${source.reliability}%` }}
                        />
                      </div>
                    </div>
                    <span className="font-mono text-[10px] text-zinc-400 w-8 text-right">
                      {source.reliability}%
                    </span>
                    <Badge
                      variant={
                        source.status === "active" ? "success" :
                        source.status === "rate_limited" ? "warning" : "danger"
                      }
                      className="text-[9px]"
                    >
                      {source.status.replace("_", " ")}
                    </Badge>
                  </div>
                </div>
              ))}
            {data.dataSources
              .filter((source) => sourceFilter === "all" || source.status === sourceFilter)
              .filter((source) => sourceSearch === "" || source.name.toLowerCase().includes(sourceSearch.toLowerCase()))
              .length === 0 && (
              <p className="font-mono text-xs text-zinc-500 text-center py-4">
                No hay fuentes {sourceSearch && `que contengan "${sourceSearch}"`} {sourceFilter !== "all" && `con estado "${sourceFilter}"`}
              </p>
            )}
          </div>
        </SectionCard>
      </div>

      {/* Agent Configuration Modal - usando componente reutilizable */}
      {showConfigModal && (
        <AgentConfigModal
          agent={agentData}
          onClose={closeConfig}
          onAgentModelChange={handleAgentModelChange}
          onSubAgentModelChange={handleSubAgentModelChange}
        />
      )}
    </div>
  );
}
