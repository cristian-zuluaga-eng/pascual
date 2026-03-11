"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import {
  AgentHeader,
  Canvas,
  SectionCard,
  ProgressBar,
  FilterTabs,
  AgentConfigModal,
  useAgentConfig,
} from "@/components/agents";
import { useGrowl } from "@/components/growl";
import { nexusData, ScriptImprovement, CodeReview, OpenProject } from "@/lib/api/mock/pascual-agents";
import { useDashboardConfig } from "@/lib/context/DashboardConfigContext";

export default function NexusDashboard() {
  const [data] = useState(nexusData);
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
  } = useAgentConfig("nexus");

  // Helpers para proyectos abiertos
  const getProjectStatusColor = (status: OpenProject["status"]) => {
    switch (status) {
      case "active": return "bg-[#39ff14]";
      case "blocked": return "bg-[#ff006e]";
      case "waiting": return "bg-amber-500";
      default: return "bg-zinc-500";
    }
  };

  const getBlockReasonIcon = (reason: OpenProject["blockReason"]) => {
    switch (reason) {
      case "approval": return "🔒";
      case "resources": return "👥";
      case "external": return "🔗";
      case "priority": return "📋";
      default: return "⏸";
    }
  };

  const [improvementSearch, setImprovementSearch] = useState("");
  const [codeReviewSearch, setCodeReviewSearch] = useState("");
  const [taskSearch, setTaskSearch] = useState("");

  const getStatusColor = (status: ScriptImprovement["status"]) => {
    switch (status) {
      case "completed": return "bg-[#39ff14]";
      case "in_progress": return "bg-[#00d9ff]";
      case "testing": return "bg-amber-500";
      case "pending": return "bg-zinc-500";
      default: return "bg-zinc-500";
    }
  };

  const getStatusLabel = (status: ScriptImprovement["status"]) => {
    switch (status) {
      case "completed": return "Completado";
      case "in_progress": return "En progreso";
      case "testing": return "En pruebas";
      case "pending": return "Pendiente";
      default: return status;
    }
  };

  const getImpactBadge = (impact: ScriptImprovement["impact"]) => {
    switch (impact) {
      case "high": return { color: "bg-[#ff006e]/20 text-[#ff006e] border-[#ff006e]/30", label: "Alto" };
      case "medium": return { color: "bg-amber-500/20 text-amber-400 border-amber-500/30", label: "Medio" };
      case "low": return { color: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30", label: "Bajo" };
      default: return { color: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30", label: impact };
    }
  };

  const getCategoryLabel = (category: ScriptImprovement["category"]) => {
    switch (category) {
      case "performance": return "Rendimiento";
      case "reliability": return "Confiabilidad";
      case "feature": return "Funcionalidad";
      case "security": return "Seguridad";
      case "optimization": return "Optimización";
      default: return category;
    }
  };

  // Code Review helpers
  const getReviewStatusColor = (status: CodeReview["status"]) => {
    switch (status) {
      case "approved": return "bg-[#39ff14]";
      case "in_review": return "bg-[#00d9ff]";
      case "changes_requested": return "bg-[#ff006e]";
      case "pending": return "bg-amber-500";
      default: return "bg-zinc-500";
    }
  };

  const getReviewStatusLabel = (status: CodeReview["status"]) => {
    switch (status) {
      case "approved": return "Aprobado";
      case "in_review": return "En revisión";
      case "changes_requested": return "Cambios";
      case "pending": return "Pendiente";
      default: return status;
    }
  };

  const getReviewerStatusIcon = (status: "approved" | "pending" | "changes_requested") => {
    switch (status) {
      case "approved": return { icon: "✓", color: "text-[#39ff14]" };
      case "changes_requested": return { icon: "✕", color: "text-[#ff006e]" };
      case "pending": return { icon: "○", color: "text-zinc-500" };
      default: return { icon: "○", color: "text-zinc-500" };
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
        kpiVisibility={config.kpis.nexus}
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
            id: "eficienciaIA",
            label: "Eficiencia IA",
            value: "94%",
            values: { "24h": "94%", "7d": "92%", "1m": "89%", "1y": "85%" },
            status: "good",
            statuses: { "24h": "good", "7d": "good", "1m": "good", "1y": "good" },
          },
          {
            id: "tests",
            label: "Tests",
            value: `${data.metrics.testCoverage}%`,
            values: { "24h": `${data.metrics.testCoverage}%`, "7d": "83%", "1m": "80%", "1y": "75%" },
            status: data.metrics.testCoverage >= 80 ? "good" : "warning",
            statuses: { "24h": "good", "7d": "good", "1m": "good", "1y": "warning" },
          },
          {
            id: "docs",
            label: "Docs",
            value: `${data.metrics.documentationCoverage}%`,
            values: { "24h": `${data.metrics.documentationCoverage}%`, "7d": "65%", "1m": "60%", "1y": "55%" },
            status: data.metrics.documentationCoverage >= 70 ? "good" : "warning",
            statuses: { "24h": "warning", "7d": "warning", "1m": "warning", "1y": "warning" },
          },
          {
            id: "arquitectura",
            label: "Arquitectura",
            value: `${data.metrics.architectureCoherence}%`,
            values: { "24h": `${data.metrics.architectureCoherence}%`, "7d": "82%", "1m": "78%", "1y": "72%" },
            status: data.metrics.architectureCoherence >= 80 ? "good" : "warning",
            statuses: { "24h": "good", "7d": "good", "1m": "warning", "1y": "warning" },
          },
          {
            id: "prsAbiertos",
            label: "PRs Abiertos",
            value: data.metrics.prsOpen,
            values: { "24h": data.metrics.prsOpen, "7d": "8", "1m": "12", "1y": "6" },
            status: data.metrics.prsOpen < 10 ? "good" : "warning",
            statuses: { "24h": "good", "7d": "good", "1m": "warning", "1y": "good" },
          },
          {
            id: "bugs",
            label: "Bugs",
            value: data.metrics.bugsOpen,
            values: { "24h": data.metrics.bugsOpen, "7d": "5", "1m": "8", "1y": "3" },
            status: data.metrics.bugsOpen < 5 ? "good" : "warning",
            statuses: { "24h": "good", "7d": "warning", "1m": "warning", "1y": "good" },
          },
        ]}
      />

      {/* Canvas + Grids */}
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

        {/* Tareas en Curso */}
        <SectionCard
          title="Tareas en Curso"
          visible={config.grids.nexus.tareasEnCurso}
          action={
            <FilterTabs
              options={[]}
              value=""
              onChange={() => {}}
              searchValue={taskSearch}
              onSearchChange={setTaskSearch}
              searchPlaceholder="Buscar tarea..."
              searchOnly
            />
          }
          maxHeight="320px"
        >
          <div className="space-y-2">
            {data.openProjects
              .filter((project) => taskSearch === "" ||
                project.name.toLowerCase().includes(taskSearch.toLowerCase()) ||
                project.assignedAgent?.name.toLowerCase().includes(taskSearch.toLowerCase()) ||
                project.assignedAgent?.task.toLowerCase().includes(taskSearch.toLowerCase()) ||
                project.ownerAgent?.name.toLowerCase().includes(taskSearch.toLowerCase()) ||
                project.blockDetail?.toLowerCase().includes(taskSearch.toLowerCase())
              )
              .map((project) => (
              <div
                key={project.id}
                className="p-2 bg-zinc-900/50 rounded-sm border border-zinc-800 hover:border-zinc-700 transition-colors"
              >
                {/* Header: Status + Name + Type + Progress */}
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${getProjectStatusColor(project.status)}`} />
                    <span className="font-mono text-xs text-white truncate">{project.name}</span>
                    <span className="font-mono text-[9px] text-[#00d9ff] bg-[#00d9ff]/10 border border-[#00d9ff]/30 px-1.5 py-0.5 rounded flex-shrink-0">
                      {project.type === "user" ? "Usuario" : project.ownerAgent ? `${project.ownerAgent.icon} ${project.ownerAgent.name}` : "Sistema"}
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-zinc-400 flex-shrink-0">{project.progress}%</span>
                </div>

                {/* Agente trabajando o razón de bloqueo */}
                <div className="flex items-center justify-between pl-4">
                  {project.assignedAgent ? (
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs">{project.assignedAgent.icon}</span>
                      <span className="font-mono text-[10px] text-[#39ff14]">{project.assignedAgent.name}</span>
                      <span className="font-mono text-[9px] text-zinc-500">· {project.assignedAgent.task}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs">{getBlockReasonIcon(project.blockReason)}</span>
                      <span className={`font-mono text-[10px] ${project.status === "blocked" ? "text-[#ff006e]" : "text-amber-400"}`}>
                        {project.blockDetail}
                      </span>
                    </div>
                  )}
                  <span className="font-mono text-[9px] text-zinc-600">{project.lastUpdate}</span>
                </div>
              </div>
            ))}
            {data.openProjects
              .filter((project) => taskSearch === "" ||
                project.name.toLowerCase().includes(taskSearch.toLowerCase()) ||
                project.assignedAgent?.name.toLowerCase().includes(taskSearch.toLowerCase()) ||
                project.assignedAgent?.task.toLowerCase().includes(taskSearch.toLowerCase()) ||
                project.ownerAgent?.name.toLowerCase().includes(taskSearch.toLowerCase()) ||
                project.blockDetail?.toLowerCase().includes(taskSearch.toLowerCase())
              ).length === 0 && (
              <p className="font-mono text-xs text-zinc-500 text-center py-4">
                No hay tareas {taskSearch && `que contengan "${taskSearch}"`}
              </p>
            )}
          </div>

          {/* Footer Stats */}
          <div className="mt-3 pt-3 border-t border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#39ff14]" />
                <span className="font-mono text-[9px] text-zinc-500">{data.openProjects.filter(p => p.status === "active").length} Activos</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#ff006e]" />
                <span className="font-mono text-[9px] text-zinc-500">{data.openProjects.filter(p => p.status === "blocked").length} Bloqueados</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="font-mono text-[9px] text-zinc-500">{data.openProjects.filter(p => p.status === "waiting").length} En espera</span>
              </div>
            </div>
            <span className="font-mono text-[9px] text-zinc-600">{data.openProjects.length} tareas</span>
          </div>
        </SectionCard>

        {/* Script Improvements */}
        <SectionCard
          title="Mejoras de Scripts - LOG"
          visible={config.grids.nexus.mejorasScripts}
          action={
            <FilterTabs
              options={[]}
              value=""
              onChange={() => {}}
              searchValue={improvementSearch}
              onSearchChange={setImprovementSearch}
              searchPlaceholder="Buscar mejora..."
              searchOnly
            />
          }
          maxHeight="320px"
        >
          <div className="space-y-3">
            {data.scriptImprovements
              .filter((imp) => improvementSearch === "" ||
                imp.name.toLowerCase().includes(improvementSearch.toLowerCase()) ||
                imp.description.toLowerCase().includes(improvementSearch.toLowerCase()) ||
                imp.agentsInvolved.some(a => a.name.toLowerCase().includes(improvementSearch.toLowerCase()))
              )
              .map((improvement) => {
                const impactBadge = getImpactBadge(improvement.impact);
                return (
                  <div key={improvement.id} className="p-3 bg-zinc-900/50 rounded-sm border border-zinc-800 hover:border-zinc-700 transition-colors">
                    {/* Header: Status + Name + Timestamp */}
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${getStatusColor(improvement.status)}`} />
                        <span className="font-mono text-xs text-white truncate">{improvement.name}</span>
                      </div>
                      <span className="font-mono text-[9px] text-zinc-500 flex-shrink-0">{improvement.timestamp}</span>
                    </div>

                    {/* Description */}
                    <p className="font-mono text-[10px] text-zinc-400 mb-2">{improvement.description}</p>

                    {/* Agents Involved + Expected Outcome */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[9px] text-zinc-500">Agentes:</span>
                        <div className="flex items-center gap-1">
                          {improvement.agentsInvolved.map((agent, idx) => (
                            <span
                              key={idx}
                              className="flex items-center gap-1 px-1.5 py-0.5 bg-zinc-800 rounded text-[9px]"
                              title={agent.name}
                            >
                              <span>{agent.icon}</span>
                              <span className="font-mono text-zinc-300">{agent.name}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                      <span className="font-mono text-[10px] text-[#39ff14] text-right truncate">{improvement.expectedOutcome}</span>
                    </div>
                  </div>
                );
              })}
            {data.scriptImprovements
              .filter((imp) => improvementSearch === "" ||
                imp.name.toLowerCase().includes(improvementSearch.toLowerCase()) ||
                imp.description.toLowerCase().includes(improvementSearch.toLowerCase()) ||
                imp.agentsInvolved.some(a => a.name.toLowerCase().includes(improvementSearch.toLowerCase()))
              ).length === 0 && (
              <p className="font-mono text-xs text-zinc-500 text-center py-4">
                No hay mejoras {improvementSearch && `que contengan "${improvementSearch}"`}
              </p>
            )}
          </div>
        </SectionCard>

        {/* Code Reviews */}
        <SectionCard
          title="Code Reviews"
          visible={config.grids.nexus.codeReviews}
          action={
            <FilterTabs
              options={[]}
              value=""
              onChange={() => {}}
              searchValue={codeReviewSearch}
              onSearchChange={setCodeReviewSearch}
              searchPlaceholder="Buscar PR..."
              searchOnly
            />
          }
          maxHeight="320px"
        >
          <div className="space-y-2">
            {data.codeReviews
              .filter((review) => codeReviewSearch === "" ||
                review.title.toLowerCase().includes(codeReviewSearch.toLowerCase()) ||
                review.author.toLowerCase().includes(codeReviewSearch.toLowerCase()) ||
                review.project.toLowerCase().includes(codeReviewSearch.toLowerCase()) ||
                review.branch.toLowerCase().includes(codeReviewSearch.toLowerCase())
              )
              .map((review) => (
              <div key={review.id} className="p-2.5 bg-zinc-900/50 rounded-sm border border-zinc-800 hover:border-zinc-700 transition-colors">
                {/* Header: ID + Project + Title + Status */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <a
                      href={review.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-[10px] text-[#00d9ff] bg-zinc-800 px-1.5 py-0.5 rounded flex-shrink-0 hover:bg-zinc-700 transition-colors"
                    >
                      {review.id}
                    </a>
                    <span className="font-mono text-[9px] text-[#00d9ff] bg-[#00d9ff]/10 border border-[#00d9ff]/30 px-1.5 py-0.5 rounded flex-shrink-0">
                      {review.project}
                    </span>
                    <span className="font-mono text-xs text-white truncate">{review.title}</span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <div className={`w-2 h-2 rounded-full ${getReviewStatusColor(review.status)}`} />
                    <span className={`font-mono text-[9px] ${
                      review.status === "approved" ? "text-[#39ff14]" :
                      review.status === "in_review" ? "text-[#00d9ff]" :
                      review.status === "changes_requested" ? "text-[#ff006e]" : "text-amber-400"
                    }`}>
                      {getReviewStatusLabel(review.status)}
                    </span>
                  </div>
                </div>

                {/* Author + Branch */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-mono text-[10px] text-zinc-300">@{review.author}</span>
                  <span className="text-zinc-700">→</span>
                  <code className="font-mono text-[9px] text-zinc-500 truncate">{review.branch}</code>
                </div>

                {/* Stats Row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-[9px] font-mono">
                    <span className="text-zinc-500">{review.filesChanged} archivos</span>
                    <span className="text-[#39ff14]">+{review.additions}</span>
                    <span className="text-[#ff006e]">-{review.deletions}</span>
                    <span className="text-zinc-500">{review.comments} comentarios</span>
                  </div>
                  <span className="font-mono text-[9px] text-zinc-600">{review.timestamp}</span>
                </div>
              </div>
            ))}
            {data.codeReviews
              .filter((review) => codeReviewSearch === "" ||
                review.title.toLowerCase().includes(codeReviewSearch.toLowerCase()) ||
                review.author.toLowerCase().includes(codeReviewSearch.toLowerCase()) ||
                review.project.toLowerCase().includes(codeReviewSearch.toLowerCase()) ||
                review.branch.toLowerCase().includes(codeReviewSearch.toLowerCase())
              ).length === 0 && (
              <p className="font-mono text-xs text-zinc-500 text-center py-4">
                No hay PRs {codeReviewSearch && `que contengan "${codeReviewSearch}"`}
              </p>
            )}
          </div>

          {/* Footer Stats */}
          <div className="mt-3 pt-3 border-t border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#39ff14]" />
                <span className="font-mono text-[9px] text-zinc-500">{data.codeReviews.filter(r => r.status === "approved").length} Aprobados</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#00d9ff]" />
                <span className="font-mono text-[9px] text-zinc-500">{data.codeReviews.filter(r => r.status === "in_review").length} En revisión</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#ff006e]" />
                <span className="font-mono text-[9px] text-zinc-500">{data.codeReviews.filter(r => r.status === "changes_requested").length} Con cambios</span>
              </div>
            </div>
            <span className="font-mono text-[9px] text-zinc-600">{data.codeReviews.length} PRs activos</span>
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
