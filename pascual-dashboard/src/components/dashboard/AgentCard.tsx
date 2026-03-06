"use client";

import { useState } from "react";
import { Card, CardHeader, CardBody } from "../ui/Card";
import { StatusBadge } from "../ui/Badge";
import { Sparkline } from "../charts/LineChart";
import { Tooltip } from "../ui/Tooltip";

export interface SubAgent {
  id: string;
  name: string;
  description: string;
  model: string;
  status: "active" | "busy" | "offline" | "error";
}

export interface Agent {
  id: string;
  name: string;
  icon: string;
  description: string;
  model: string;
  role: "general" | "financial" | "security" | "assistant" | "development";
  status: "active" | "busy" | "offline" | "error";
  activeTasks: number;
  usageHistory: number[];
  subAgents?: SubAgent[];
}

interface AgentCardProps {
  agent: Agent;
  onExpand?: () => void;
}

type TimeRange = "24h" | "7d" | "1m" | "1y";

const TIME_RANGE_LABELS: Record<TimeRange, string> = {
  "24h": "24H",
  "7d": "7D",
  "1m": "1M",
  "1y": "1Y",
};

const getRoleColor = (role: Agent["role"]) => {
  switch (role) {
    case "financial":
      return "#39ff14";
    case "security":
      return "#ff006e";
    case "assistant":
      return "#ffaa00";
    case "development":
      return "#00d9ff";
    default:
      return "#00d9ff";
  }
};

const getStatusColor = (status: SubAgent["status"]) => {
  switch (status) {
    case "active":
      return "bg-[#39ff14]";
    case "busy":
      return "bg-amber-400";
    case "offline":
      return "bg-zinc-600";
    case "error":
      return "bg-[#ff006e]";
    default:
      return "bg-zinc-600";
  }
};

// Simulated RAM usage for sub-agents (in percentage)
const getSubAgentRam = (subAgentId: string): number => {
  // Generate a pseudo-random but consistent value based on ID
  const hash = subAgentId.split("").reduce((a, b) => a + b.charCodeAt(0), 0);
  return 5 + (hash % 25); // 5-30%
};

// Simulated RAM usage for main agent (in percentage)
const getAgentRam = (agentId: string): number => {
  const hash = agentId.split("").reduce((a, b) => a + b.charCodeAt(0), 0);
  return 15 + (hash % 35); // 15-50%
};

