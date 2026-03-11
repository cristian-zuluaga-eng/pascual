"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import {
  AgentHeader,
  Canvas,
  SectionCard,
  ProgressBar,
  AgentConfigModal,
  useAgentConfig,
} from "@/components/agents";
import { useGrowl } from "@/components/growl";
import { consultorData } from "@/lib/api/mock/pascual-agents";
import { useDashboardConfig } from "@/lib/context/DashboardConfigContext";

export default function ConsultorDashboard() {
  const [data] = useState(consultorData);
  const { sendToAgent } = useGrowl();
  const { config } = useDashboardConfig();

  // Usar el hook reutilizable para configuración del agente
  const {
    showConfigModal,
    agentData,
    handleAgentModelChange,
    handleSubAgentModelChange,
    openConfig,
    closeConfig,
  } = useAgentConfig("consultor");

  const getImplementedColor = (implemented: string) => {
    switch (implemented) {
      case "yes": return "text-[#39ff14]";
      case "in_progress": return "text-[#00d9ff]";
      case "pending": return "text-zinc-500";
      default: return "text-zinc-400";
    }
  };

  const getImplementedIcon = (implemented: string) => {
    switch (implemented) {
      case "yes": return "✓";
      case "in_progress": return "◐";
      case "pending": return "○";
      default: return "•";
    }
  };

  const getResultBadge = (result?: string) => {
    switch (result) {
      case "positive": return <Badge variant="success" className="text-[9px]">Positivo</Badge>;
      case "negative": return <Badge variant="danger" className="text-[9px]">Negativo</Badge>;
      case "neutral": return <Badge variant="default" className="text-[9px]">Neutral</Badge>;
      default: return null;
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
        kpiVisibility={config.kpis.consultor}
        usage={{
          data: [25, 32, 28, 40, 35, 45, 42, 50, 48, 55],
          dataByRange: {
            "24h": [25, 32, 28, 40, 35, 45, 42, 50, 48, 55],
            "7d": [180, 210, 195, 250, 280, 310, 290],
            "1m": [720, 850, 920, 1050, 1180, 1250, 1150, 1320, 1380, 1450, 1520, 1480],
            "1y": [8500, 9800, 11200, 12800, 14500, 16200, 17800, 19500, 21200, 23000, 24800, 26500],
          },
          color: "#ffaa00",
        }}
        kpis={[
          {
            id: "consultas",
            label: "Consultas",
            value: data.metrics.consultationsThisMonth,
            values: { "24h": data.metrics.consultationsThisMonth, "7d": "89", "1m": "342", "1y": "3856" },
            status: "good",
          },
          {
            id: "satisfaccion",
            label: "Satisfacción",
            value: `${data.metrics.userSatisfaction}/5`,
            values: { "24h": `${data.metrics.userSatisfaction}/5`, "7d": "4.6/5", "1m": "4.5/5", "1y": "4.4/5" },
            status: data.metrics.userSatisfaction >= 4 ? "good" : "warning",
            statuses: { "24h": "good", "7d": "good", "1m": "good", "1y": "good" },
          },
          {
            id: "planes",
            label: "Planes",
            value: data.metrics.activePlans,
            values: { "24h": data.metrics.activePlans, "7d": "12", "1m": "28", "1y": "156" },
            status: "neutral",
          },
          {
            id: "followUp",
            label: "Follow-up",
            value: `${data.metrics.followUpRate}%`,
            values: { "24h": `${data.metrics.followUpRate}%`, "7d": "72%", "1m": "68%", "1y": "65%" },
            status: data.metrics.followUpRate >= 60 ? "good" : "warning",
            statuses: { "24h": "good", "7d": "good", "1m": "good", "1y": "good" },
          },
          {
            id: "exito",
            label: "Éxito",
            value: `${data.metrics.recommendationSuccessRate}%`,
            values: { "24h": `${data.metrics.recommendationSuccessRate}%`, "7d": "82%", "1m": "78%", "1y": "76%" },
            status: data.metrics.recommendationSuccessRate >= 75 ? "good" : "warning",
            statuses: { "24h": "good", "7d": "good", "1m": "good", "1y": "good" },
          },
        ]}
      />

      {/* Canvas + Expertise Areas + Active Plans - Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Canvas - Lienzo de respuestas de Pascual */}
        <Canvas
          title="Canvas"
          placeholder="¿En qué área necesitas asesoría?"
          onSendMessage={(msg) => sendToAgent("consultor", "Consultor", "🎓", msg)}
          minHeight="180px"
          quickPrompts={[
            { label: "Finanzas", prompt: "Dame consejos sobre planificación financiera" },
            { label: "Crianza", prompt: "Necesito ayuda con temas de crianza" },
            { label: "Carrera", prompt: "Quiero explorar opciones de desarrollo profesional" },
          ]}
        />

        {/* Expertise Areas */}
        <SectionCard title="Áreas de Experticia" visible={config.grids.consultor.areasExperticia} maxHeight="320px">
          <div className="space-y-3">
            {data.expertiseAreas.map((area) => (
              <div
                key={area.id}
                className="flex items-center justify-between p-3 bg-zinc-900 rounded-sm"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{area.icon}</span>
                  <div>
                    <p className="font-mono text-xs text-white">{area.name}</p>
                    <p className="font-mono text-[10px] text-zinc-500">
                      {area.consultations} consultas • Última: {area.lastConsultation}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-[#ffaa00]">★ {area.rating}</span>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Active Plans */}
        <SectionCard
          title="Planes Activos"
          action={
            <Badge variant="info">{data.activePlans.length} activos</Badge>
          }
          maxHeight="320px"
        >
          <div className="space-y-3">
            {data.activePlans.map((plan) => (
              <div
                key={plan.id}
                className="p-3 bg-zinc-900 rounded-sm"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs text-white">{plan.name}</span>
                  <Badge variant="default" className="text-[9px]">{plan.area}</Badge>
                </div>
                <ProgressBar
                  label=""
                  value={plan.progress}
                  color={plan.progress >= 80 ? "#39ff14" : "#00d9ff"}
                  showValue={true}
                />
                <p className="font-mono text-[10px] text-zinc-500 mt-2">
                  Próximo: {plan.nextAction}
                </p>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Recommendations */}
        <SectionCard
          title="Recomendaciones Recientes"
          action={
            <button className="font-mono text-xs text-[#00d9ff] hover:underline">Ver historial</button>
          }
          maxHeight="320px"
        >
          <div className="space-y-2">
            {data.recentRecommendations.map((rec) => (
              <div
                key={rec.id}
                className="flex items-start gap-3 p-3 bg-zinc-900 rounded-sm"
              >
                <span className={`font-mono text-sm mt-0.5 ${getImplementedColor(rec.implemented)}`}>
                  {getImplementedIcon(rec.implemented)}
                </span>
                <div className="flex-1">
                  <p className="font-mono text-xs text-white">{rec.text}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="default" className="text-[9px]">{rec.area}</Badge>
                    {getResultBadge(rec.result)}
                    {rec.adherence !== undefined && (
                      <span className="font-mono text-[10px] text-zinc-500">
                        Adherencia: {rec.adherence}%
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Summary Stats */}
        <SectionCard title="Resumen por Área" visible={config.grids.consultor.resumenArea} maxHeight="320px">
          <div className="grid grid-cols-5 gap-2">
            {data.expertiseAreas.map((area) => (
              <div key={area.id} className="text-center p-3 bg-zinc-900 rounded-sm">
                <span className="text-xl">{area.icon}</span>
                <p className="font-mono text-lg font-bold text-white mt-1">{area.consultations}</p>
                <p className="font-mono text-[9px] text-zinc-500 truncate">{area.name}</p>
                <p className="font-mono text-[9px] text-[#ffaa00]">★ {area.rating}</p>
              </div>
            ))}
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
