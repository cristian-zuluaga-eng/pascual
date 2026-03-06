"use client";

import { useState } from "react";
import { Section, Grid } from "@/components/layout/MainContent";
import { Badge } from "@/components/ui/Badge";
import {
  AgentHeader,
  PascualFeedbackBar,
  SubAgentsStatusBar,
  KPICard,
  ProgressBar,
  SectionCard,
} from "@/components/agents";
import { sentinelData } from "@/lib/api/mock/pascual-agents";

export default function SentinelDashboard() {
  const [data] = useState(sentinelData);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-[#ff006e]";
      case "warning": return "bg-amber-500";
      case "info": return "bg-[#00d9ff]";
      default: return "bg-zinc-600";
    }
  };

  const getThreatStatusColor = (status: string) => {
    switch (status) {
      case "active": return "text-[#ff006e]";
      case "investigating": return "text-amber-400";
      case "resolved": return "text-[#39ff14]";
      default: return "text-zinc-400";
    }
  };

  const getResourceStatusColor = (status: string) => {
    switch (status) {
      case "ok": return "#39ff14";
      case "warning": return "#ffaa00";
      case "critical": return "#ff006e";
      default: return "#00d9ff";
    }
  };

  const getAccessActionIcon = (action: string) => {
    switch (action) {
      case "login": return "→";
      case "logout": return "←";
      case "api_call": return "⚡";
      case "failed_login": return "✕";
      default: return "•";
    }
  };

  return (
    <div className="space-y-6">
      <AgentHeader
        name={data.name}
        icon={data.icon}
        lema={data.lema}
        status={data.status}
        onRefresh={() => console.log("Refresh")}
      />

      <PascualFeedbackBar
        agentId={data.id}
        agentName={data.name}
        agentIcon={data.icon}
        quickActions={data.quickActions}
        placeholder="¿Qué necesitas verificar en seguridad?"
      />

      {/* KPIs */}
      <Section>
        <Grid cols={5}>
          <KPICard
            title="Security Score"
            value={`${data.metrics.securityScore}%`}
            status={data.metrics.securityScore >= 90 ? "good" : "warning"}
          />
          <KPICard
            title="Uptime"
            value={`${data.metrics.uptime}%`}
            status={data.metrics.uptime >= 99 ? "good" : "warning"}
          />
          <KPICard
            title="Threats Blocked"
            value={`${data.metrics.threatsBlocked}/${data.metrics.threatsDetected}`}
            status="good"
            subtitle="100% blocked"
          />
          <KPICard
            title="MTTD"
            value={`${data.metrics.mttd}s`}
            status="good"
            subtitle="Mean Time To Detect"
          />
          <KPICard
            title="Compliance"
            value={`${data.metrics.complianceScore}%`}
            status={data.metrics.complianceScore === 100 ? "good" : "warning"}
          />
        </Grid>
      </Section>

      {/* Threats & Resources */}
      <Section>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Active Threats */}
          <SectionCard
            title="Threat Monitor"
            action={
              <Badge variant={data.threats.some(t => t.status === "active") ? "danger" : "success"}>
                {data.threats.filter(t => t.status !== "resolved").length} active
              </Badge>
            }
          >
            <div className="space-y-2">
              {data.threats.map((threat) => (
                <div
                  key={threat.id}
                  className="flex items-start gap-3 p-2 bg-zinc-900 rounded-sm"
                >
                  <div className={`w-2 h-2 mt-1.5 rounded-full ${getSeverityColor(threat.severity)}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-mono text-xs text-white truncate">{threat.title}</p>
                      <span className={`font-mono text-[10px] ${getThreatStatusColor(threat.status)}`}>
                        [{threat.status}]
                      </span>
                    </div>
                    <p className="font-mono text-[10px] text-zinc-500 truncate">{threat.description}</p>
                  </div>
                  <span className="font-mono text-[10px] text-zinc-600 flex-shrink-0">{threat.timestamp}</span>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* System Resources */}
          <SectionCard title="System Resources">
            <div className="space-y-3">
              {data.systemResources.map((resource) => (
                <ProgressBar
                  key={resource.name}
                  label={resource.name}
                  value={resource.usage}
                  color={getResourceStatusColor(resource.status)}
                />
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-zinc-800 grid grid-cols-2 gap-4">
              <div>
                <p className="font-mono text-[10px] text-zinc-500">Active Sessions</p>
                <p className="font-mono text-sm text-white">{data.metrics.activeSessions}</p>
              </div>
              <div>
                <p className="font-mono text-[10px] text-zinc-500">Active API Keys</p>
                <p className="font-mono text-sm text-white">{data.metrics.activeApiKeys}</p>
              </div>
            </div>
          </SectionCard>
        </div>
      </Section>

      {/* Access Logs & Vulnerabilities */}
      <Section>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Access Logs */}
          <SectionCard
            title="Access Logs"
            action={
              <Badge variant={data.metrics.failedLogins24h > 5 ? "warning" : "default"}>
                {data.metrics.failedLogins24h} failed (24h)
              </Badge>
            }
          >
            <div className="space-y-2">
              {data.accessLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center gap-3 p-2 bg-zinc-900 rounded-sm"
                >
                  <span className={`font-mono text-sm ${log.success ? "text-[#39ff14]" : "text-[#ff006e]"}`}>
                    {getAccessActionIcon(log.action)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-xs text-white truncate">{log.user}</p>
                    <p className="font-mono text-[10px] text-zinc-500">
                      {log.action.replace("_", " ")} {log.ip && `• ${log.ip}`}
                    </p>
                  </div>
                  <span className="font-mono text-[10px] text-zinc-600">{log.timestamp}</span>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Vulnerability Report */}
          <SectionCard
            title="Vulnerability Scan"
            action={<span className="font-mono text-[10px] text-zinc-500">Last: {data.vulnerabilities.lastScan}</span>}
          >
            <div className="grid grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <p className={`font-mono text-2xl font-bold ${data.vulnerabilities.critical > 0 ? "text-[#ff006e]" : "text-zinc-500"}`}>
                  {data.vulnerabilities.critical}
                </p>
                <p className="font-mono text-[10px] text-zinc-500">Critical</p>
              </div>
              <div className="text-center">
                <p className={`font-mono text-2xl font-bold ${data.vulnerabilities.high > 0 ? "text-amber-500" : "text-zinc-500"}`}>
                  {data.vulnerabilities.high}
                </p>
                <p className="font-mono text-[10px] text-zinc-500">High</p>
              </div>
              <div className="text-center">
                <p className={`font-mono text-2xl font-bold ${data.vulnerabilities.medium > 0 ? "text-[#ffaa00]" : "text-zinc-500"}`}>
                  {data.vulnerabilities.medium}
                </p>
                <p className="font-mono text-[10px] text-zinc-500">Medium</p>
              </div>
              <div className="text-center">
                <p className="font-mono text-2xl font-bold text-zinc-400">{data.vulnerabilities.low}</p>
                <p className="font-mono text-[10px] text-zinc-500">Low</p>
              </div>
            </div>

            {/* Backup Status */}
            <div className="pt-4 border-t border-zinc-800">
              <p className="font-mono text-xs text-zinc-400 mb-2">Backup Status</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-mono text-[10px] text-zinc-500">Last: {data.backup.lastBackup}</p>
                  <p className="font-mono text-[10px] text-zinc-500">Next: {data.backup.nextBackup}</p>
                </div>
                <div className="text-right">
                  <Badge variant={data.backup.recoveryTestStatus === "passed" ? "success" : "warning"}>
                    Recovery: {data.backup.recoveryTestStatus}
                  </Badge>
                  <p className="font-mono text-[10px] text-zinc-500 mt-1">{data.backup.size}</p>
                </div>
              </div>
            </div>
          </SectionCard>
        </div>
      </Section>

      <SubAgentsStatusBar
        subAgents={data.subAgents}
        lastSync={data.lastSync}
      />
    </div>
  );
}
