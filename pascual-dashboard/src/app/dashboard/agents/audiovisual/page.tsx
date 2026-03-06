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
import { audiovisualData } from "@/lib/api/mock/pascual-agents";

export default function AudiovisualDashboard() {
  const [data] = useState(audiovisualData);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "image": return "🖼️";
      case "video": return "🎬";
      case "audio": return "🎵";
      case "text": return "📝";
      default: return "📄";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "processing": return "text-[#00d9ff]";
      case "queued": return "text-amber-400";
      case "completed": return "text-[#39ff14]";
      case "failed": return "text-[#ff006e]";
      default: return "text-zinc-400";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "processing": return "◐";
      case "queued": return "○";
      case "completed": return "✓";
      case "failed": return "✕";
      default: return "•";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical": return "border-[#ff006e]";
      case "high": return "border-amber-500";
      case "medium": return "border-[#00d9ff]";
      case "low": return "border-zinc-600";
      default: return "border-zinc-700";
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
        agentId={data.id}
        agentName={data.name}
        agentIcon={data.icon}
        quickActions={data.quickActions}
        placeholder="¿Qué contenido necesitas crear?"
      />

      {/* KPIs */}
      <Section>
        <Grid cols={5}>
          <KPICard
            title="Assets Generados"
            value={data.metrics.assetsGenerated}
            trend={{ value: 12, positive: true }}
          />
          <KPICard
            title="En Cola"
            value={data.metrics.inQueue}
            status={data.metrics.inQueue > 5 ? "warning" : "neutral"}
          />
          <KPICard
            title="Calidad Promedio"
            value={`${data.metrics.avgQuality}%`}
            status={data.metrics.avgQuality >= 80 ? "good" : "warning"}
          />
          <KPICard
            title="Storage"
            value={data.metrics.storageUsed}
            status="neutral"
          />
          <KPICard
            title="Brand Coherence"
            value={`${data.metrics.brandCoherenceScore}%`}
            status={data.metrics.brandCoherenceScore >= 90 ? "good" : "warning"}
          />
        </Grid>
      </Section>

      {/* Production Queue & Library */}
      <Section>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Production Queue */}
          <SectionCard
            title="Cola de Producción"
            action={
              <Badge variant={data.metrics.inQueue > 0 ? "info" : "success"}>
                {data.metrics.inQueue} en cola
              </Badge>
            }
          >
            <div className="space-y-2">
              {data.productionQueue.map((item) => (
                <div
                  key={item.id}
                  className={`p-3 bg-zinc-900 rounded-sm border-l-2 ${getPriorityColor(item.priority)}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span>{getTypeIcon(item.type)}</span>
                      <span className="font-mono text-xs text-white">{item.title}</span>
                    </div>
                    <span className={`font-mono text-xs ${getStatusColor(item.status)}`}>
                      {getStatusIcon(item.status)} {item.status}
                    </span>
                  </div>
                  {item.progress !== undefined && (
                    <div className="mt-2">
                      <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#00d9ff] rounded-full transition-all duration-300"
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="font-mono text-[10px] text-zinc-500">{item.progress}%</span>
                        {item.estimatedTime && (
                          <span className="font-mono text-[10px] text-zinc-500">~{item.estimatedTime}</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {data.productionQueue.length === 0 && (
                <p className="font-mono text-xs text-zinc-500 text-center py-4">
                  No hay items en cola
                </p>
              )}
            </div>
          </SectionCard>

          {/* Asset Library */}
          <SectionCard title="Biblioteca de Assets">
            <div className="grid grid-cols-4 gap-3 mb-4">
              <div className="text-center p-2 bg-zinc-900 rounded-sm">
                <span className="text-xl">🖼️</span>
                <p className="font-mono text-lg font-bold text-white">{data.libraryStats.images.count}</p>
                <p className="font-mono text-[10px] text-zinc-500">{data.libraryStats.images.size}</p>
              </div>
              <div className="text-center p-2 bg-zinc-900 rounded-sm">
                <span className="text-xl">🎬</span>
                <p className="font-mono text-lg font-bold text-white">{data.libraryStats.videos.count}</p>
                <p className="font-mono text-[10px] text-zinc-500">{data.libraryStats.videos.size}</p>
              </div>
              <div className="text-center p-2 bg-zinc-900 rounded-sm">
                <span className="text-xl">🎵</span>
                <p className="font-mono text-lg font-bold text-white">{data.libraryStats.audio.count}</p>
                <p className="font-mono text-[10px] text-zinc-500">{data.libraryStats.audio.size}</p>
              </div>
              <div className="text-center p-2 bg-zinc-900 rounded-sm">
                <span className="text-xl">📝</span>
                <p className="font-mono text-lg font-bold text-white">{data.libraryStats.text.count}</p>
                <p className="font-mono text-[10px] text-zinc-500">{data.libraryStats.text.size}</p>
              </div>
            </div>
            <div className="pt-3 border-t border-zinc-800">
              <p className="font-mono text-[10px] text-zinc-500 mb-2">Más usado:</p>
              <p className="font-mono text-xs text-[#00d9ff]">{data.libraryStats.mostUsed}</p>
            </div>
          </SectionCard>
        </div>
      </Section>

      {/* Recent Assets & Brand Coherence */}
      <Section>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Assets */}
          <SectionCard
            title="Assets Recientes"
            action={
              <button className="font-mono text-xs text-[#00d9ff] hover:underline">Ver todos</button>
            }
          >
            <div className="space-y-2">
              {data.recentAssets.map((asset) => (
                <div
                  key={asset.id}
                  className="flex items-center justify-between p-2 bg-zinc-900 rounded-sm"
                >
                  <div className="flex items-center gap-2">
                    <span>{getTypeIcon(asset.type)}</span>
                    <div>
                      <p className="font-mono text-xs text-white">{asset.name}</p>
                      <p className="font-mono text-[10px] text-zinc-500">{asset.createdAt}</p>
                    </div>
                  </div>
                  <Badge variant="default" className="text-[9px]">
                    {asset.usageCount}x usado
                  </Badge>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Brand Coherence */}
          <SectionCard title="Brand Coherence Check">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2 bg-zinc-900 rounded-sm">
                <span className="font-mono text-xs text-zinc-400">🎨 Color Palette</span>
                <span className={`font-mono text-xs ${data.brandCoherence.colorPalette ? "text-[#39ff14]" : "text-[#ff006e]"}`}>
                  {data.brandCoherence.colorPalette ? "✓ Consistent" : "✕ Issues"}
                </span>
              </div>
              <div className="flex items-center justify-between p-2 bg-zinc-900 rounded-sm">
                <span className="font-mono text-xs text-zinc-400">🔤 Typography</span>
                <span className={`font-mono text-xs ${data.brandCoherence.typography ? "text-[#39ff14]" : "text-[#ff006e]"}`}>
                  {data.brandCoherence.typography ? "✓ Consistent" : "✕ Issues"}
                </span>
              </div>
              <div className="flex items-center justify-between p-2 bg-zinc-900 rounded-sm">
                <span className="font-mono text-xs text-zinc-400">◉ Logo Usage</span>
                <span className={`font-mono text-xs ${data.brandCoherence.logoUsage ? "text-[#39ff14]" : "text-[#ff006e]"}`}>
                  {data.brandCoherence.logoUsage ? "✓ Correct" : "✕ Issues"}
                </span>
              </div>
              <div className="flex items-center justify-between p-2 bg-zinc-900 rounded-sm">
                <span className="font-mono text-xs text-zinc-400">💬 Tone of Voice</span>
                <span className={`font-mono text-xs ${data.brandCoherence.toneOfVoice ? "text-[#39ff14]" : "text-[#ff006e]"}`}>
                  {data.brandCoherence.toneOfVoice ? "✓ On-brand" : "✕ Off-brand"}
                </span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-zinc-800">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-zinc-500">Asset Reuse Rate</span>
                <span className="font-mono text-sm text-white">{data.metrics.assetReuseRate}%</span>
              </div>
              <ProgressBar label="" value={data.metrics.assetReuseRate} color="#39ff14" showValue={false} />
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
