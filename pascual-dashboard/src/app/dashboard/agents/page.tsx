"use client";

import { useState } from "react";
import { PageHeader, Section, SectionHeader, Grid } from "@/components/layout/MainContent";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardBody, CardFooter } from "@/components/ui/Card";
import { Badge, StatusBadge } from "@/components/ui/Badge";
import { Input, Select } from "@/components/ui/Input";
import { AgentCard, AgentListItem, Agent, getModelEfficiency } from "@/components/dashboard/AgentCard";
import { LineChart } from "@/components/charts/LineChart";
import { CircularProgress } from "@/components/charts/CircularProgress";
import { Tooltip } from "@/components/ui/Tooltip";
import { mockAgents, AVAILABLE_MODELS } from "@/lib/api/mock/agents";

type ViewMode = "grid" | "list";

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>(mockAgents);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  const activeCount = agents.filter((a) => a.status === "active").length;
  const busyCount = agents.filter((a) => a.status === "busy").length;
  const offlineCount = agents.filter((a) => a.status === "offline").length;

  const handleAgentModelChange = (agentId: string, newModel: string) => {
    setAgents(prev => prev.map(agent =>
      agent.id === agentId ? { ...agent, model: newModel } : agent
    ));
    if (selectedAgent?.id === agentId) {
      setSelectedAgent(prev => prev ? { ...prev, model: newModel } : null);
    }
  };

  const handleSubAgentModelChange = (agentId: string, subAgentId: string, newModel: string) => {
    setAgents(prev => prev.map(agent =>
      agent.id === agentId
        ? {
            ...agent,
            subAgents: agent.subAgents?.map(sub =>
              sub.id === subAgentId ? { ...sub, model: newModel } : sub
            )
          }
        : agent
    ));
    if (selectedAgent?.id === agentId) {
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
      <PageHeader
        title="Agent Management"
        description="Monitor and configure your AI agents"
      />

      {/* Stats Overview */}
      <Section>
        <Grid cols={4}>
          <Card>
            <CardBody className="text-center">
              <p className="text-3xl font-mono font-bold text-white">{agents.length}</p>
              <p className="text-xs font-mono text-zinc-500 mt-1">Total Agents</p>
            </CardBody>
          </Card>
          <Card variant="success">
            <CardBody className="text-center">
              <p className="text-3xl font-mono font-bold text-[#39ff14]">{activeCount}</p>
              <p className="text-xs font-mono text-zinc-500 mt-1">Active</p>
            </CardBody>
          </Card>
          <Card variant="warning">
            <CardBody className="text-center">
              <p className="text-3xl font-mono font-bold text-amber-400">{busyCount}</p>
              <p className="text-xs font-mono text-zinc-500 mt-1">Busy</p>
            </CardBody>
          </Card>
          <Card variant="danger">
            <CardBody className="text-center">
              <p className="text-3xl font-mono font-bold text-zinc-500">{offlineCount}</p>
              <p className="text-xs font-mono text-zinc-500 mt-1">Offline</p>
            </CardBody>
          </Card>
        </Grid>
      </Section>

      {/* View Mode Toggle */}
      <Section>
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded-sm transition-colors ${
              viewMode === "grid"
                ? "bg-cyan-950 text-[#00d9ff]"
                : "text-zinc-500 hover:text-white"
            }`}
          >
            ⊞
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-sm transition-colors ${
              viewMode === "list"
                ? "bg-cyan-950 text-[#00d9ff]"
                : "text-zinc-500 hover:text-white"
            }`}
          >
            ☰
          </button>
        </div>
      </Section>

      {/* Agents Display */}
      <Section>
        {viewMode === "grid" ? (
          <Grid cols={3}>
            {agents.map((agent) => (
              <AgentCard
                key={agent.id}
                agent={agent}
                onExpand={() => setSelectedAgent(agent)}
              />
            ))}
          </Grid>
        ) : (
          <div className="space-y-2">
            {agents.map((agent) => (
              <AgentListItem
                key={agent.id}
                agent={agent}
                onExpand={() => setSelectedAgent(agent)}
              />
            ))}
          </div>
        )}
      </Section>

      {/* Agent Detail Modal */}
      {selectedAgent && (
        <AgentDetailModal
          agent={selectedAgent}
          onClose={() => setSelectedAgent(null)}
          onAgentModelChange={handleAgentModelChange}
          onSubAgentModelChange={handleSubAgentModelChange}
          availableModels={AVAILABLE_MODELS}
          onNewTask={(agentId, task) => {
            console.log(`New task for ${agentId}: ${task}`);
            // TODO: Implement task submission logic
          }}
        />
      )}
    </div>
  );
}

