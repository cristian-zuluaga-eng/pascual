"use client";

import { useState } from "react";
import { Section, Grid } from "@/components/layout/MainContent";
import { Badge } from "@/components/ui/Badge";
import {
  AgentHeader,
  PascualFeedbackBar,
  SubAgentsStatusBar,
  KPICard,
  ProgressBar,
  SectionCard,
} from "@/components/agents";
import { scoutData } from "@/lib/api/mock/pascual-agents";

export default function ScoutDashboard() {
  const [data] = useState(scoutData);

  const getSearchStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "text-[#39ff14]";
      case "processing": return "text-[#00d9ff]";
      case "failed": return "text-[#ff006e]";
      default: return "text-zinc-400";
    }
  };

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
    <div className="space-y-6">
      <AgentHeader
        name={data.name}
        icon={data.icon}
        lema={data.lema}
        status={data.status}
        onRefresh={() => console.log("Refresh")}
      />

      <PascualFeedbackBar
        agentName={data.name}
        quickActions={data.quickActions}
        placeholder="¿Qué información necesitas buscar?"
        onSendMessage={(msg) => console.log("Message:", msg)}
      />

      {/* KPIs */}
      <Section>
        <Grid cols={5}>
          <KPICard
            title="Búsquedas Hoy"
            value={data.metrics.searchesToday}
            status="neutral"
          />
          <KPICard
            title="Precisión"
            value={`${data.metrics.searchAccuracy}%`}
            status={data.metrics.searchAccuracy >= 90 ? "good" : "warning"}
          />
          <KPICard
            title="Fuentes Activas"
            value={data.metrics.sourcesActive}
            status="neutral"
          />
          <KPICard
            title="Data Procesada"
            value={data.metrics.dataProcessed}
            status="neutral"
          />
          <KPICard
            title="Cache Hit"
            value={`${data.metrics.cacheHitRate}%`}
            status={data.metrics.cacheHitRate >= 70 ? "good" : "warning"}
          />
        </Grid>
      </Section>

      {/* Searches & Trends */}
      <Section>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Searches */}
          <SectionCard
            title="Búsquedas Recientes"
            action={
              <span className="font-mono text-[10px] text-zinc-500">
                Latencia: {data.metrics.avgSearchLatency}ms
              </span>
            }
          >
            <div className="space-y-2">
              {data.recentSearches.map((search) => (
                <div
                  key={search.id}
                  className="flex items-center gap-3 p-2 bg-zinc-900 rounded-sm"
                >
                  <span className={`font-mono text-sm ${getSearchStatusColor(search.status)}`}>
                    {search.status === "completed" ? "✓" : search.status === "processing" ? "◐" : "✕"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-xs text-white truncate">{search.query}</p>
                    <p className="font-mono text-[10px] text-zinc-500">
                      {search.resultCount} resultados
                    </p>
                  </div>
                  <span className="font-mono text-[10px] text-zinc-600">{search.timestamp}</span>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Monitored Trends */}
          <SectionCard
            title="Tendencias Monitoreadas"
            action={
              <Badge variant="info">{data.metrics.alertsPending} alertas</Badge>
            }
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
        </div>
      </Section>

      {/* Data Sources & Resource Usage */}
      <Section>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Data Sources */}
          <SectionCard title="Fuentes de Datos">
            <div className="space-y-2">
              {data.dataSources.map((source) => (
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
            </div>
          </SectionCard>

          {/* Resource Usage */}
          <SectionCard title="Uso de Recursos">
            <div className="space-y-4">
              <ProgressBar
                label="CPU"
                value={data.resourceUsage.cpu}
                color={data.resourceUsage.cpu > 80 ? "#ff006e" : "#00d9ff"}
              />
              <ProgressBar
                label="Memory"
                value={data.resourceUsage.memory}
                color={data.resourceUsage.memory > 80 ? "#ff006e" : "#39ff14"}
              />
              <ProgressBar
                label="API Quota"
                value={data.resourceUsage.api}
                color={data.resourceUsage.api > 80 ? "#ff006e" : "#ffaa00"}
              />
            </div>
            <div className="mt-4 pt-4 border-t border-zinc-800">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-zinc-500">Daily Quota Used</span>
                <span className={`font-mono text-sm ${data.metrics.dailyQuotaUsed > 80 ? "text-[#ff006e]" : "text-white"}`}>
                  {data.metrics.dailyQuotaUsed}%
                </span>
              </div>
              <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden mt-2">
                <div
                  className={`h-full rounded-full ${data.metrics.dailyQuotaUsed > 80 ? "bg-[#ff006e]" : "bg-gradient-to-r from-[#00d9ff] to-[#39ff14]"}`}
                  style={{ width: `${data.metrics.dailyQuotaUsed}%` }}
                />
              </div>
            </div>
          </SectionCard>
        </div>
      </Section>

      <SubAgentsStatusBar
        subAgents={data.subAgents}
        lastSync={data.lastSync}
      />
    </div>
  );
}
