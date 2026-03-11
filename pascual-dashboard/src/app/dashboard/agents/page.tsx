"use client";

import { useState } from "react";
import { Section } from "@/components/layout/MainContent";
import { Agent } from "@/components/dashboard/AgentCard";
import { AgentConfigModal, AgentHeader } from "@/components/agents";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { Sparkline } from "@/components/charts/LineChart";

// Definición de los 4 agentes principales del sistema
const mainAgents: Agent[] = [
  {
    id: "pascual",
    name: "Pascual",
    icon: "🧠",
    description: "Orquestador principal del sistema. Experto en finanzas y administración de recursos informáticos. Eje central que coordina todos los módulos y gestiona flujos de trabajo complejos.",
    model: "claude-opus-4",
    role: "general",
    status: "active",
    activeTasks: 5,
    usageHistory: [65, 72, 68, 81, 78, 92, 85, 99, 94, 88],
  },
  {
    id: "hunter",
    name: "Hunter",
    icon: "🔍",
    description: "Especialista en búsqueda de información y extracción de datos. Rastrea, recopila y procesa información de múltiples fuentes web y APIs.",
    model: "claude-sonnet-4",
    role: "assistant",
    status: "busy",
    activeTasks: 3,
    usageHistory: [45, 52, 48, 62, 58, 70, 65, 72, 68, 75],
  },
  {
    id: "warden",
    name: "Warden",
    icon: "🛡️",
    description: "Guardián del sistema. Encargado de la seguridad, monitoreo de amenazas y actualización del dashboard. Mantiene la integridad y protección del ecosistema.",
    model: "claude-haiku-3",
    role: "security",
    status: "active",
    activeTasks: 8,
    usageHistory: [80, 85, 78, 92, 88, 95, 90, 87, 93, 89],
  },
  {
    id: "nexus",
    name: "Nexus",
    icon: "⚡",
    description: "Operador avanzado para tareas complejas. Especializado en programación sofisticada y análisis financiero orientado a predicción de datos y modelado estadístico.",
    model: "claude-opus-4",
    role: "financial",
    status: "active",
    activeTasks: 4,
    usageHistory: [55, 62, 58, 74, 68, 82, 76, 88, 84, 91],
  },
];

// Colores por rol
const getRoleColor = (role: Agent["role"]) => {
  switch (role) {
    case "financial": return "#39ff14";
    case "security": return "#ff006e";
    case "assistant": return "#ffaa00";
    case "development": return "#00d9ff";
    default: return "#00d9ff";
  }
};

// Componente de tarjeta de agente simplificada
interface SimpleAgentCardProps {
  agent: Agent;
  size?: "large" | "normal" | "compact";
}

