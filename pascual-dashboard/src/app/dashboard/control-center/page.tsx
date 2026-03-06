"use client";

import { useState } from "react";
import { PageHeader, Section, SectionHeader, Grid } from "@/components/layout/MainContent";
import { Card, CardBody, CardHeader, StatCard } from "@/components/ui/Card";
import { Badge, StatusBadge } from "@/components/ui/Badge";
import { LineChart } from "@/components/charts/LineChart";
import { ActivityFeed, ActivityItem } from "@/components/dashboard/ActivityFeed";

// Agent definitions based on PASCUAL ecosystem
const PASCUAL_AGENTS = [
  { id: "asistente", name: "Asistente", icon: "👤", status: "active" as const, subAgents: 3, role: "personal" },
  { id: "nexus", name: "Nexus", icon: "🔧", status: "active" as const, subAgents: 8, role: "development" },
  { id: "sentinel", name: "Sentinel", icon: "🛡️", status: "active" as const, subAgents: 5, role: "security" },
  { id: "scout", name: "Scout", icon: "🔍", status: "busy" as const, subAgents: 5, role: "search" },
  { id: "audiovisual", name: "Audiovisual", icon: "🎬", status: "offline" as const, subAgents: 5, role: "multimedia" },
  { id: "consultor", name: "Consultor", icon: "📚", status: "active" as const, subAgents: 5, role: "advisory" },
  { id: "gambito", name: "Gambito", icon: "🎯", status: "active" as const, subAgents: 5, role: "prediction" },
  { id: "condor360", name: "Cóndor360", icon: "📈", status: "active" as const, subAgents: 5, role: "financial" },
  { id: "optimus", name: "Optimus", icon: "🎨", status: "active" as const, subAgents: 5, role: "ux" },
];

type AlertSeverity = "critical" | "warning" | "info";

interface Alert {
  id: string;
  severity: AlertSeverity;
  title: string;
  message: string;
  agentId?: string;
  timestamp: string;
}

const mockAlerts: Alert[] = [
  { id: "1", severity: "warning", title: "High CPU Usage", message: "Sentinel detecting high resource consumption", agentId: "sentinel", timestamp: "2m ago" },
  { id: "2", severity: "info", title: "Deploy Completed", message: "Nexus successfully deployed v2.3.1", agentId: "nexus", timestamp: "5m ago" },
  { id: "3", severity: "warning", title: "API Rate Limited", message: "Scout external API calls throttled", agentId: "scout", timestamp: "12m ago" },
  { id: "4", severity: "critical", title: "Agent Offline", message: "Audiovisual agent not responding", agentId: "audiovisual", timestamp: "15m ago" },
];

const mockActivities: ActivityItem[] = [
  { id: "1", type: "agent", title: "Nexus completed code review", agentName: "Nexus", timestamp: "2m ago" },
  { id: "2", type: "security", title: "Security scan completed", agentName: "Sentinel", timestamp: "5m ago" },
  { id: "3", type: "task", title: "Data extraction finished", agentName: "Scout", timestamp: "8m ago" },
  { id: "4", type: "system", title: "System backup completed", timestamp: "15m ago" },
  { id: "5", type: "agent", title: "Portfolio analysis updated", agentName: "Cóndor360", timestamp: "22m ago" },
];

const activityTimelineData = [
  { name: "00:00", value: 12 },
  { name: "04:00", value: 8 },
  { name: "08:00", value: 35 },
  { name: "12:00", value: 52 },
  { name: "16:00", value: 48 },
  { name: "20:00", value: 31 },
  { name: "Now", value: 45 },
];

