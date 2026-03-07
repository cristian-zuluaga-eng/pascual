"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import {
  AgentHeader,
  SubAgentStatusGrid,
  Canvas,
  SectionCard,
  ProgressBar,
  FilterTabs,
  ExpandableListItem,
  AgentConfigModal,
  useAgentConfig,
} from "@/components/agents";
import { useGrowl } from "@/components/growl";
import { audiovisualData } from "@/lib/api/mock/pascual-agents";

export default function AudiovisualDashboard() {
  const [data] = useState(audiovisualData);
  const [libraryFilter, setLibraryFilter] = useState<"all" | "image" | "video" | "audio" | "text">("all");
  const [librarySearch, setLibrarySearch] = useState("");
  const { sendToAgent } = useGrowl();

  // Usar el hook reutilizable para configuración del agente
  const {
    showConfigModal,
    agentData,
    handleAgentModelChange,
    handleSubAgentModelChange,
    openConfig,
    closeConfig,
  } = useAgentConfig("audiovisual");

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
    <div className="space-y-4">
      <AgentHeader
        name={data.name}
        icon={data.icon}
        lema={data.lema}
        status={data.status}
        showTimeRange={true}
        usage={{
          data: [40, 45, 50, 48, 55, 60, 58, 65, 62, 70],
          dataByRange: {
            "24h": [40, 45, 50, 48, 55, 60, 58, 65, 62, 70],
            "7d": [280, 350, 320, 390, 420, 460, 410],
            "1m": [1100, 1350, 1280, 1420, 1550, 1320, 1480, 1620, 1580, 1750, 1820, 1680],
            "1y": [11500, 13200, 12800, 14600, 16200, 17800, 18500, 19200, 20100, 21500, 23800, 25100],
          },
          color: "#ffaa00",
        }}
        kpis={[
          {
            label: "Generados",
            value: data.metrics.assetsGenerated,
            values: { "24h": data.metrics.assetsGenerated, "7d": 542, "1m": 2180, "1y": 26500 },
            status: "neutral",
          },
          {
            label: "En Cola",
            value: data.metrics.inQueue,
            values: { "24h": data.metrics.inQueue, "7d": 5, "1m": 4, "1y": 3 },
            status: data.metrics.inQueue > 5 ? "warning" : "good",
            statuses: { "24h": "good", "7d": "warning", "1m": "good", "1y": "good" },
          },
          {
            label: "Calidad",
            value: `${data.metrics.avgQuality}%`,
            values: { "24h": `${data.metrics.avgQuality}%`, "7d": "85%", "1m": "83%", "1y": "81%" },
            status: data.metrics.avgQuality >= 80 ? "good" : "warning",
            statuses: { "24h": "good", "7d": "good", "1m": "good", "1y": "warning" },
          },
          {
            label: "Storage",
            value: data.metrics.storageUsed,
            values: { "24h": data.metrics.storageUsed, "7d": "2.1 GB", "1m": "1.8 GB", "1y": "1.2 GB" },
            status: "neutral",
          },
          {
            label: "Coherencia",
            value: `${data.metrics.brandCoherenceScore}%`,
            values: { "24h": `${data.metrics.brandCoherenceScore}%`, "7d": "92%", "1m": "90%", "1y": "88%" },
            status: data.metrics.brandCoherenceScore >= 90 ? "good" : "warning",
            statuses: { "24h": "good", "7d": "good", "1m": "good", "1y": "warning" },
          },
        ]}
      />

      {/* Sub-Agents Status Grid */}
      <SubAgentStatusGrid
        subAgents={data.subAgents}
        onSettings={openConfig}
      />

      {/* Canvas, Biblioteca, Cola de Producción, Assets Recientes & Brand Coherence - Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Canvas - Lienzo de respuestas de Pascual */}
        <Canvas
          title="Canvas"
          placeholder="¿Qué contenido necesitas crear?"
          onSendMessage={(msg) => sendToAgent("audiovisual", "Audiovisual", "🎬", msg)}
          minHeight="180px"
          quickPrompts={[
            { label: "Crear imagen", prompt: "Genera una imagen de alta calidad para redes sociales" },
            { label: "Generar video", prompt: "Crea un video explicativo de 30 segundos" },
            { label: "Audio/Voz", prompt: "Genera una narración profesional para este texto" },
          ]}
        />

        {/* Biblioteca de Assets */}
        <SectionCard
          title="Biblioteca de Assets"
          action={
            <FilterTabs
              options={[
                { value: "all", label: "Todos" },
                { value: "image", label: "🖼️" },
                { value: "video", label: "🎬" },
                { value: "audio", label: "🎵" },
                { value: "text", label: "📝" },
              ]}
              value={libraryFilter}
              onChange={setLibraryFilter}
              searchValue={librarySearch}
              onSearchChange={setLibrarySearch}
              searchPlaceholder="Buscar asset..."
            />
          }
          maxHeight="320px"
        >
          {libraryFilter === "all" && !librarySearch ? (
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
          ) : (
            <div className="space-y-2 mb-4">
              {data.recentAssets
                .filter((asset) => libraryFilter === "all" || asset.type === libraryFilter)
                .filter((asset) => librarySearch === "" || asset.name.toLowerCase().includes(librarySearch.toLowerCase()))
                .map((asset) => (
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
              {data.recentAssets
                .filter((asset) => libraryFilter === "all" || asset.type === libraryFilter)
                .filter((asset) => librarySearch === "" || asset.name.toLowerCase().includes(librarySearch.toLowerCase()))
                .length === 0 && (
                <p className="font-mono text-xs text-zinc-500 text-center py-4">
                  No hay assets {librarySearch && `que contengan "${librarySearch}"`}
                </p>
              )}
            </div>
          )}
          <div className="pt-3 border-t border-zinc-800">
            <p className="font-mono text-[10px] text-zinc-500 mb-2">Más usado:</p>
            <p className="font-mono text-xs text-[#00d9ff]">{data.libraryStats.mostUsed}</p>
          </div>
        </SectionCard>

        {/* Cola de Producción */}
        <SectionCard
          title="Cola de Producción"
          action={
            <Badge variant={data.metrics.inQueue > 0 ? "info" : "success"}>
              {data.metrics.inQueue} en cola
            </Badge>
          }
          maxHeight="320px"
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

        {/* Assets Recientes */}
        <SectionCard
          title="Assets Recientes"
          action={
            <button className="font-mono text-xs text-[#00d9ff] hover:underline">Ver todos</button>
          }
          maxHeight="320px"
        >
          <div className="space-y-2">
            {data.recentAssets.map((asset) => (
              <ExpandableListItem
                key={asset.id}
                icon={<span>{getTypeIcon(asset.type)}</span>}
                title={asset.name}
                subtitle={asset.details ? `${asset.details.requestedByIcon} Solicitado por ${asset.details.requestedBy}` : asset.createdAt}
                timestamp={`${asset.usageCount}x usado`}
                status="completed"
                expandable={!!asset.details}
                details={asset.details ? [
                  { label: "Solicitado por", value: `${asset.details.requestedByIcon} ${asset.details.requestedBy}` },
                  { label: "Prompt", value: asset.details.prompt || "-" },
                  { label: "Formato", value: asset.details.format || "-" },
                  { label: "Tamaño", value: asset.details.fileSize || "-" },
                  ...(asset.details.dimensions ? [{ label: "Dimensiones", value: asset.details.dimensions }] : []),
                  ...(asset.details.duration ? [{ label: "Duración", value: asset.details.duration }] : []),
                  { label: "Calidad", value: asset.details.quality ? `${asset.details.quality}%` : "-" },
                  { label: "Último uso", value: asset.details.lastUsed || "-" },
                  { label: "Tags", value: asset.details.tags?.join(", ") || "-" },
                  { label: "Creado", value: asset.createdAt },
                ] : undefined}
              />
            ))}
          </div>
        </SectionCard>

        {/* Coherencia de Marca */}
        <SectionCard title="Coherencia de Marca" maxHeight="320px">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-2 bg-zinc-900 rounded-sm">
              <span className="font-mono text-xs text-zinc-400">🎨 Paleta de Colores</span>
              <span className={`font-mono text-xs ${data.brandCoherence.colorPalette ? "text-[#39ff14]" : "text-[#ff006e]"}`}>
                {data.brandCoherence.colorPalette ? "✓ Consistente" : "✕ Problemas"}
              </span>
            </div>
            <div className="flex items-center justify-between p-2 bg-zinc-900 rounded-sm">
              <span className="font-mono text-xs text-zinc-400">🔤 Tipografía</span>
              <span className={`font-mono text-xs ${data.brandCoherence.typography ? "text-[#39ff14]" : "text-[#ff006e]"}`}>
                {data.brandCoherence.typography ? "✓ Consistente" : "✕ Problemas"}
              </span>
            </div>
            <div className="flex items-center justify-between p-2 bg-zinc-900 rounded-sm">
              <span className="font-mono text-xs text-zinc-400">◉ Uso de Logo</span>
              <span className={`font-mono text-xs ${data.brandCoherence.logoUsage ? "text-[#39ff14]" : "text-[#ff006e]"}`}>
                {data.brandCoherence.logoUsage ? "✓ Correcto" : "✕ Problemas"}
              </span>
            </div>
            <div className="flex items-center justify-between p-2 bg-zinc-900 rounded-sm">
              <span className="font-mono text-xs text-zinc-400">💬 Tono de Voz</span>
              <span className={`font-mono text-xs ${data.brandCoherence.toneOfVoice ? "text-[#39ff14]" : "text-[#ff006e]"}`}>
                {data.brandCoherence.toneOfVoice ? "✓ On-brand" : "✕ Off-brand"}
              </span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-zinc-800">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-zinc-500">Tasa de Reutilización</span>
              <span className="font-mono text-sm text-white">{data.metrics.assetReuseRate}%</span>
            </div>
            <ProgressBar label="" value={data.metrics.assetReuseRate} color="#39ff14" showValue={false} />
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
