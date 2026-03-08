"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import {
  AgentHeader,
  SubAgentStatusGrid,
  Canvas,
  SectionCard,
  AgentConfigModal,
  useAgentConfig,
} from "@/components/agents";
import { useGrowl } from "@/components/growl";
import { picassoData } from "@/lib/api/mock/pascual-agents";

export default function PicassoDashboard() {
  const [data] = useState(picassoData);
  const { sendToAgent } = useGrowl();

  // Usar el hook reutilizable para configuración del agente
  const {
    showConfigModal,
    agentData,
    handleAgentModelChange,
    handleSubAgentModelChange,
    openConfig,
    closeConfig,
  } = useAgentConfig("picasso");


  const getProposalStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "bg-[#39ff14]";
      case "development": return "bg-[#00d9ff]";
      case "review": return "bg-[#ffaa00]";
      case "concept": return "bg-zinc-500";
      default: return "bg-zinc-600";
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high": return "text-[#ff006e]";
      case "medium": return "text-[#ffaa00]";
      case "low": return "text-zinc-400";
      default: return "text-zinc-500";
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
            label: "Uptime",
            value: `${data.metrics.uptime}%`,
            values: { "24h": `${data.metrics.uptime}%`, "7d": "99.92%", "1m": "99.85%", "1y": "99.72%" },
            status: data.metrics.uptime >= 99 ? "good" : "warning",
            statuses: { "24h": "good", "7d": "good", "1m": "good", "1y": "good" },
          },
          {
            label: "Carga",
            value: `${data.metrics.loadTime}s`,
            values: { "24h": `${data.metrics.loadTime}s`, "7d": "1.3s", "1m": "1.5s", "1y": "1.8s" },
            status: data.metrics.loadTime < 2 ? "good" : "warning",
            statuses: { "24h": "good", "7d": "good", "1m": "good", "1y": "good" },
          },
          {
            label: "A11y",
            value: `${data.metrics.accessibilityScore}%`,
            values: { "24h": `${data.metrics.accessibilityScore}%`, "7d": "96%", "1m": "94%", "1y": "92%" },
            status: data.metrics.accessibilityScore >= 95 ? "good" : "warning",
            statuses: { "24h": "good", "7d": "good", "1m": "warning", "1y": "warning" },
          },
          {
            label: "UX Score",
            value: `${data.metrics.uxScore}%`,
            values: { "24h": `${data.metrics.uxScore}%`, "7d": "91%", "1m": "89%", "1y": "86%" },
            status: data.metrics.uxScore >= 90 ? "good" : "warning",
            statuses: { "24h": "good", "7d": "good", "1m": "warning", "1y": "warning" },
          },
          {
            label: "Lighthouse",
            value: data.lighthouseScore,
            values: { "24h": data.lighthouseScore, "7d": "93", "1m": "90", "1y": "88" },
            status: data.lighthouseScore >= 90 ? "good" : "warning",
            statuses: { "24h": "good", "7d": "good", "1m": "good", "1y": "warning" },
          },
        ]}
      />

      {/* Sub-Agents Status Grid */}
      <SubAgentStatusGrid
        subAgents={data.subAgents}
        onSettings={openConfig}
      />

      {/* Canvas + Web Vitals + Components - Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Canvas - Lienzo de respuestas de Pascual */}
        <Canvas
          title="Canvas"
          placeholder="¿Qué necesitas diseñar o analizar?"
          onSendMessage={(msg) => sendToAgent("picasso", "Picasso", "🎨", msg)}
          minHeight="180px"
          quickPrompts={[
            { label: "Auditar UI", prompt: "Ejecuta una auditoría de UI/UX" },
            { label: "Web Vitals", prompt: "Muéstrame el estado de los Core Web Vitals" },
            { label: "Accesibilidad", prompt: "Genera un reporte de accesibilidad" },
          ]}
        />

        {/* UX Sugerencias */}
        <SectionCard title="Sugerencias" maxHeight="320px">
          <div className="space-y-4">
            {data.uxSuggestions.map((suggestion) => {
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
                  key={suggestion.title}
                  className={`p-3 bg-zinc-900 rounded-sm border-l-2 ${getPriorityColor(suggestion.priority)}`}
                >
                  <p className="font-mono text-sm text-white mb-2">{suggestion.title}</p>
                  <p className="font-mono text-[10px] text-zinc-400">{suggestion.description}</p>
                </div>
              );
            })}
          </div>
        </SectionCard>

        {/* Component Usage */}
        <SectionCard
          title="Librería de Componentes"
          action={
            <Badge variant="info">{data.metrics.componentsCount} componentes</Badge>
          }
          maxHeight="320px"
        >
          <div className="space-y-2">
            {data.componentsUsage.map((comp) => (
              <div
                key={comp.name}
                className="flex items-center justify-between p-2 bg-zinc-900 rounded-sm"
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-white">{comp.name}</span>
                  {comp.isNew && (
                    <Badge variant="success" className="text-[9px]">NUEVO</Badge>
                  )}
                </div>
                <span className="font-mono text-[10px] text-zinc-400">{comp.instances} instancias</span>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Innovation Proposals */}
        <SectionCard title="Pipeline de Innovación" maxHeight="320px">
          <div className="space-y-3">
            {data.innovationProposals.map((proposal) => (
              <div
                key={proposal.id}
                className="p-3 bg-zinc-900 rounded-sm"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs text-white">{proposal.title}</span>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${getProposalStatusColor(proposal.status)}`} />
                    <span className="font-mono text-[10px] text-zinc-400 capitalize">
                      {proposal.status === "approved" ? "Aprobado" :
                       proposal.status === "development" ? "Desarrollo" :
                       proposal.status === "review" ? "Revisión" : "Concepto"}
                    </span>
                  </div>
                </div>
                <p className="font-mono text-[10px] text-zinc-500">{proposal.description}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Accessibility Report */}
        <SectionCard
          title="Reporte de Accesibilidad"
          action={
            <span className="font-mono text-xs text-zinc-400">
              WCAG {data.accessibilityReport.wcagCompliance}%
            </span>
          }
          maxHeight="320px"
        >
          <div className="space-y-3 mb-4">
            {data.accessibilityReport.checks.map((check) => (
              <div
                key={check.name}
                className="flex items-center justify-between p-2 bg-zinc-900 rounded-sm"
              >
                <span className="font-mono text-xs text-zinc-400">{check.name}</span>
                <span className={`font-mono text-sm ${check.passed ? "text-[#39ff14]" : "text-[#ff006e]"}`}>
                  {check.passed ? "✓" : "✕"}
                </span>
              </div>
            ))}
          </div>
          {data.accessibilityReport.issues.length > 0 && (
            <div className="pt-3 border-t border-zinc-800">
              <p className="font-mono text-[10px] text-zinc-500 mb-2">Problemas Encontrados:</p>
              {data.accessibilityReport.issues.map((issue) => (
                <div
                  key={issue.id}
                  className="flex items-start gap-2 py-1"
                >
                  <span className={`font-mono text-xs ${getSeverityColor(issue.severity)}`}>●</span>
                  <span className="font-mono text-[10px] text-zinc-400">{issue.description}</span>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        {/* Performance Overview */}
        <SectionCard title="Métricas de Rendimiento" maxHeight="320px">
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center p-3 bg-zinc-900 rounded-sm">
              <p className="font-mono text-2xl font-bold text-[#39ff14]">{data.lighthouseScore}</p>
              <p className="font-mono text-[9px] text-zinc-500 mt-1">Lighthouse</p>
            </div>
            <div className="text-center p-3 bg-zinc-900 rounded-sm">
              <p className="font-mono text-2xl font-bold text-[#00d9ff]">{data.metrics.uxScore}%</p>
              <p className="font-mono text-[9px] text-zinc-500 mt-1">UX Score</p>
            </div>
            <div className="text-center p-3 bg-zinc-900 rounded-sm">
              <p className="font-mono text-2xl font-bold text-white">{data.metrics.componentsCount}</p>
              <p className="font-mono text-[9px] text-zinc-500 mt-1">Componentes</p>
            </div>
            <div className="text-center p-3 bg-zinc-900 rounded-sm">
              <p className={`font-mono text-2xl font-bold ${data.metrics.errorRate < 1 ? "text-[#39ff14]" : "text-[#ff006e]"}`}>
                {data.metrics.errorRate}%
              </p>
              <p className="font-mono text-[9px] text-zinc-500 mt-1">Errores</p>
            </div>
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