export default function ControlCenterPage() {
  const [alerts] = useState<Alert[]>(mockAlerts);

  const activeCount = PASCUAL_AGENTS.filter(a => a.status === "active").length;
  const busyCount = PASCUAL_AGENTS.filter(a => a.status === "busy").length;
  const offlineCount = PASCUAL_AGENTS.filter(a => a.status === "offline").length;
  const totalSubAgents = PASCUAL_AGENTS.reduce((acc, a) => acc + a.subAgents, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-[#39ff14]";
      case "busy": return "bg-amber-400";
      case "offline": return "bg-zinc-600";
      case "error": return "bg-[#ff006e]";
      default: return "bg-zinc-600";
    }
  };

  const getSeverityStyles = (severity: AlertSeverity) => {
    switch (severity) {
      case "critical": return { bg: "bg-pink-950/30", border: "border-[#ff006e]", text: "text-[#ff006e]", icon: "✕" };
      case "warning": return { bg: "bg-amber-950/30", border: "border-amber-500", text: "text-amber-400", icon: "⚠" };
      case "info": return { bg: "bg-cyan-950/30", border: "border-[#00d9ff]", text: "text-[#00d9ff]", icon: "●" };
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mando de Control"
        description="Centro de operaciones del ecosistema PASCUAL - 9 agentes, 46 sub-agentes"
      />

      {/* Alerts Bar */}
      <Section>
        <Card>
          <CardBody className="py-3">
            <div className="flex items-center justify-end">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-zinc-500">Alerts:</span>
                <Badge variant="danger" pulse>{alerts.filter(a => a.severity === "critical").length}</Badge>
                <Badge variant="warning">{alerts.filter(a => a.severity === "warning").length}</Badge>
                <Badge variant="info">{alerts.filter(a => a.severity === "info").length}</Badge>
              </div>
            </div>
          </CardBody>
        </Card>
      </Section>

      {/* KPI Stats */}
      <Section>
        <Grid cols={4}>
          <StatCard
            title="Active Agents"
            value={`${activeCount}/9`}
            trend={{ value: 12, positive: true }}
            variant="success"
          />
          <StatCard
            title="Pending Tasks"
            value="23"
            trend={{ value: 5, positive: false }}
            variant="warning"
          />
          <StatCard
            title="Success Rate"
            value="94.2%"
            trend={{ value: 2.1, positive: true }}
            variant="info"
          />
          <StatCard
            title="Sub-agents"
            value={`${totalSubAgents}`}
            variant="default"
          />
        </Grid>
      </Section>

      {/* Main Content Grid */}
      <Section>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Agent Status Grid */}
          <Card>
            <CardHeader>
              <span className="font-mono text-sm text-zinc-400 uppercase">Agent Status</span>
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#39ff14]" /> {activeCount}
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-400" /> {busyCount}
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-zinc-600" /> {offlineCount}
                </span>
              </div>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-3 gap-3">
                {PASCUAL_AGENTS.map((agent) => (
                  <div
                    key={agent.id}
                    className="p-3 bg-zinc-900 rounded-sm border border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-lg">{agent.icon}</span>
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(agent.status)} ${agent.status === "active" ? "status-pulse" : ""}`} />
                    </div>
                    <p className="font-mono text-xs text-white truncate">{agent.name}</p>
                    <p className="font-mono text-[10px] text-zinc-500">{agent.subAgents} sub-agents</p>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* Activity Timeline */}
          <Card>
            <CardHeader>
              <span className="font-mono text-sm text-zinc-400 uppercase">Activity Timeline</span>
              <span className="font-mono text-xs text-zinc-500">Last 24h</span>
            </CardHeader>
            <CardBody>
              <div className="h-[180px]">
                <LineChart
                  data={activityTimelineData}
                  height={180}
                  color="#00d9ff"
                  showAxis
                  showTooltip
                />
              </div>
            </CardBody>
          </Card>
        </div>
      </Section>

      {/* Bottom Section: Alerts + Activity Feed */}
      <Section>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Alerts */}
          <Card>
            <CardHeader>
              <span className="font-mono text-sm text-zinc-400 uppercase">Recent Alerts</span>
              <button className="font-mono text-xs text-[#00d9ff] hover:underline">View All</button>
            </CardHeader>
            <CardBody className="space-y-2">
              {alerts.slice(0, 4).map((alert) => {
                const styles = getSeverityStyles(alert.severity);
                return (
                  <div
                    key={alert.id}
                    className={`p-3 rounded-sm border ${styles.bg} ${styles.border}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-2">
                        <span className={`${styles.text} text-sm`}>{styles.icon}</span>
                        <div>
                          <p className={`font-mono text-xs ${styles.text}`}>{alert.title}</p>
                          <p className="font-mono text-[10px] text-zinc-500 mt-0.5">{alert.message}</p>
                        </div>
                      </div>
                      <span className="font-mono text-[10px] text-zinc-600">{alert.timestamp}</span>
                    </div>
                  </div>
                );
              })}
            </CardBody>
          </Card>

          {/* Quick Stats & Activity */}
          <Card>
            <CardHeader>
              <span className="font-mono text-sm text-zinc-400 uppercase">Recent Activity</span>
            </CardHeader>
            <CardBody>
              <ActivityFeed activities={mockActivities} maxItems={5} />
            </CardBody>
          </Card>
        </div>
      </Section>

      {/* Quick Stats Row */}
      <Section>
        <Grid cols={5}>
          <Card>
            <CardBody className="text-center py-4">
              <p className="font-mono text-2xl text-white">127</p>
              <p className="font-mono text-[10px] text-zinc-500 uppercase">Tasks Today</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="text-center py-4">
              <p className="font-mono text-2xl text-[#00d9ff]">1.2s</p>
              <p className="font-mono text-[10px] text-zinc-500 uppercase">Avg Response</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="text-center py-4">
              <p className="font-mono text-2xl text-[#ff006e]">3</p>
              <p className="font-mono text-[10px] text-zinc-500 uppercase">Errors</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="text-center py-4">
              <p className="font-mono text-2xl text-[#39ff14]">98.2%</p>
              <p className="font-mono text-[10px] text-zinc-500 uppercase">Uptime</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="text-center py-4">
              <p className="font-mono text-2xl text-amber-400">5</p>
              <p className="font-mono text-[10px] text-zinc-500 uppercase">Warnings</p>
            </CardBody>
          </Card>
        </Grid>
      </Section>
    </div>
  );
}