type TimeRange = "24h" | "7d" | "1m" | "1y";

const TIME_RANGE_LABELS: Record<TimeRange, string> = {
  "24h": "24H",
  "7d": "7D",
  "1m": "1M",
  "1y": "1Y",
};

function AgentDetailModal({
  agent,
  onClose,
  onAgentModelChange,
  onSubAgentModelChange,
  availableModels,
  onNewTask,
}: {
  agent: Agent;
  onClose: () => void;
  onAgentModelChange: (agentId: string, newModel: string) => void;
  onSubAgentModelChange: (agentId: string, subAgentId: string, newModel: string) => void;
  availableModels: string[];
  onNewTask?: (agentId: string, task: string) => void;
}) {
  const [taskInput, setTaskInput] = useState("");
  const [timeRange, setTimeRange] = useState<TimeRange>("24h");

  // Simulate different data lengths based on time range
  const getDataForRange = (range: TimeRange) => {
    const baseData = agent.usageHistory;
    switch (range) {
      case "24h":
        return baseData.slice(-10).map((value, index) => ({ name: `${index}h`, value }));
      case "7d":
        return [...baseData, ...baseData.slice(0, 5)].slice(-15).map((value, index) => ({ name: `D${index + 1}`, value }));
      case "1m":
        return [...baseData, ...baseData, ...baseData].slice(-30).map((value, index) => ({ name: `W${Math.floor(index / 7) + 1}`, value }));
      case "1y":
        return [...baseData, ...baseData, ...baseData, ...baseData].slice(-12).map((value, index) => ({ name: `M${index + 1}`, value }));
      default:
        return baseData.map((value, index) => ({ name: `${index}h`, value }));
    }
  };

  const handleNewTask = () => {
    if (taskInput.trim() && onNewTask) {
      onNewTask(agent.id, taskInput.trim());
      setTaskInput("");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-zinc-950 border border-zinc-800 rounded-sm w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center gap-3">
            <h2 className="font-mono text-lg font-bold">{agent.name}</h2>
            <StatusBadge status={agent.status} />
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-white transition-colors"
          >
            ✕
          </button>
        </CardHeader>

        <CardBody className="space-y-5">
          {/* Description */}
          <div>
            <p className="text-xs font-mono text-zinc-500 uppercase mb-1">Description</p>
            <p className="font-mono text-sm text-zinc-400">{agent.description}</p>
          </div>

          {/* Agent Info with Model Selector */}
          <div className="flex items-start justify-between">
            <div className="flex gap-8">
              <div>
                <p className="text-xs font-mono text-zinc-500 uppercase">Role</p>
                <p className="font-mono text-white capitalize">{agent.role}</p>
              </div>
              <div>
                <p className="text-xs font-mono text-zinc-500 uppercase">Active Tasks</p>
                <p className="font-mono text-white">{agent.activeTasks}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-mono text-zinc-500 uppercase mb-1">Model</p>
              <div className="flex items-center gap-2">
                <Select
                  options={availableModels.map(m => ({ value: m, label: m }))}
                  value={agent.model}
                  onChange={(e) => onAgentModelChange(agent.id, e.target.value)}
                  compact
                  className="w-36"
                />
                <Tooltip content="Consider reviewing model selection" position="top" inline>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-sm cursor-help bg-amber-950/50 text-amber-400 border border-amber-500/30">
                    !
                  </span>
                </Tooltip>
              </div>
            </div>
          </div>

          {/* Sub-agents with model selection */}
          {agent.subAgents && agent.subAgents.length > 0 && (
            <div>
              <SectionHeader title="Sub-agents" />
              <div className="space-y-2">
                {agent.subAgents.map((subAgent) => (
                  <div
                    key={subAgent.id}
                    className="flex items-center justify-between p-2 bg-zinc-900 rounded-sm border border-zinc-800"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        subAgent.status === "active" ? "bg-[#39ff14]" :
                        subAgent.status === "busy" ? "bg-amber-400" :
                        subAgent.status === "error" ? "bg-[#ff006e]" : "bg-zinc-600"
                      }`} />
                      <div>
                        <p className="font-mono text-xs text-white">{subAgent.name}</p>
                        <p className="font-mono text-[10px] text-zinc-500">{subAgent.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Select
                        options={availableModels.map(m => ({ value: m, label: m }))}
                        value={subAgent.model}
                        onChange={(e) => onSubAgentModelChange(agent.id, subAgent.id, e.target.value)}
                        compact
                        className="w-36"
                      />
                      {(() => {
                        const efficiency = getModelEfficiency(subAgent.name, subAgent.model);
                        return (
                          <Tooltip content={efficiency.reason} position="top" inline>
                            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-sm cursor-help ${
                              efficiency.isEfficient
                                ? "bg-green-950/50 text-[#39ff14] border border-green-500/30"
                                : "bg-amber-950/50 text-amber-400 border border-amber-500/30"
                            }`}>
                              {efficiency.isEfficient ? "✓" : "!"}
                            </span>
                          </Tooltip>
                        );
                      })()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New Task - moved below sub-agents */}
          <div>
            <SectionHeader title="New Task" />
            <div className="flex gap-2">
              <Input
                placeholder="Describe the task for this agent..."
                value={taskInput}
                onChange={(e) => setTaskInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && taskInput.trim() && handleNewTask()}
                className="flex-1"
              />
              <Button
                variant="primary"
                onClick={handleNewTask}
                disabled={!taskInput.trim()}
                className={!taskInput.trim() ? "opacity-50 cursor-not-allowed" : ""}
              >
                <span className="flex items-center gap-1.5">
                  <span>▶</span>
                  <span>Send</span>
                </span>
              </Button>
            </div>
          </div>

          {/* Performance with time range selector */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-mono text-zinc-500 uppercase">Usage History</p>
              <div className="flex gap-1">
                {(Object.keys(TIME_RANGE_LABELS) as TimeRange[]).map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-2 py-1 text-[10px] font-mono rounded-sm transition-colors ${
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
            <div className="bg-zinc-900 rounded-sm p-3">
              <LineChart data={getDataForRange(timeRange)} height={80} />
            </div>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col items-center">
              <CircularProgress value={78} size={80} color="#00d9ff" label="Efficiency" />
            </div>
            <div className="flex flex-col items-center">
              <CircularProgress value={92} size={80} color="#39ff14" label="Accuracy" />
            </div>
            <div className="flex flex-col items-center">
              <CircularProgress value={65} size={80} color="#ff006e" label="Load" />
            </div>
          </div>

          {/* Capabilities */}
          <div>
            <SectionHeader title="Capabilities" />
            <div className="flex flex-wrap gap-2">
              <Badge variant="info">Natural Language</Badge>
              <Badge variant="info">Code Analysis</Badge>
              <Badge variant="info">Data Processing</Badge>
              <Badge variant="success">Active Learning</Badge>
            </div>
          </div>
        </CardBody>

        <CardFooter className="justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="secondary">
            Disable Agent
          </Button>
          <Button variant="primary">
            Save Changes
          </Button>
        </CardFooter>
      </div>
    </div>
  );
}
