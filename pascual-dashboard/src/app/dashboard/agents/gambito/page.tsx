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
import { gambitoData } from "@/lib/api/mock/pascual-agents";

export default function GambitoDashboard() {
  const [data] = useState(gambitoData);

  const getConvictionColor = (conviction: string) => {
    switch (conviction) {
      case "high": return "border-[#39ff14] bg-[#39ff14]/10";
      case "medium": return "border-[#00d9ff] bg-[#00d9ff]/10";
      case "low": return "border-zinc-600 bg-zinc-800/50";
      default: return "border-zinc-700";
    }
  };

  const getConvictionBadge = (conviction: string) => {
    switch (conviction) {
      case "high": return <Badge variant="success" className="text-[9px]">HIGH</Badge>;
      case "medium": return <Badge variant="info" className="text-[9px]">MEDIUM</Badge>;
      case "low": return <Badge variant="default" className="text-[9px]">LOW</Badge>;
      default: return null;
    }
  };

  const getRoiColor = (roi: number) => {
    if (roi >= 10) return "text-[#39ff14]";
    if (roi >= 5) return "text-[#00d9ff]";
    if (roi >= 0) return "text-zinc-400";
    return "text-[#ff006e]";
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
        placeholder="¿Qué partido o mercado quieres analizar?"
      />

      {/* KPIs */}
      <Section>
        <Grid cols={5}>
          <KPICard
            title="ROI"
            value={`${data.metrics.roi > 0 ? "+" : ""}${data.metrics.roi}%`}
            status={data.metrics.roi > 5 ? "good" : data.metrics.roi > 0 ? "neutral" : "critical"}
          />
          <KPICard
            title="Win Rate"
            value={`${data.metrics.winRate}%`}
            status={data.metrics.winRate > 55 ? "good" : "warning"}
          />
          <KPICard
            title="Model Accuracy"
            value={`${data.metrics.modelAccuracy}%`}
            status={data.metrics.modelAccuracy > 70 ? "good" : "warning"}
          />
          <KPICard
            title="Sharpe Ratio"
            value={data.metrics.sharpeRatio.toFixed(2)}
            status={data.metrics.sharpeRatio > 1 ? "good" : "warning"}
          />
          <KPICard
            title="Max Drawdown"
            value={`${data.metrics.maxDrawdown}%`}
            status={data.metrics.maxDrawdown > -10 ? "good" : "critical"}
          />
        </Grid>
      </Section>

      {/* Predictions & Bankroll */}
      <Section>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Predictions */}
          <div className="lg:col-span-2">
            <SectionCard
              title="Predicciones Activas"
              action={
                <Badge variant="info">{data.metrics.highConfidenceCount} high conviction</Badge>
              }
            >
              <div className="space-y-3">
                {data.activePredictions.map((pred) => (
                  <div
                    key={pred.id}
                    className={`p-3 rounded-sm border ${getConvictionColor(pred.confidence)}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{pred.sportIcon}</span>
                        <span className="font-mono text-xs text-zinc-400">{pred.sport}</span>
                        {getConvictionBadge(pred.confidence)}
                      </div>
                      <span className="font-mono text-[10px] text-zinc-500">{pred.timestamp}</span>
                    </div>
                    <p className="font-mono text-sm text-white mb-1">{pred.match}</p>
                    <p className="font-mono text-[10px] text-zinc-500 mb-2">{pred.odds}</p>
                    <div className="flex items-center justify-between pt-2 border-t border-zinc-700/50">
                      <span className="font-mono text-xs text-[#00d9ff]">{pred.prediction}</span>
                      <span className={`font-mono text-xs ${pred.value > 0.05 ? "text-[#39ff14]" : "text-zinc-400"}`}>
                        EV: +{(pred.value * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>

          {/* Bankroll */}
          <SectionCard title="Bankroll">
            <div className="space-y-4">
              <div className="text-center p-4 bg-zinc-900 rounded-sm">
                <p className="font-mono text-[10px] text-zinc-500 mb-1">CURRENT</p>
                <p className={`font-mono text-3xl font-bold ${data.bankroll.pnl >= 0 ? "text-[#39ff14]" : "text-[#ff006e]"}`}>
                  ${data.bankroll.current.toLocaleString()}
                </p>
                <p className={`font-mono text-sm ${data.bankroll.pnl >= 0 ? "text-[#39ff14]" : "text-[#ff006e]"}`}>
                  {data.bankroll.pnl >= 0 ? "+" : ""}{data.bankroll.pnlPercent}%
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 bg-zinc-900 rounded-sm text-center">
                  <p className="font-mono text-[10px] text-zinc-500">Initial</p>
                  <p className="font-mono text-sm text-white">${data.bankroll.initial.toLocaleString()}</p>
                </div>
                <div className="p-2 bg-zinc-900 rounded-sm text-center">
                  <p className="font-mono text-[10px] text-zinc-500">P&L</p>
                  <p className={`font-mono text-sm ${data.bankroll.pnl >= 0 ? "text-[#39ff14]" : "text-[#ff006e]"}`}>
                    {data.bankroll.pnl >= 0 ? "+" : ""}${data.bankroll.pnl}
                  </p>
                </div>
              </div>
              <div className="pt-3 border-t border-zinc-800">
                <div className="flex justify-between mb-1">
                  <span className="font-mono text-[10px] text-zinc-500">Avg Stake</span>
                  <span className="font-mono text-xs text-white">{data.bankroll.avgStake}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-mono text-[10px] text-zinc-500">Kelly Fraction</span>
                  <span className="font-mono text-xs text-white">{data.bankroll.kellyFraction}%</span>
                </div>
              </div>
            </div>
          </SectionCard>
        </div>
      </Section>

      {/* Market Performance & Model Stats */}
      <Section>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Market Performance */}
          <SectionCard title="Rendimiento por Mercado">
            <div className="space-y-2">
              {data.marketPerformance.map((market) => (
                <div
                  key={market.market}
                  className="flex items-center justify-between p-2 bg-zinc-900 rounded-sm"
                >
                  <div className="flex items-center gap-2">
                    <span>{market.icon}</span>
                    <span className="font-mono text-xs text-white">{market.market}</span>
                  </div>
                  <span className={`font-mono text-sm font-bold ${getRoiColor(market.roi)}`}>
                    {market.roi > 0 ? "+" : ""}{market.roi}%
                  </span>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Model Stats */}
          <SectionCard title="Rendimiento de Modelos">
            <div className="space-y-3">
              {data.modelStats.map((model) => (
                <div key={model.name} className="p-2 bg-zinc-900 rounded-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs text-white">{model.name}</span>
                    <span className="font-mono text-[10px] text-zinc-500">
                      Calibrado: {model.lastCalibration}
                    </span>
                  </div>
                  <ProgressBar
                    label=""
                    value={model.accuracy}
                    color={model.accuracy > 75 ? "#39ff14" : model.accuracy > 65 ? "#00d9ff" : "#ffaa00"}
                    showValue={true}
                  />
                </div>
              ))}
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
