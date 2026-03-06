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
import { optimusData } from "@/lib/api/mock/pascual-agents";

export default function OptimusDashboard() {
  const [data] = useState(optimusData);

  const getVitalStatusColor = (status: string) => {
    switch (status) {
      case "good": return "text-[#39ff14]";
      case "needs_improvement": return "text-[#ffaa00]";
      case "poor": return "text-[#ff006e]";
      default: return "text-zinc-400";
    }
  };

  const getVitalStatusBadge = (status: string) => {
    switch (status) {
      case "good": return <Badge variant="success" className="text-[9px]">Good</Badge>;
      case "needs_improvement": return <Badge variant="warning" className="text-[9px]">Needs work</Badge>;
      case "poor": return <Badge variant="danger" className="text-[9px]">Poor</Badge>;
      default: return null;
    }
  };

  const getProposalStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "bg-[#39ff14]";
      case "development": return "bg-[#00d9ff]";
      case "review": return "bg-[#ffaa00]";
      case "concept": return "bg-zinc-500";
      default: return "bg-zinc-600";
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high": return "text-[#ff006e]";
      case "medium": return "text-[#ffaa00]";
      case "low": return "text-zinc-400";
      default: return "text-zinc-500";
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
        placeholder="¿Qué necesitas diseñar o analizar?"
      />

      {/* KPIs */}
      <Section>
        <Grid cols={5}>
          <KPICard
            title="Uptime"
            value={`${data.metrics.uptime}%`}
            status={data.metrics.uptime >= 99 ? "good" : "warning"}
          />
          <KPICard
            title="Load Time"
            value={`${data.metrics.loadTime}s`}
            status={data.metrics.loadTime < 2 ? "good" : "warning"}
          />
          <KPICard
            title="Accessibility"
            value={`${data.metrics.accessibilityScore}%`}
            status={data.metrics.accessibilityScore >= 95 ? "good" : "warning"}
          />
          <KPICard
            title="UX Score"
            value={`${data.metrics.uxScore}%`}
            status={data.metrics.uxScore >= 90 ? "good" : "warning"}
          />
          <KPICard
            title="Lighthouse"
            value={data.lighthouseScore}
            status={data.lighthouseScore >= 90 ? "good" : "warning"}
          />
        </Grid>
      </Section>

      {/* Web Vitals & Components */}
      <Section>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Web Vitals */}
          <SectionCard title="Core Web Vitals">
            <div className="space-y-3">
              {data.webVitals.map((vital) => (
                <div
                  key={vital.name}
                  className="flex items-center justify-between p-3 bg-zinc-900 rounded-sm"
                >
                  <div>
                    <p className="font-mono text-sm text-white">{vital.name}</p>
                    <p className="font-mono text-[10px] text-zinc-500">
                      {vital.name === "LCP" ? "Largest Contentful Paint" :
                       vital.name === "FID" ? "First Input Delay" :
                       "Cumulative Layout Shift"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`font-mono text-lg font-bold ${getVitalStatusColor(vital.status)}`}>
                      {vital.value}
                    </span>
                    {getVitalStatusBadge(vital.status)}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-zinc-800 grid grid-cols-2 gap-4">
              <div>
                <p className="font-mono text-[10px] text-zinc-500">Error Rate</p>
                <p className={`font-mono text-lg ${data.metrics.errorRate < 1 ? "text-[#39ff14]" : "text-[#ff006e]"}`}>
                  {data.metrics.errorRate}%
                </p>
              </div>
              <div>
                <p className="font-mono text-[10px] text-zinc-500">Active Sessions</p>
                <p className="font-mono text-lg text-white">{data.metrics.activeSessions}</p>
              </div>
            </div>
          </SectionCard>

          {/* Component Usage */}
          <SectionCard
            title="Component Library"
            action={
              <Badge variant="info">{data.metrics.componentsCount} components</Badge>
            }
          >
            <div className="space-y-2">
              {data.componentsUsage.map((comp) => (
                <div
                  key={comp.name}
                  className="flex items-center justify-between p-2 bg-zinc-900 rounded-sm"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-white">{comp.name}</span>
                    {comp.isNew && (
                      <Badge variant="success" className="text-[9px]">NEW</Badge>
                    )}
                  </div>
                  <span className="font-mono text-[10px] text-zinc-400">{comp.instances} instances</span>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </Section>

      {/* Innovation & Accessibility */}
      <Section>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Innovation Proposals */}
          <SectionCard title="Innovation Pipeline">
            <div className="space-y-3">
              {data.innovationProposals.map((proposal) => (
                <div
                  key={proposal.id}
                  className="p-3 bg-zinc-900 rounded-sm"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs text-white">{proposal.title}</span>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${getProposalStatusColor(proposal.status)}`} />
                      <span className="font-mono text-[10px] text-zinc-400 capitalize">{proposal.status}</span>
                    </div>
                  </div>
                  <p className="font-mono text-[10px] text-zinc-500">{proposal.description}</p>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Accessibility Report */}
          <SectionCard
            title="Accessibility Report"
            action={
              <span className="font-mono text-xs text-zinc-400">
                WCAG {data.accessibilityReport.wcagCompliance}%
              </span>
            }
          >
            <div className="space-y-3 mb-4">
              {data.accessibilityReport.checks.map((check) => (
                <div
                  key={check.name}
                  className="flex items-center justify-between p-2 bg-zinc-900 rounded-sm"
                >
                  <span className="font-mono text-xs text-zinc-400">{check.name}</span>
                  <span className={`font-mono text-sm ${check.passed ? "text-[#39ff14]" : "text-[#ff006e]"}`}>
                    {check.passed ? "✓" : "✕"}
                  </span>
                </div>
              ))}
            </div>
            {data.accessibilityReport.issues.length > 0 && (
              <div className="pt-3 border-t border-zinc-800">
                <p className="font-mono text-[10px] text-zinc-500 mb-2">Issues Found:</p>
                {data.accessibilityReport.issues.map((issue) => (
                  <div
                    key={issue.id}
                    className="flex items-start gap-2 py-1"
                  >
                    <span className={`font-mono text-xs ${getSeverityColor(issue.severity)}`}>●</span>
                    <span className="font-mono text-[10px] text-zinc-400">{issue.description}</span>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </div>
      </Section>

      {/* Performance Overview */}
      <Section>
        <SectionCard title="Performance Metrics">
          <div className="grid grid-cols-4 gap-6">
            <div className="text-center p-4 bg-zinc-900 rounded-sm">
              <p className="font-mono text-3xl font-bold text-[#39ff14]">{data.lighthouseScore}</p>
              <p className="font-mono text-[10px] text-zinc-500 mt-1">Lighthouse Score</p>
            </div>
            <div className="text-center p-4 bg-zinc-900 rounded-sm">
              <p className="font-mono text-3xl font-bold text-[#00d9ff]">{data.metrics.uxScore}%</p>
              <p className="font-mono text-[10px] text-zinc-500 mt-1">UX Score</p>
            </div>
            <div className="text-center p-4 bg-zinc-900 rounded-sm">
              <p className="font-mono text-3xl font-bold text-white">{data.metrics.componentsCount}</p>
              <p className="font-mono text-[10px] text-zinc-500 mt-1">Components</p>
            </div>
            <div className="text-center p-4 bg-zinc-900 rounded-sm">
              <p className={`font-mono text-3xl font-bold ${data.metrics.errorRate < 1 ? "text-[#39ff14]" : "text-[#ff006e]"}`}>
                {data.metrics.errorRate}%
              </p>
              <p className="font-mono text-[10px] text-zinc-500 mt-1">Error Rate</p>
            </div>
          </div>
        </SectionCard>
      </Section>

      <SubAgentsStatusBar
        subAgents={data.subAgents}
        lastSync={data.lastSync}
      />
    </div>
  );
}
