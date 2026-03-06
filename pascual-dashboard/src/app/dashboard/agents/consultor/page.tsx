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
import { consultorData } from "@/lib/api/mock/pascual-agents";

export default function ConsultorDashboard() {
  const [data] = useState(consultorData);

  const getImplementedColor = (implemented: string) => {
    switch (implemented) {
      case "yes": return "text-[#39ff14]";
      case "in_progress": return "text-[#00d9ff]";
      case "pending": return "text-zinc-500";
      default: return "text-zinc-400";
    }
  };

  const getImplementedIcon = (implemented: string) => {
    switch (implemented) {
      case "yes": return "✓";
      case "in_progress": return "◐";
      case "pending": return "○";
      default: return "•";
    }
  };

  const getResultBadge = (result?: string) => {
    switch (result) {
      case "positive": return <Badge variant="success" className="text-[9px]">Positive</Badge>;
      case "negative": return <Badge variant="danger" className="text-[9px]">Negative</Badge>;
      case "neutral": return <Badge variant="default" className="text-[9px]">Neutral</Badge>;
      default: return null;
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
        agentName={data.name}
        quickActions={data.quickActions}
        placeholder="¿En qué área necesitas asesoría?"
        onSendMessage={(msg) => console.log("Message:", msg)}
      />

      {/* KPIs */}
      <Section>
        <Grid cols={5}>
          <KPICard
            title="Consultas Mes"
            value={data.metrics.consultationsThisMonth}
            trend={{ value: 15, positive: true }}
          />
          <KPICard
            title="Satisfacción"
            value={`${data.metrics.userSatisfaction}/5`}
            status={data.metrics.userSatisfaction >= 4 ? "good" : "warning"}
          />
          <KPICard
            title="Planes Activos"
            value={data.metrics.activePlans}
            status="neutral"
          />
          <KPICard
            title="Follow-up Rate"
            value={`${data.metrics.followUpRate}%`}
            status={data.metrics.followUpRate >= 60 ? "good" : "warning"}
          />
          <KPICard
            title="Éxito Recomend."
            value={`${data.metrics.recommendationSuccessRate}%`}
            status={data.metrics.recommendationSuccessRate >= 75 ? "good" : "warning"}
          />
        </Grid>
      </Section>

      {/* Expertise Areas & Active Plans */}
      <Section>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Expertise Areas */}
          <SectionCard title="Áreas de Experticia">
            <div className="space-y-3">
              {data.expertiseAreas.map((area) => (
                <div
                  key={area.id}
                  className="flex items-center justify-between p-3 bg-zinc-900 rounded-sm"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{area.icon}</span>
                    <div>
                      <p className="font-mono text-xs text-white">{area.name}</p>
                      <p className="font-mono text-[10px] text-zinc-500">
                        {area.consultations} consultas • Última: {area.lastConsultation}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-[#ffaa00]">★ {area.rating}</span>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Active Plans */}
          <SectionCard
            title="Planes Activos"
            action={
              <Badge variant="info">{data.activePlans.length} activos</Badge>
            }
          >
            <div className="space-y-3">
              {data.activePlans.map((plan) => (
                <div
                  key={plan.id}
                  className="p-3 bg-zinc-900 rounded-sm"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs text-white">{plan.name}</span>
                    <Badge variant="default" className="text-[9px]">{plan.area}</Badge>
                  </div>
                  <ProgressBar
                    label=""
                    value={plan.progress}
                    color={plan.progress >= 80 ? "#39ff14" : "#00d9ff"}
                    showValue={true}
                  />
                  <p className="font-mono text-[10px] text-zinc-500 mt-2">
                    Próximo: {plan.nextAction}
                  </p>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </Section>

      {/* Recommendations */}
      <Section>
        <SectionCard
          title="Recomendaciones Recientes"
          action={
            <button className="font-mono text-xs text-[#00d9ff] hover:underline">Ver historial</button>
          }
        >
          <div className="space-y-2">
            {data.recentRecommendations.map((rec) => (
              <div
                key={rec.id}
                className="flex items-start gap-3 p-3 bg-zinc-900 rounded-sm"
              >
                <span className={`font-mono text-sm mt-0.5 ${getImplementedColor(rec.implemented)}`}>
                  {getImplementedIcon(rec.implemented)}
                </span>
                <div className="flex-1">
                  <p className="font-mono text-xs text-white">{rec.text}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="default" className="text-[9px]">{rec.area}</Badge>
                    {getResultBadge(rec.result)}
                    {rec.adherence !== undefined && (
                      <span className="font-mono text-[10px] text-zinc-500">
                        Adherencia: {rec.adherence}%
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </Section>

      {/* Summary Stats */}
      <Section>
        <div className="grid grid-cols-5 gap-4">
          {data.expertiseAreas.map((area) => (
            <div key={area.id} className="text-center p-4 bg-zinc-900/50 border border-zinc-800 rounded-sm">
              <span className="text-2xl">{area.icon}</span>
              <p className="font-mono text-lg font-bold text-white mt-2">{area.consultations}</p>
              <p className="font-mono text-[10px] text-zinc-500">{area.name}</p>
              <p className="font-mono text-[10px] text-[#ffaa00] mt-1">★ {area.rating}</p>
            </div>
          ))}
        </div>
      </Section>

      <SubAgentsStatusBar
        subAgents={data.subAgents}
        lastSync={data.lastSync}
      />
    </div>
  );
}
