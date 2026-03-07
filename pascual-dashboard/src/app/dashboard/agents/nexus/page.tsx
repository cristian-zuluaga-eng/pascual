"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import {
  AgentHeader,
  SubAgentStatusGrid,
  Canvas,
  SectionCard,
  ProgressBar,
  AgentConfigModal,
  useAgentConfig,
} from "@/components/agents";
import { useGrowl } from "@/components/growl";
import { nexusData } from "@/lib/api/mock/pascual-agents";

export default function NexusDashboard() {
  const [data] = useState(nexusData);
  const { sendToAgent } = useGrowl();

  // Usar el hook reutilizable para configuración del agente
  const {
    showConfigModal,
    agentData,
    handleAgentModelChange,
    handleSubAgentModelChange,
    openConfig,
    closeConfig,
  } = useAgentConfig("nexus");

  const getStageColor = (stage: string) => {
    switch (stage) {
      case "analysis": return "bg-purple-500";
      case "design": return "bg-blue-500";
      case "implement": return "bg-cyan-500";
      case "testing": return "bg-amber-500";
      case "review": return "bg-orange-500";
      case "deploy": return "bg-green-500";
      default: return "bg-zinc-500";
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

  const stages = ["analysis", "design", "implement", "testing", "review", "deploy"];

  return (
    <div className="space-y-4">
      <AgentHeader
        name={data.name}
        icon={data.icon}
        lema={data.lema}
        status={data.status}
        showTimeRange={true}
        usage={{
          data: [45, 52, 48, 65, 72, 68, 75, 82, 78, 85],
          dataByRange: {
            "24h": [45, 52, 48, 65, 72, 68, 75, 82, 78, 85],
            "7d": [320, 380, 350, 420, 450, 480, 510],
            "1m": [1200, 1450, 1380, 1520, 1680, 1750, 1620, 1880, 1950, 2100, 2250, 2180],
            "1y": [12000, 14500, 16200, 18500, 21000, 24000, 26500, 28000, 31000, 34500, 38000, 42000],
          },
          color: "#00d9ff",
        }}
        kpis={[
          {
            label: "Cobertura",
            value: `${data.metrics.testCoverage}%`,
            values: { "24h": `${data.metrics.testCoverage}%`, "7d": "83%", "1m": "80%", "1y": "75%" },
            status: data.metrics.testCoverage >= 80 ? "good" : "warning",
            statuses: { "24h": "good", "7d": "good", "1m": "good", "1y": "warning" },
          },
          {
            label: "Deuda Técnica",
            value: data.metrics.technicalDebt.toUpperCase(),
            values: { "24h": data.metrics.technicalDebt.toUpperCase(), "7d": "LOW", "1m": "MEDIUM", "1y": "MEDIUM" },
            status: data.metrics.technicalDebt === "low" ? "good" : data.metrics.technicalDebt === "medium" ? "warning" : "critical",
            statuses: { "24h": "good", "7d": "good", "1m": "warning", "1y": "warning" },
          },
          {
            label: "Deploys",
            value: data.metrics.deploysThisWeek,
            values: { "24h": data.metrics.deploysThisWeek, "7d": "18", "1m": "65", "1y": "780" },
            status: "good",
          },
          {
            label: "PRs Abiertos",
            value: data.metrics.prsOpen,
            values: { "24h": data.metrics.prsOpen, "7d": "8", "1m": "12", "1y": "6" },
            status: data.metrics.prsOpen < 10 ? "good" : "warning",
            statuses: { "24h": "good", "7d": "good", "1m": "warning", "1y": "good" },
          },
          {
            label: "Bugs",
            value: data.metrics.bugsOpen,
            values: { "24h": data.metrics.bugsOpen, "7d": "5", "1m": "8", "1y": "3" },
            status: data.metrics.bugsOpen < 5 ? "good" : "warning",
            statuses: { "24h": "good", "7d": "warning", "1m": "warning", "1y": "good" },
          },
        ]}
      />

      {/* Sub-Agents Status Grid */}
      <SubAgentStatusGrid
        subAgents={data.subAgents}
        onSettings={openConfig}
      />

      {/* Canvas + Pipeline + Code Quality - Grid 2x2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Canvas - Lienzo de respuestas de Pascual */}
        <Canvas
          title="Canvas"
          placeholder="¿Qué necesitas desarrollar o revisar?"
          onSendMessage={(msg) => sendToAgent("nexus", "Nexus", "🧠", msg)}
          minHeight="180px"
          quickPrompts={[
            { label: "Revisar PRs", prompt: "Muéstrame los PRs pendientes de revisión" },
            { label: "Analizar cobertura", prompt: "Analiza la cobertura de tests actual" },
            { label: "Deploy status", prompt: "¿Cuál es el estado del último deploy?" },
          ]}
        />

        {/* Development Pipeline */}
        <SectionCard title="Pipeline de Desarrollo" maxHeight="320px">
          <div className="grid grid-cols-3 gap-2">
            {stages.slice(0, 3).map((stage) => {
              const items = data.pipeline.filter(p => p.stage === stage);
              return (
                <div key={stage} className="space-y-2">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-2 h-2 rounded-full ${getStageColor(stage)}`} />
                    <span className="font-mono text-[10px] text-zinc-500 uppercase">{stage}</span>
                  </div>
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className={`p-2 bg-zinc-900 rounded-sm border-l-2 ${getPriorityColor(item.priority)}`}
                    >
                      <p className="font-mono text-[10px] text-zinc-400">{item.id}</p>
                      <p className="font-mono text-xs text-white truncate">{item.title}</p>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
          <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-zinc-800">
            {stages.slice(3).map((stage) => {
              const items = data.pipeline.filter(p => p.stage === stage);
              return (
                <div key={stage} className="space-y-2">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-2 h-2 rounded-full ${getStageColor(stage)}`} />
                    <span className="font-mono text-[10px] text-zinc-500 uppercase">{stage}</span>
                  </div>
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className={`p-2 bg-zinc-900 rounded-sm border-l-2 ${getPriorityColor(item.priority)}`}
                    >
                      <p className="font-mono text-[10px] text-zinc-400">{item.id}</p>
                      <p className="font-mono text-xs text-white truncate">{item.title}</p>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </SectionCard>

        {/* Code Quality */}
        <SectionCard title="Calidad de Código" maxHeight="320px">
          <div className="space-y-3">
            <ProgressBar label="Complejidad" value={data.metrics.codeComplexity} color="#00d9ff" />
            <ProgressBar label="Mantenib." value={data.metrics.maintainabilityIndex} color="#39ff14" />
            <ProgressBar label="Documentación" value={data.metrics.documentationCoverage} color="#ffaa00" />
            <ProgressBar label="Tests" value={data.metrics.testCoverage} color="#39ff14" />
          </div>
          <div className="mt-4 pt-4 border-t border-zinc-800">
            <p className="font-mono text-xs text-zinc-500 uppercase mb-2">Coherencia Arquitectónica</p>
            <div className="w-full h-3 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#00d9ff] to-[#39ff14] rounded-full"
                style={{ width: `${data.metrics.architectureCoherence}%` }}
              />
            </div>
            <p className="font-mono text-right text-xs text-zinc-400 mt-1">{data.metrics.architectureCoherence}%</p>
          </div>
        </SectionCard>

        {/* Recent Commits */}
        <SectionCard
          title="Commits Recientes"
          action={<button className="font-mono text-xs text-[#00d9ff] hover:underline">Ver todos</button>}
          maxHeight="320px"
        >
          <div className="space-y-2">
            {data.recentCommits.map((commit) => (
              <div key={commit.hash} className="flex items-start gap-3 py-2 border-b border-zinc-800 last:border-0">
                <code className="font-mono text-[10px] text-[#00d9ff] bg-zinc-900 px-1.5 py-0.5 rounded">
                  {commit.hash}
                </code>
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-xs text-white truncate">{commit.message}</p>
                  <p className="font-mono text-[10px] text-zinc-600">{commit.author} • {commit.time}</p>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Model Performance */}
        <SectionCard title="Rendimiento de Modelos" maxHeight="320px">
          <div className="space-y-3">
            {data.modelPerformance.map((model) => (
              <div key={model.model} className="flex items-center justify-between">
                <span className="font-mono text-xs text-zinc-400">{model.model}</span>
                <div className="flex items-center gap-4">
                  <div className="w-24">
                    <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#00d9ff] rounded-full"
                        style={{ width: `${model.accuracy}%` }}
                      />
                    </div>
                  </div>
                  <span className="font-mono text-xs text-white w-10 text-right">{model.accuracy}%</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-zinc-800 grid grid-cols-2 gap-4">
            <div>
              <p className="font-mono text-[10px] text-zinc-500">Tiempo Respuesta</p>
              <p className="font-mono text-sm text-white">{(data.metrics.avgResponseTime / 1000).toFixed(1)}s</p>
            </div>
            <div>
              <p className="font-mono text-[10px] text-zinc-500">Uso de Tokens</p>
              <p className="font-mono text-sm text-white">{(data.metrics.tokenUsageDaily / 1000).toFixed(0)}K/día</p>
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
