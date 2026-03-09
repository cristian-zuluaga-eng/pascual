"use client";

import { useState } from "react";
import { Section, Grid } from "@/components/layout/MainContent";
import { AgentCard, Agent } from "@/components/dashboard/AgentCard";
import { mockAgents } from "@/lib/api/mock/agents";
import { AgentConfigModal, AgentHeader } from "@/components/agents";
import { useDashboardConfig } from "@/lib/context/DashboardConfigContext";

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>(mockAgents);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const { config } = useDashboardConfig();

  // Filtrar agentes según configuración de agentViews
  const filteredAgents = agents.filter((agent) => {
    // Pascual siempre se muestra
    if (agent.id === "pascual") return true;
    // Para los demás, verificar si están habilitados en agentViews
    const agentKey = agent.id as keyof typeof config.agentViews;
    return config.agentViews[agentKey] !== false;
  });

  // Separar Pascual de los demás agentes
  const pascualAgent = filteredAgents.find((a) => a.id === "pascual");
  const otherAgents = filteredAgents.filter((a) => a.id !== "pascual");

  const activeCount = filteredAgents.filter((a) => a.status === "active").length;
  const busyCount = filteredAgents.filter((a) => a.status === "busy").length;
  const offlineCount = filteredAgents.filter((a) => a.status === "offline").length;
  const totalSubAgents = filteredAgents.reduce((acc, agent) => acc + (agent.subAgents?.length || 0), 0);

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
    <div className="space-y-4">
      <AgentHeader
        name="Agent Management"
        icon="🤖"
        lema="Monitor and configure your AI agents"
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
            label: "Total",
            value: filteredAgents.length,
            status: "neutral",
          },
          {
            id: "subagents",
            label: "Sub-agents",
            value: totalSubAgents,
            values: { "24h": totalSubAgents, "7d": totalSubAgents, "1m": totalSubAgents - 2, "1y": totalSubAgents - 5 },
            status: "neutral",
          },
          {
            id: "active",
            label: "Active",
            value: activeCount,
            values: { "24h": activeCount, "7d": activeCount - 1, "1m": activeCount - 2, "1y": activeCount - 3 },
            status: "good",
            statuses: { "24h": "good", "7d": "good", "1m": "warning", "1y": "warning" },
          },
          {
            id: "busy",
            label: "Busy",
            value: busyCount,
            values: { "24h": busyCount, "7d": busyCount + 1, "1m": busyCount + 2, "1y": busyCount + 1 },
            status: "warning",
          },
          {
            id: "offline",
            label: "Offline",
            value: offlineCount,
            values: { "24h": offlineCount, "7d": offlineCount, "1m": offlineCount + 1, "1y": offlineCount + 2 },
            status: offlineCount > 0 ? "critical" : "good",
            statuses: { "24h": offlineCount > 0 ? "critical" : "good", "7d": "good", "1m": "warning", "1y": "critical" },
          },
        ]}
      />

      {/* Pascual - Master Agent (centrado arriba) */}
      {pascualAgent && (
        <Section>
          <div className="flex justify-center">
            <div className="w-full max-w-md">
              <AgentCard
                agent={pascualAgent}
                onExpand={() => setSelectedAgent(pascualAgent)}
              />
            </div>
          </div>
        </Section>
      )}

      {/* Separator line with Sub-agentes label */}
      <div className="flex items-center gap-4 mb-2">
        <div className="flex-1 h-px bg-zinc-800" />
        <span className="font-mono text-xs text-zinc-500 uppercase">Sub-agentes</span>
        <div className="flex-1 h-px bg-zinc-800" />
      </div>

      {/* Other Agents Display */}
      <Section>
        <Grid cols={3}>
          {otherAgents.map((agent) => (
            <AgentCard
              key={agent.id}
              agent={agent}
              onExpand={() => setSelectedAgent(agent)}
            />
          ))}
        </Grid>
      </Section>

      {/* Agent Detail Modal - usando componente reutilizable */}
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
