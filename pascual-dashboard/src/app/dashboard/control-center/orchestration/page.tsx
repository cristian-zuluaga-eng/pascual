"use client";

import { useState } from "react";
import { PageHeader, Section, SectionHeader, Grid } from "@/components/layout/MainContent";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Select, Textarea } from "@/components/ui/Input";

type AgentStatus = "active" | "busy" | "offline" | "error";

interface AgentControl {
  id: string;
  name: string;
  icon: string;
  status: AgentStatus;
  subAgents: number;
}

interface AgentMessage {
  id: string;
  timestamp: string;
  fromAgent: string;
  toAgent: string;
  type: "directive" | "query" | "response" | "notification" | "alert";
  subject: string;
  content: string;
}

const AGENTS: AgentControl[] = [
  { id: "asistente", name: "Asistente", icon: "👤", status: "active", subAgents: 3 },
  { id: "nexus", name: "Nexus", icon: "🔧", status: "active", subAgents: 8 },
  { id: "sentinel", name: "Sentinel", icon: "🛡️", status: "active", subAgents: 5 },
  { id: "scout", name: "Scout", icon: "🔍", status: "busy", subAgents: 5 },
  { id: "audiovisual", name: "Audiovisual", icon: "🎬", status: "offline", subAgents: 5 },
  { id: "consultor", name: "Consultor", icon: "📚", status: "active", subAgents: 5 },
  { id: "gambito", name: "Gambito", icon: "🎯", status: "active", subAgents: 5 },
  { id: "condor360", name: "Cóndor360", icon: "📈", status: "active", subAgents: 5 },
  { id: "optimus", name: "Optimus", icon: "🎨", status: "active", subAgents: 5 },
];

const mockMessages: AgentMessage[] = [
  { id: "1", timestamp: "2m ago", fromAgent: "Pascual", toAgent: "Nexus", type: "directive", subject: "Priority: Deploy hotfix", content: "Deploy security patch CVE-2024-1234 to production immediately" },
  { id: "2", timestamp: "15m ago", fromAgent: "Sentinel", toAgent: "Pascual", type: "alert", subject: "Unusual activity detected", content: "Multiple failed login attempts from IP 203.0.113.45" },
  { id: "3", timestamp: "32m ago", fromAgent: "Nexus", toAgent: "Sentinel", type: "query", subject: "Security review request", content: "Please review PR #456 for security implications before merge" },
  { id: "4", timestamp: "1h ago", fromAgent: "Gambito", toAgent: "Cóndor360", type: "notification", subject: "Model correlation", content: "New correlation found between market volatility and sports betting patterns" },
  { id: "5", timestamp: "2h ago", fromAgent: "Scout", toAgent: "Pascual", type: "response", subject: "Data extraction complete", content: "Successfully extracted 2.3GB of financial news data" },
];

