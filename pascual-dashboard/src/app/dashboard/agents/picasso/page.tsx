"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import {
  AgentHeader,
  Canvas,
  SectionCard,
  AgentConfigModal,
  useAgentConfig,
} from "@/components/agents";
import { useGrowl } from "@/components/growl";
import { picassoData } from "@/lib/api/mock/pascual-agents";
import { useDashboardConfig } from "@/lib/context/DashboardConfigContext";

export default function PicassoDashboard() {
  const [data] = useState(picassoData);
  const { sendToAgent } = useGrowl();
  const { config } = useDashboardConfig();
  const [implementationSearch, setImplementationSearch] = useState("");

  // Usar el hook reutilizable para configuración del agente
  const {
    showConfigModal,
    agentData,
    handleAgentModelChange,
    handleSubAgentModelChange,
    openConfig,
    closeConfig,
  } = useAgentConfig("picasso");




  return (
    <div className="space-y-4">
      <AgentHeader
        name={data.name}
        icon={data.icon}
        lema={data.lema}
        status={data.status}
        showTimeRange={true}
        kpiVisibility={config.kpis.picasso}
        usage={{
          data: [55, 62, 58, 70, 75, 82, 78, 85, 90, 88],
          dataByRange: {
            "24h": [55, 62, 58, 70, 75, 82, 78, 85, 90, 88],
            "7d": [380, 450, 420, 520, 580, 620, 590],
            "1m": [1500, 1780, 1920, 2150, 2380, 2550, 2420, 2680, 2850, 3020, 3180, 3350],
            "1y": [15000, 18500, 22000, 26500, 31500, 37000, 43000, 49500, 56500, 64000, 72000, 80500],
          },
          color: "#39ff14",
        }}
        kpis={[
          {
            id: "uptime",
            label: "Uptime",
            value: `${data.metrics.uptime}%`,
            values: { "24h": `${data.metrics.uptime}%`, "7d": "99.92%", "1m": "99.85%", "1y": "99.72%" },
            status: data.metrics.uptime >= 99 ? "good" : "warning",
            statuses: { "24h": "good", "7d": "good", "1m": "good", "1y": "good" },
          },
          {
            id: "uxScore",
            label: "UX Score",
            value: `${data.metrics.uxScore}%`,
            values: { "24h": `${data.metrics.uxScore}%`, "7d": "91%", "1m": "89%", "1y": "86%" },
            status: data.metrics.uxScore >= 90 ? "good" : "warning",
            statuses: { "24h": "good", "7d": "good", "1m": "warning", "1y": "warning" },
          },
        ]}
      />

      {/* Canvas + Needs - Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Canvas - Lienzo de respuestas de Pascual */}
        <Canvas
          title="Canvas"
          placeholder="¿Qué necesitas diseñar o analizar?"
          onSendMessage={(msg) => sendToAgent("picasso", "Dashboard", "🎨", msg)}
          minHeight="180px"
          quickPrompts={[
            { label: "Auditar UI", prompt: "Ejecuta una auditoría de UI/UX" },
            { label: "Web Vitals", prompt: "Muéstrame el estado de los Core Web Vitals" },
            { label: "Accesibilidad", prompt: "Genera un reporte de accesibilidad" },
          ]}
        />

        {/* UX NECESIDADES */}
        <SectionCard title="NECESIDADES IDENTIFICADAS" visible={config.grids.picasso.necesidades} maxHeight="320px">
          <div className="space-y-4">
            {data.uxNeeds.map((need) => {
              const getPriorityColor = (priority: string) => {
                switch (priority) {
                  case "high": return "border-[#ff006e]/40";
                  case "medium": return "border-[#ffaa00]/40";
                  case "low": return "border-[#39ff14]/40";
                  default: return "border-zinc-700";
                }
              };

              return (
                <div
                  key={need.title}
                  className={`p-3 bg-zinc-900 rounded-sm border-l-2 ${getPriorityColor(need.priority)}`}
                >
                  <p className="font-mono text-sm text-white mb-2">{need.title}</p>
                  <p className="font-mono text-[10px] text-zinc-400">{need.description}</p>
                </div>
              );
            })}
          </div>
        </SectionCard>
      </div>

      {/* Log de Implementación - Full width */}
      <div className="grid grid-cols-1 gap-4">
        {/* Log de Implementación */}
        <SectionCard title="LOG DE IMPLEMENTACIÓN" visible={config.grids.picasso.logImplementacion} maxHeight="420px">
          {/* Filtro de texto */}
          <div className="mb-3">
            <input
              type="text"
              placeholder="Buscar en log..."
              value={implementationSearch}
              onChange={(e) => setImplementationSearch(e.target.value)}
              className="w-full px-2 py-1 bg-zinc-800 border border-zinc-700 rounded-sm font-mono text-[10px] text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#00d9ff]"
            />
          </div>
          <div className="space-y-3">
            {data.implementationLogs
              .filter((log) =>
                implementationSearch === "" ||
                log.componentName.toLowerCase().includes(implementationSearch.toLowerCase()) ||
                log.agentName.toLowerCase().includes(implementationSearch.toLowerCase()) ||
                log.implementationDetails.toLowerCase().includes(implementationSearch.toLowerCase())
              )
              .map((log) => (
              <div
                key={log.id}
                className="p-3 bg-zinc-900 rounded-sm"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-white">{log.componentName}</span>
                    <Badge variant="info" className="text-[9px]">{log.agentName}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-lg">{log.agentIcon}</span>
                    <span className="font-mono text-[10px] text-zinc-400">{log.timestamp}</span>
                  </div>
                </div>
                <p className="font-mono text-[10px] text-zinc-400">{log.implementationDetails}</p>
              </div>
            ))}
            {data.implementationLogs
              .filter((log) =>
                implementationSearch === "" ||
                log.componentName.toLowerCase().includes(implementationSearch.toLowerCase()) ||
                log.agentName.toLowerCase().includes(implementationSearch.toLowerCase()) ||
                log.implementationDetails.toLowerCase().includes(implementationSearch.toLowerCase())
              ).length === 0 && (
                <p className="font-mono text-[10px] text-zinc-500 text-center py-4">Sin resultados</p>
              )}
          </div>
        </SectionCard>

      </div>

      {/* Agent Configuration Modal */}
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
