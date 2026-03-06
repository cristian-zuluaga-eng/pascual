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
import { condor360Data } from "@/lib/api/mock/pascual-agents";

export default function Condor360Dashboard() {
  const [data] = useState(condor360Data);

  const getConvictionStyle = (conviction: string) => {
    switch (conviction) {
      case "high": return { border: "border-[#39ff14]", bg: "bg-[#39ff14]/10", badge: "success" as const };
      case "medium": return { border: "border-[#00d9ff]", bg: "bg-[#00d9ff]/10", badge: "info" as const };
      case "low": return { border: "border-[#ff006e]", bg: "bg-[#ff006e]/10", badge: "danger" as const };
      default: return { border: "border-zinc-700", bg: "bg-zinc-900", badge: "default" as const };
    }
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return "text-[#39ff14]";
    if (change < 0) return "text-[#ff006e]";
    return "text-zinc-400";
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "positive": return "text-[#39ff14]";
      case "negative": return "text-[#ff006e]";
      default: return "text-zinc-400";
    }
  };

  const getSentimentStyle = (sentiment: string) => {
    switch (sentiment) {
      case "bullish": return { color: "text-[#39ff14]", icon: "▲" };
      case "bearish": return { color: "text-[#ff006e]", icon: "▼" };
      default: return { color: "text-zinc-400", icon: "●" };
    }
  };

  const sentimentStyle = getSentimentStyle(data.marketSentiment);

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
        placeholder="¿Qué activo o mercado quieres analizar?"
      />

      {/* KPIs */}
      <Section>
        <Grid cols={5}>
          <KPICard
            title="Portfolio Return"
            value={`${data.metrics.portfolioReturn > 0 ? "+" : ""}${data.metrics.portfolioReturn}%`}
            status={data.metrics.portfolioReturn > 10 ? "good" : data.metrics.portfolioReturn > 0 ? "neutral" : "critical"}
          />
          <KPICard
            title="Sharpe Ratio"
            value={data.metrics.sharpeRatio.toFixed(2)}
            status={data.metrics.sharpeRatio > 1.5 ? "good" : "warning"}
          />
          <KPICard
            title="Alpha"
            value={`${data.metrics.alpha > 0 ? "+" : ""}${data.metrics.alpha}%`}
            status={data.metrics.alpha > 2 ? "good" : "neutral"}
          />
          <KPICard
            title="Max Drawdown"
            value={`${data.metrics.maxDrawdown}%`}
            status={data.metrics.maxDrawdown > -10 ? "good" : "critical"}
          />
          <KPICard
            title="Prediction Acc."
            value={`${data.metrics.predictionAccuracy}%`}
            status={data.metrics.predictionAccuracy > 65 ? "good" : "warning"}
          />
        </Grid>
      </Section>

      {/* Portfolio & Signals */}
      <Section>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Portfolio Allocation */}
          <SectionCard title="Portfolio Allocation">
            <div className="space-y-3">
              {data.portfolioAllocation.map((item) => (
                <div key={item.asset} className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-sm"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="font-mono text-xs text-zinc-400 flex-1">{item.asset}</span>
                  <span className="font-mono text-sm text-white">{item.percentage}%</span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-zinc-800">
              <p className="font-mono text-[10px] text-zinc-500 mb-2">Top Holdings</p>
              {data.topHoldings.map((holding) => (
                <div key={holding.symbol} className="flex items-center justify-between py-1">
                  <span className="font-mono text-xs text-white">{holding.symbol}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-zinc-500">{holding.percentage}%</span>
                    <span className={`font-mono text-[10px] ${getChangeColor(holding.todayChange)}`}>
                      {holding.todayChange > 0 ? "+" : ""}{holding.todayChange}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Market Signals */}
          <div className="lg:col-span-2">
            <SectionCard
              title="Market Signals"
              action={
                <Badge variant="info">{data.metrics.signalsActive} activas</Badge>
              }
            >
              <div className="space-y-3">
                {data.marketSignals.map((signal) => {
                  const style = getConvictionStyle(signal.conviction);
                  return (
                    <div
                      key={signal.id}
                      className={`p-3 rounded-sm border ${style.border} ${style.bg}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-bold text-white">{signal.symbol}</span>
                          <Badge variant={style.badge} className="text-[9px]">
                            {signal.conviction.toUpperCase()}
                          </Badge>
                        </div>
                        {signal.action && (
                          <Badge variant="warning" className="text-[9px]">{signal.action}</Badge>
                        )}
                      </div>
                      <p className="font-mono text-xs text-zinc-300 mb-2">{signal.title}</p>
                      {signal.upside > 0 ? (
                        <div className="flex items-center justify-between text-[10px] font-mono">
                          <span className="text-zinc-500">Target: ${signal.target} | Current: ${signal.current}</span>
                          <span className="text-[#39ff14]">+{signal.upside}% upside</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between text-[10px] font-mono">
                          <span className="text-zinc-500">Current: ${signal.current}</span>
                          <span className="text-[#ff006e]">{signal.upside}% downside risk</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </SectionCard>
          </div>
        </div>
      </Section>

      {/* Sectors, News & Sentiment */}
      <Section>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sector Performance */}
          <SectionCard title="Sector Performance">
            <div className="space-y-2">
              {data.sectorPerformance.map((sector) => (
                <div
                  key={sector.sector}
                  className="flex items-center justify-between p-2 bg-zinc-900 rounded-sm"
                >
                  <span className="font-mono text-xs text-zinc-400">{sector.sector}</span>
                  <span className={`font-mono text-sm font-bold ${getChangeColor(sector.change)}`}>
                    {sector.change > 0 ? "+" : ""}{sector.change}%
                  </span>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* News */}
          <SectionCard title="Financial News">
            <div className="space-y-2">
              {data.news.map((item) => (
                <div
                  key={item.id}
                  className="p-2 bg-zinc-900 rounded-sm"
                >
                  <p className="font-mono text-xs text-white">{item.title}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className={`font-mono text-[10px] ${getImpactColor(item.impact)}`}>
                      {item.impact === "positive" ? "▲" : item.impact === "negative" ? "▼" : "●"} {item.impact}
                    </span>
                    <span className="font-mono text-[10px] text-zinc-500">{item.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Market Sentiment */}
          <SectionCard title="Market Sentiment">
            <div className="text-center p-4">
              <p className={`font-mono text-4xl ${sentimentStyle.color}`}>{sentimentStyle.icon}</p>
              <p className={`font-mono text-xl font-bold ${sentimentStyle.color} capitalize mt-2`}>
                {data.marketSentiment}
              </p>
            </div>
            <div className="space-y-3 pt-4 border-t border-zinc-800">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-zinc-500">VIX (Fear Index)</span>
                <span className={`font-mono text-sm ${data.vix < 20 ? "text-[#39ff14]" : data.vix < 30 ? "text-[#ffaa00]" : "text-[#ff006e]"}`}>
                  {data.vix}
                </span>
              </div>
              <ProgressBar
                label=""
                value={data.vix}
                max={50}
                color={data.vix < 20 ? "#39ff14" : data.vix < 30 ? "#ffaa00" : "#ff006e"}
                showValue={false}
              />
              <p className="font-mono text-[10px] text-zinc-500 text-center">
                {data.vix < 20 ? "Low volatility - Calm markets" :
                 data.vix < 30 ? "Moderate volatility" :
                 "High volatility - Fear in markets"}
              </p>
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