export default function OrchestrationPage() {
  const [agents, setAgents] = useState<AgentControl[]>(AGENTS);
  const [messages, setMessages] = useState<AgentMessage[]>(mockMessages);
  const [selectedFrom, setSelectedFrom] = useState("pascual");
  const [selectedTo, setSelectedTo] = useState("all");
  const [messageContent, setMessageContent] = useState("");

  const systemResources = {
    cpu: 78,
    ram: 62,
    gpu: 45,
  };

  const getStatusColor = (status: AgentStatus) => {
    switch (status) {
      case "active": return "bg-[#39ff14]";
      case "busy": return "bg-amber-400";
      case "offline": return "bg-zinc-600";
      case "error": return "bg-[#ff006e]";
    }
  };

  const getMessageTypeStyles = (type: AgentMessage["type"]) => {
    switch (type) {
      case "directive": return { bg: "border-[#00d9ff]", icon: "▶", color: "text-[#00d9ff]" };
      case "alert": return { bg: "border-[#ff006e]", icon: "⚠", color: "text-[#ff006e]" };
      case "query": return { bg: "border-amber-500", icon: "?", color: "text-amber-400" };
      case "notification": return { bg: "border-zinc-600", icon: "●", color: "text-zinc-400" };
      case "response": return { bg: "border-[#39ff14]", icon: "↩", color: "text-[#39ff14]" };
    }
  };

  const toggleAgent = (agentId: string) => {
    setAgents(prev => prev.map(agent => {
      if (agent.id === agentId) {
        const newStatus: AgentStatus = agent.status === "active" ? "offline" : "active";
        return { ...agent, status: newStatus };
      }
      return agent;
    }));
  };

  const restartAgent = (agentId: string) => {
    setAgents(prev => prev.map(agent => {
      if (agent.id === agentId) {
        return { ...agent, status: "busy" };
      }
      return agent;
    }));
    // Simulate restart
    setTimeout(() => {
      setAgents(prev => prev.map(agent => {
        if (agent.id === agentId) {
          return { ...agent, status: "active" };
        }
        return agent;
      }));
    }, 2000);
  };

  const sendMessage = () => {
    if (!messageContent.trim()) return;

    const newMessage: AgentMessage = {
      id: Date.now().toString(),
      timestamp: "Just now",
      fromAgent: selectedFrom === "pascual" ? "Pascual" : AGENTS.find(a => a.id === selectedFrom)?.name || selectedFrom,
      toAgent: selectedTo === "all" ? "All Agents" : AGENTS.find(a => a.id === selectedTo)?.name || selectedTo,
      type: "directive",
      subject: "Manual directive",
      content: messageContent.trim(),
    };

    setMessages(prev => [newMessage, ...prev]);
    setMessageContent("");
  };

  const activeCount = agents.filter(a => a.status === "active").length;
  const busyCount = agents.filter(a => a.status === "busy").length;
  const offlineCount = agents.filter(a => a.status === "offline").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Orchestration"
        description="Control manual de agentes y comunicación inter-agentes"
      />

      {/* Quick Actions + Agent Communication */}
      <Section>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick Actions & Controls */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <span className="font-mono text-sm text-zinc-400 uppercase">Quick Actions</span>
              </CardHeader>
              <CardBody className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Button variant="primary">
                    <span className="flex items-center gap-2">
                      <span>▶</span>
                      <span>Start All</span>
                    </span>
                  </Button>
                  <Button variant="secondary">
                    <span className="flex items-center gap-2">
                      <span>⏸</span>
                      <span>Pause All</span>
                    </span>
                  </Button>
                  <Button variant="ghost">
                    <span className="flex items-center gap-2">
                      <span>🔄</span>
                      <span>Restart System</span>
                    </span>
                  </Button>
                  <Button variant="ghost">
                    <span className="flex items-center gap-2">
                      <span>📊</span>
                      <span>Generate Report</span>
                    </span>
                  </Button>
                </div>
              </CardBody>
            </Card>

            {/* Individual Agent Controls */}
            <Card>
              <CardHeader>
                <span className="font-mono text-sm text-zinc-400 uppercase">Individual Controls</span>
                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="text-[#39ff14]">{activeCount} on</span>
                  <span className="text-amber-400">{busyCount} busy</span>
                  <span className="text-zinc-500">{offlineCount} off</span>
                </div>
              </CardHeader>
              <CardBody className="p-0">
                <div className="divide-y divide-zinc-800">
                  {agents.map((agent) => (
                    <div key={agent.id} className="flex items-center justify-between px-4 py-3 hover:bg-zinc-900/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{agent.icon}</span>
                        <div>
                          <p className="font-mono text-xs text-white">{agent.name}</p>
                          <p className="font-mono text-[10px] text-zinc-600">{agent.subAgents} sub-agents</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(agent.status)} ${agent.status === "active" ? "status-pulse" : ""}`} />
                          <span className="font-mono text-[10px] text-zinc-500 w-12">{agent.status}</span>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => toggleAgent(agent.id)}
                            className={`w-7 h-7 rounded-sm flex items-center justify-center transition-colors ${
                              agent.status === "active" || agent.status === "busy"
                                ? "bg-amber-950/50 text-amber-400 hover:bg-amber-950"
                                : "bg-green-950/50 text-[#39ff14] hover:bg-green-950"
                            }`}
                            title={agent.status === "active" || agent.status === "busy" ? "Pause" : "Start"}
                          >
                            {agent.status === "active" || agent.status === "busy" ? "⏸" : "▶"}
                          </button>
                          <button
                            onClick={() => restartAgent(agent.id)}
                            className="w-7 h-7 rounded-sm bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white flex items-center justify-center transition-colors"
                            title="Restart"
                          >
                            🔄
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>

            {/* System Resources */}
            <Card>
              <CardHeader>
                <span className="font-mono text-sm text-zinc-400 uppercase">System Resources</span>
              </CardHeader>
              <CardBody className="space-y-3">
                <ResourceBar label="CPU" value={systemResources.cpu} color="#00d9ff" />
                <ResourceBar label="RAM" value={systemResources.ram} color="#39ff14" />
                <ResourceBar label="GPU" value={systemResources.gpu} color="#ff006e" />
              </CardBody>
            </Card>
          </div>

          {/* Agent Communication */}
          <Card className="h-fit">
            <CardHeader>
              <span className="font-mono text-sm text-zinc-400 uppercase">Agent Communication</span>
            </CardHeader>
            <CardBody className="space-y-4">
              {/* Message Composer */}
              <div className="space-y-3">
                <div className="flex gap-3">
                  <Select
                    label="From"
                    options={[
                      { value: "pascual", label: "Pascual (Orchestrator)" },
                      ...agents.map(a => ({ value: a.id, label: `${a.icon} ${a.name}` }))
                    ]}
                    value={selectedFrom}
                    onChange={(e) => setSelectedFrom(e.target.value)}
                    className="flex-1"
                  />
                  <Select
                    label="To"
                    options={[
                      { value: "all", label: "All Agents" },
                      ...agents.map(a => ({ value: a.id, label: `${a.icon} ${a.name}` }))
                    ]}
                    value={selectedTo}
                    onChange={(e) => setSelectedTo(e.target.value)}
                    className="flex-1"
                  />
                </div>
                <Textarea
                  placeholder="Enter message or directive..."
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  className="min-h-[80px]"
                />
                <Button variant="primary" onClick={sendMessage} disabled={!messageContent.trim()} fullWidth>
                  Send Directive
                </Button>
              </div>

              {/* Recent Messages */}
              <div className="pt-4 border-t border-zinc-800">
                <SectionHeader title="Recent Messages" />
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {messages.map((msg) => {
                    const styles = getMessageTypeStyles(msg.type);
                    return (
                      <div
                        key={msg.id}
                        className={`p-3 rounded-sm bg-zinc-900 border-l-2 ${styles.bg}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className={`${styles.color}`}>{styles.icon}</span>
                            <span className="font-mono text-xs text-white">{msg.fromAgent}</span>
                            <span className="font-mono text-[10px] text-zinc-600">→</span>
                            <span className="font-mono text-xs text-zinc-400">{msg.toAgent}</span>
                          </div>
                          <span className="font-mono text-[10px] text-zinc-600 flex-shrink-0">{msg.timestamp}</span>
                        </div>
                        <p className="font-mono text-xs text-zinc-300 mt-1">{msg.subject}</p>
                        <p className="font-mono text-[10px] text-zinc-500 mt-1 line-clamp-2">{msg.content}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </Section>

      {/* Workflow Visualization */}
      <Section>
        <Card>
          <CardHeader>
            <span className="font-mono text-sm text-zinc-400 uppercase">Workflow Visualization</span>
            <span className="font-mono text-xs text-zinc-500">Agent Communication Flow</span>
          </CardHeader>
          <CardBody>
            <div className="relative h-[300px] bg-zinc-900/50 rounded-sm overflow-hidden">
              {/* Central Orchestrator */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                <div className="w-20 h-20 bg-zinc-800 border-2 border-[#00d9ff] rounded-full flex items-center justify-center shadow-neo-cyan">
                  <div className="text-center">
                    <span className="text-2xl">⌘</span>
                    <p className="font-mono text-[9px] text-[#00d9ff]">PASCUAL</p>
                  </div>
                </div>
              </div>

              {/* Agent Nodes in Circle */}
              {agents.map((agent, index) => {
                const angle = (index / agents.length) * 2 * Math.PI - Math.PI / 2;
                const radius = 120;
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;

                return (
                  <div
                    key={agent.id}
                    className="absolute"
                    style={{
                      left: `calc(50% + ${x}px)`,
                      top: `calc(50% + ${y}px)`,
                      transform: "translate(-50%, -50%)"
                    }}
                  >
                    {/* Connection Line */}
                    <svg
                      className="absolute"
                      style={{
                        left: "50%",
                        top: "50%",
                        width: `${Math.abs(x) + 40}px`,
                        height: `${Math.abs(y) + 40}px`,
                        transform: `translate(${x > 0 ? "-100%" : "0"}, ${y > 0 ? "-100%" : "0"})`,
                        pointerEvents: "none"
                      }}
                    >
                      <line
                        x1={x > 0 ? "100%" : "0"}
                        y1={y > 0 ? "100%" : "0"}
                        x2={x > 0 ? "0" : "100%"}
                        y2={y > 0 ? "0" : "100%"}
                        stroke={agent.status === "active" ? "#00d9ff" : agent.status === "busy" ? "#ffaa00" : "#3f3f46"}
                        strokeWidth="1"
                        strokeDasharray={agent.status === "offline" ? "4 4" : "none"}
                        opacity="0.3"
                      />
                    </svg>

                    {/* Agent Node */}
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all cursor-pointer hover:scale-110 ${
                        agent.status === "active"
                          ? "bg-zinc-800 border-[#39ff14]"
                          : agent.status === "busy"
                          ? "bg-zinc-800 border-amber-400"
                          : "bg-zinc-900 border-zinc-700"
                      }`}
                      title={`${agent.name} - ${agent.status}`}
                    >
                      <span className="text-lg">{agent.icon}</span>
                    </div>
                    <p className="font-mono text-[8px] text-zinc-500 text-center mt-1 w-12 truncate">{agent.name}</p>
                  </div>
                );
              })}

              {/* Legend */}
              <div className="absolute bottom-3 right-3 flex items-center gap-4 font-mono text-[9px]">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#39ff14]" /> Active
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-400" /> Busy
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-zinc-600" /> Offline
                </span>
              </div>
            </div>
          </CardBody>
        </Card>
      </Section>
    </div>
  );
}

// Resource Bar Component
function ResourceBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="font-mono text-xs text-zinc-500 w-10">{label}</span>
      <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${value}%`, backgroundColor: color }}
        />
      </div>
      <span className="font-mono text-xs text-zinc-400 w-10 text-right">{value}%</span>
    </div>
  );
}