export function AgentCard({ agent, onExpand }: AgentCardProps) {
  const roleColor = getRoleColor(agent.role);
  const [timeRange, setTimeRange] = useState<TimeRange>("24h");

  // Simulate different data lengths based on time range
  const getDataForRange = (range: TimeRange) => {
    const baseData = agent.usageHistory;
    switch (range) {
      case "24h":
        return baseData.slice(-10);
      case "7d":
        return [...baseData, ...baseData.slice(0, 5)].slice(-15);
      case "1m":
        return [...baseData, ...baseData, ...baseData].slice(-30);
      case "1y":
        return [...baseData, ...baseData, ...baseData, ...baseData].slice(-40);
      default:
        return baseData;
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="flex items-center gap-2">
          <span className="text-xl" style={{ color: roleColor }}>{agent.icon}</span>
          <h3 className="font-mono text-sm font-bold">{agent.name}</h3>
        </div>
        <StatusBadge status={agent.status} />
      </CardHeader>

      <CardBody>
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs text-zinc-400 font-mono">
            <span className="text-zinc-500">MODEL:</span> {agent.model}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono text-zinc-500">
              RAM: <span className="text-amber-400">{getAgentRam(agent.id)}%</span>
            </span>
            <button
              onClick={onExpand}
              className="flex items-center gap-1.5 px-2 py-1 bg-zinc-800 border border-zinc-700 rounded-sm text-[#00d9ff] hover:bg-zinc-700 hover:text-white transition-colors"
            >
              <span className="text-xs">⚙</span>
              <span className="text-[10px] font-mono">CONFIG</span>
            </button>
          </div>
        </div>
        <div className="text-xs text-zinc-400 font-mono mb-3">
          <span className="text-zinc-500">ROLE:</span>{" "}
          <span style={{ color: roleColor }}>{agent.role.toUpperCase()}</span>
        </div>

        {/* Two column layout */}
        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-zinc-800">
          {/* Column 1: Sub-agents list with RAM */}
          <div className="min-w-0">
            <p className="text-[10px] font-mono text-zinc-500 uppercase mb-2">Sub-agents</p>
            {agent.subAgents && agent.subAgents.length > 0 ? (
              <div className="space-y-1.5">
                {agent.subAgents.map((subAgent) => (
                  <Tooltip key={subAgent.id} content={subAgent.description} position="right">
                    <div className="flex items-center gap-1.5 text-xs font-mono cursor-help">
                      <span className="text-[9px] text-zinc-600 w-8 flex-shrink-0">{getSubAgentRam(subAgent.id)}%</span>
                      <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${getStatusColor(subAgent.status)}`} />
                      <span className="text-zinc-400 truncate">{subAgent.name}</span>
                    </div>
                  </Tooltip>
                ))}
              </div>
            ) : (
              <p className="text-xs font-mono text-zinc-600">No sub-agents</p>
            )}
          </div>

          {/* Column 2: Usage chart with time range slider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-mono text-zinc-500 uppercase">Usage</p>
              <div className="flex gap-0.5">
                {(Object.keys(TIME_RANGE_LABELS) as TimeRange[]).map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-1.5 py-0.5 text-[9px] font-mono rounded-sm transition-colors ${
                      timeRange === range
                        ? "bg-zinc-700 text-white"
                        : "text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    {TIME_RANGE_LABELS[range]}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-[50px]">
              <Sparkline data={getDataForRange(timeRange)} color={roleColor} height={50} />
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

interface AgentListItemProps {
  agent: Agent;
  onExpand?: () => void;
}

export function AgentListItem({ agent, onExpand }: AgentListItemProps) {
  const roleColor = getRoleColor(agent.role);

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-sm hover:border-zinc-700 transition-colors">
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center gap-3">
          <span className="text-xl" style={{ color: roleColor }}>{agent.icon}</span>
          <div>
            <h3 className="font-mono text-sm font-bold">{agent.name}</h3>
            <p className="font-mono text-xs text-zinc-500">{agent.model}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-24">
            <Sparkline data={agent.usageHistory} color={roleColor} height={24} />
          </div>
          <span className="text-[10px] font-mono text-zinc-500">
            RAM: <span className="text-amber-400">{getAgentRam(agent.id)}%</span>
          </span>
          <StatusBadge status={agent.status} />
          <button
            onClick={onExpand}
            className="flex items-center gap-1.5 px-2 py-1 bg-zinc-800 border border-zinc-700 rounded-sm text-[#00d9ff] hover:bg-zinc-700 hover:text-white transition-colors"
          >
            <span className="text-xs">⚙</span>
            <span className="text-[10px] font-mono">EXPAND</span>
          </button>
        </div>
      </div>

      {/* Sub-agents row */}
      {agent.subAgents && agent.subAgents.length > 0 && (
        <div className="px-3 pb-3 pt-0">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pl-8 pt-2 border-t border-zinc-800">
            {agent.subAgents.map((subAgent) => (
              <Tooltip key={subAgent.id} content={subAgent.description} position="top" inline>
                <div className="flex items-center gap-1.5 text-xs font-mono cursor-help">
                  <span className="text-[9px] text-zinc-600">{getSubAgentRam(subAgent.id)}%</span>
                  <div className={`w-1.5 h-1.5 rounded-full ${getStatusColor(subAgent.status)}`} />
                  <span className="text-zinc-400">{subAgent.name}</span>
                </div>
              </Tooltip>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