function SimpleAgentCard({ agent, size = "normal" }: SimpleAgentCardProps) {
  const roleColor = getRoleColor(agent.role);
  const isBusy = agent.status === "busy";
  const isLarge = size === "large";
  const isCompact = size === "compact";

  return (
    <div
      className={`relative rounded-sm ${isBusy ? "animate-border-glow" : ""}`}
      style={isBusy ? {
        boxShadow: "0 0 20px rgba(255, 170, 0, 0.3)",
      } : {}}
    >
      <Card
        className={`relative overflow-hidden transition-all duration-300 ${
          isBusy ? "border-amber-500/60" : ""
        }`}
      >
        <CardHeader className={isCompact ? "py-2 px-3" : undefined}>
          <div className="flex items-center gap-2">
            <span className={`${isLarge ? "text-3xl" : isCompact ? "text-xl" : "text-2xl"}`} style={{ color: roleColor }}>
              {agent.icon}
            </span>
            <div>
              <h3 className={`font-mono font-bold ${isLarge ? "text-lg" : isCompact ? "text-xs" : "text-sm"}`}>
                {agent.name}
              </h3>
              <div className="flex items-center gap-1 mt-0.5">
                <span className={`font-mono text-zinc-600 ${isCompact ? "text-[8px]" : "text-[10px]"}`}>MODELO:</span>
                <span className={`font-mono text-zinc-400 ${isCompact ? "text-[8px]" : "text-[10px]"}`}>
                  {agent.model}
                </span>
              </div>
            </div>
          </div>
          <StatusBadge status={agent.status} size={isCompact ? "sm" : "md"} />
        </CardHeader>

      <CardBody className={isCompact ? "py-2 px-3" : undefined}>
        {/* Descripción */}
        <p className={`font-mono text-zinc-400 leading-relaxed ${isLarge ? "text-sm" : isCompact ? "text-[10px] line-clamp-3" : "text-xs"}`}>
          {agent.description}
        </p>

        {/* Stats y Gráfico */}
        <div className={`flex items-end justify-between border-t border-zinc-800 ${isCompact ? "mt-2 pt-2" : "mt-4 pt-3"}`}>
          <div className={`flex items-center ${isCompact ? "gap-2" : "gap-4"}`}>
            <div>
              <p className={`font-mono text-zinc-500 uppercase ${isCompact ? "text-[8px]" : "text-[10px]"}`}>Tareas</p>
              <p className={`font-mono font-bold ${isCompact ? "text-sm" : "text-lg"}`} style={{ color: roleColor }}>
                {agent.activeTasks}
              </p>
            </div>
            <div>
              <p className={`font-mono text-zinc-500 uppercase ${isCompact ? "text-[8px]" : "text-[10px]"}`}>Estado</p>
              <p className={`font-mono font-bold ${isCompact ? "text-xs" : "text-sm"} ${
                agent.status === "active" ? "text-[#39ff14]" :
                agent.status === "busy" ? "text-amber-400" :
                "text-zinc-500"
              }`}>
                {agent.status === "active" ? "Activo" :
                 agent.status === "busy" ? "Ocupado" :
                 agent.status === "offline" ? "Offline" : "Error"}
              </p>
            </div>
          </div>
          <div className={`${isLarge ? "w-32" : isCompact ? "w-16" : "w-24"}`}>
            <p className={`font-mono text-zinc-500 uppercase mb-1 text-right ${isCompact ? "text-[8px]" : "text-[10px]"}`}>Uso</p>
            <Sparkline data={agent.usageHistory} color={roleColor} height={isLarge ? 40 : isCompact ? 24 : 32} />
          </div>
        </div>
      </CardBody>
    </Card>
    </div>
  );
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>(mainAgents);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  // Separar Pascual de los demás agentes
  const pascualAgent = agents.find((a) => a.id === "pascual");
  const otherAgents = agents.filter((a) => a.id !== "pascual");

  const activeCount = agents.filter((a) => a.status === "active").length;
  const busyCount = agents.filter((a) => a.status === "busy").length;
  const offlineCount = agents.filter((a) => a.status === "offline").length;
  const totalTasks = agents.reduce((acc, agent) => acc + agent.activeTasks, 0);

  const handleAgentModelChange = (_agentId: string, newModel: string) => {
    if (selectedAgent) {
      setAgents(prev => prev.map(agent =>
        agent.id === selectedAgent.id ? { ...agent, model: newModel } : agent
      ));
      setSelectedAgent(prev => prev ? { ...prev, model: newModel } : null);
    }
  };

  const handleSubAgentModelChange = (_agentId: string, subAgentId: string, newModel: string) => {
    if (selectedAgent) {
      setAgents(prev => prev.map(agent =>
        agent.id === selectedAgent.id
          ? {
              ...agent,
              subAgents: agent.subAgents?.map(sub =>
                sub.id === subAgentId ? { ...sub, model: newModel } : sub
              )
            }
          : agent
      ));
      setSelectedAgent(prev => prev ? {
        ...prev,
        subAgents: prev.subAgents?.map(sub =>
          sub.id === subAgentId ? { ...sub, model: newModel } : sub
        )
      } : null);
    }
  };

  return (
    <div className="space-y-6">
      <AgentHeader
        name="Agentes del Sistema"
        icon="🤖"
        lema="Monitoreo de agentes principales"
        status="active"
        showTimeRange={true}
        usage={{
          data: [65, 72, 68, 81, 78, 92, 85, 99, 94, 88],
          dataByRange: {
            "24h": [65, 72, 68, 81, 78, 92, 85, 99, 94, 88],
            "7d": [420, 510, 485, 545, 590, 620, 578],
            "1m": [1800, 2150, 1980, 2220, 2350, 2120, 2280, 2420, 2380, 2550, 2620, 2480],
            "1y": [18500, 21200, 19800, 22600, 24200, 25800, 27500, 28200, 29100, 31500, 33800, 36100],
          },
          color: "#00d9ff",
        }}
        kpis={[
          {
            id: "total",
            label: "Agentes",
            value: agents.length,
            status: "neutral",
          },
          {
            id: "tasks",
            label: "Tareas",
            value: totalTasks,
            values: { "24h": totalTasks, "7d": totalTasks + 12, "1m": totalTasks + 45, "1y": totalTasks + 200 },
            status: "neutral",
          },
          {
            id: "active",
            label: "Activos",
            value: activeCount,
            values: { "24h": activeCount, "7d": activeCount, "1m": activeCount, "1y": activeCount },
            status: "good",
          },
          {
            id: "busy",
            label: "Ocupados",
            value: busyCount,
            values: { "24h": busyCount, "7d": busyCount + 1, "1m": busyCount, "1y": busyCount },
            status: "warning",
          },
          {
            id: "offline",
            label: "Offline",
            value: offlineCount,
            values: { "24h": offlineCount, "7d": offlineCount, "1m": offlineCount, "1y": offlineCount },
            status: offlineCount > 0 ? "critical" : "good",
          },
        ]}
      />

      {/* Pascual - Agente Principal (arriba, centrado) */}
      {pascualAgent && (
        <Section>
          <div className="flex justify-center">
            <div className="w-full max-w-2xl">
              <SimpleAgentCard agent={pascualAgent} size="large" />
            </div>
          </div>
        </Section>
      )}

      {/* Otros Agentes (abajo, en una sola fila) */}
      <Section>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {otherAgents.map((agent) => (
            <SimpleAgentCard key={agent.id} agent={agent} size="compact" />
          ))}
        </div>
      </Section>

      {/* Agent Detail Modal - conservado para usos futuros */}
      {selectedAgent && (
        <AgentConfigModal
          agent={selectedAgent}
          onClose={() => setSelectedAgent(null)}
          onAgentModelChange={handleAgentModelChange}
          onSubAgentModelChange={handleSubAgentModelChange}
        />
      )}
    </div>
  );
}
