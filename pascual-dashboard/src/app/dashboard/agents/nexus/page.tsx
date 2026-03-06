"use client";

import { useState } from "react";
import { Section, Grid } from "@/components/layout/MainContent";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  AgentHeader,
  PascualFeedbackBar,
  SubAgentsStatusBar,
  KPICard,
  ProgressBar,
  SectionCard,
} from "@/components/agents";
import { nexusData } from "@/lib/api/mock/pascual-agents";

export default function NexusDashboard() {
  const [data] = useState(nexusData);

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
        placeholder="¿Qué necesitas desarrollar?"
      />

      {/* KPIs */}
      <Section>
        <Grid cols={5}>
          <KPICard
            title="Cobertura Tests"
            value={`${data.metrics.testCoverage}%`}
            trend={{ value: 2, positive: true }}
            status={data.metrics.testCoverage >= 80 ? "good" : "warning"}
          />
          <KPICard
            title="Deuda Técnica"
            value={data.metrics.technicalDebt.toUpperCase()}
            status={data.metrics.technicalDebt === "low" ? "good" : data.metrics.technicalDebt === "medium" ? "warning" : "critical"}
            subtitle="✓"
          />
          <KPICard
            title="Deploys Semana"
            value={data.metrics.deploysThisWeek}
            trend={{ value: 20, positive: true }}
          />
          <KPICard
            title="PRs Abiertos"
            value={data.metrics.prsOpen}
            status={data.metrics.prsOpen < 10 ? "good" : "warning"}
          />
          <KPICard
            title="Bugs Abiertos"
            value={data.metrics.bugsOpen}
            trend={{ value: 40, positive: true }}
            status={data.metrics.bugsOpen < 5 ? "good" : "warning"}
          />
        </Grid>
      </Section>

      {/* Pipeline & Code Quality */}
      <Section>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Development Pipeline */}
          <SectionCard title="Pipeline de Desarrollo">
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
          <SectionCard title="Code Quality">
            <div className="space-y-3">
              <ProgressBar label="Complexity" value={data.metrics.codeComplexity} color="#00d9ff" />
              <ProgressBar label="Maintainab." value={data.metrics.maintainabilityIndex} color="#39ff14" />
              <ProgressBar label="Documentation" value={data.metrics.documentationCoverage} color="#ffaa00" />
              <ProgressBar label="Test Coverage" value={data.metrics.testCoverage} color="#39ff14" />
            </div>
            <div className="mt-4 pt-4 border-t border-zinc-800">
              <p className="font-mono text-xs text-zinc-500 uppercase mb-2">Architecture Coherence</p>
              <div className="w-full h-3 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#00d9ff] to-[#39ff14] rounded-full"
                  style={{ width: `${data.metrics.architectureCoherence}%` }}
                />
              </div>
              <p className="font-mono text-right text-xs text-zinc-400 mt-1">{data.metrics.architectureCoherence}%</p>
            </div>
          </SectionCard>
        </div>
      </Section>

      {/* Commits & Model Performance */}
      <Section>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Commits */}
          <SectionCard
            title="Recent Commits"
            action={<button className="font-mono text-xs text-[#00d9ff] hover:underline">View all</button>}
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
          <SectionCard title="Model Performance">
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
                <p className="font-mono text-[10px] text-zinc-500">Avg Response</p>
                <p className="font-mono text-sm text-white">{(data.metrics.avgResponseTime / 1000).toFixed(1)}s</p>
              </div>
              <div>
                <p className="font-mono text-[10px] text-zinc-500">Token Usage</p>
                <p className="font-mono text-sm text-white">{(data.metrics.tokenUsageDaily / 1000).toFixed(0)}K/day</p>
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
