"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import {
  AgentHeader,
  SubAgentStatusGrid,
  Canvas,
  SectionCard,
  ProgressBar,
  AgentConfigModal,
  useAgentConfig,
} from "@/components/agents";
import { useGrowl } from "@/components/growl";
import { condor360Data } from "@/lib/api/mock/pascual-agents";

export default function Condor360Dashboard() {
  const [data] = useState(condor360Data);
  const { sendToAgent } = useGrowl();

  // Usar el hook reutilizable para configuración del agente
  const {
    showConfigModal,
    agentData,
    handleAgentModelChange,
    handleSubAgentModelChange,
    openConfig,
    closeConfig,
  } = useAgentConfig("condor360");

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
    <div className="space-y-4">
      <AgentHeader
        name={data.name}
        icon={data.icon}
        lema={data.lema}
        status={data.status}
        showTimeRange={true}
        usage={{
          data: [40, 48, 52, 58, 65, 72, 68, 75, 82, 88],
          dataByRange: {
            "24h": [40, 48, 52, 58, 65, 72, 68, 75, 82, 88],
            "7d": [280, 350, 320, 410, 480, 520, 490],
            "1m": [1100, 1350, 1480, 1620, 1780, 1920, 1850, 2050, 2180, 2350, 2480, 2650],
            "1y": [11500, 14200, 17500, 21000, 25500, 30000, 35500, 41000, 47000, 53500, 60000, 67500],
          },
          color: "#00d9ff",
        }}
        kpis={[
          {
            label: "Retorno",
            value: `${data.metrics.portfolioReturn > 0 ? "+" : ""}${data.metrics.portfolioReturn}%`,
            values: { "24h": `${data.metrics.portfolioReturn > 0 ? "+" : ""}${data.metrics.portfolioReturn}%`, "7d": "+11.2%", "1m": "+8.5%", "1y": "+18.5%" },
            status: data.metrics.portfolioReturn > 10 ? "good" : data.metrics.portfolioReturn > 0 ? "neutral" : "critical",
            statuses: { "24h": "good", "7d": "good", "1m": "good", "1y": "good" },
          },
          {
            label: "Sharpe",
            value: data.metrics.sharpeRatio.toFixed(2),
            values: { "24h": data.metrics.sharpeRatio.toFixed(2), "7d": "1.72", "1m": "1.58", "1y": "1.85" },
            status: data.metrics.sharpeRatio > 1.5 ? "good" : "warning",
            statuses: { "24h": "good", "7d": "good", "1m": "good", "1y": "good" },
          },
          {
            label: "Alpha",
            value: `${data.metrics.alpha > 0 ? "+" : ""}${data.metrics.alpha}%`,
            values: { "24h": `${data.metrics.alpha > 0 ? "+" : ""}${data.metrics.alpha}%`, "7d": "+3.8%", "1m": "+2.5%", "1y": "+5.2%" },
            status: data.metrics.alpha > 2 ? "good" : "neutral",
            statuses: { "24h": "good", "7d": "good", "1m": "good", "1y": "good" },
          },
          {
            label: "Drawdown",
            value: `${data.metrics.maxDrawdown}%`,
            values: { "24h": `${data.metrics.maxDrawdown}%`, "7d": "-5.8%", "1m": "-8.2%", "1y": "-11.5%" },
            status: data.metrics.maxDrawdown > -10 ? "good" : "critical",
            statuses: { "24h": "good", "7d": "good", "1m": "good", "1y": "warning" },
          },
          {
            label: "Precisión",
            value: `${data.metrics.predictionAccuracy}%`,
            values: { "24h": `${data.metrics.predictionAccuracy}%`, "7d": "72%", "1m": "68%", "1y": "66%" },
            status: data.metrics.predictionAccuracy > 65 ? "good" : "warning",
            statuses: { "24h": "good", "7d": "good", "1m": "good", "1y": "good" },
          },
        ]}
      />

      {/* Sub-Agents Status Grid */}
      <SubAgentStatusGrid
        subAgents={data.subAgents}
        onSettings={openConfig}
      />

      {/* Canvas + Portfolio + Signals - Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Canvas - Lienzo de respuestas de Pascual */}
        <Canvas
          title="Canvas"
          placeholder="¿Qué activo o mercado quieres analizar?"
          onSendMessage={(msg) => sendToAgent("condor360", "Cóndor360", "🦅", msg)}
          minHeight="180px"
          quickPrompts={[
            { label: "Portafolio", prompt: "Muéstrame el estado actual del portafolio" },
            { label: "Señales", prompt: "¿Cuáles son las señales de mercado más importantes?" },
            { label: "Análisis", prompt: "Analiza el sentimiento del mercado actual" },
          ]}
        />

        {/* Portfolio Allocation */}
        <SectionCard title="Asignación de Portafolio" maxHeight="320px">
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
        <SectionCard
          title="Señales de Mercado"
          action={
            <Badge variant="info">{data.metrics.signalsActive} activas</Badge>
          }
          maxHeight="320px"
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
                      <span className="text-zinc-500">Target: ${signal.target} | Actual: ${signal.current}</span>
                      <span className="text-[#39ff14]">+{signal.upside}% potencial</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className="text-zinc-500">Actual: ${signal.current}</span>
                      <span className="text-[#ff006e]">{signal.upside}% riesgo</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </SectionCard>
      </div>

      {/* Sectors, News & Sentiment */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Sector Performance */}
        <SectionCard title="Rendimiento por Sector" maxHeight="320px">
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
        <SectionCard title="Noticias Financieras" maxHeight="320px">
          <div className="space-y-2">
            {data.news.map((item) => (
              <div
                key={item.id}
                className="p-2 bg-zinc-900 rounded-sm"
              >
                <p className="font-mono text-xs text-white">{item.title}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className={`font-mono text-[10px] ${getImpactColor(item.impact)}`}>
                    {item.impact === "positive" ? "▲" : item.impact === "negative" ? "▼" : "●"} {item.impact === "positive" ? "positivo" : item.impact === "negative" ? "negativo" : "neutral"}
                  </span>
                  <span className="font-mono text-[10px] text-zinc-500">{item.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Market Sentiment */}
        <SectionCard title="Sentimiento del Mercado" maxHeight="320px">
          <div className="text-center p-4">
            <p className={`font-mono text-4xl ${sentimentStyle.color}`}>{sentimentStyle.icon}</p>
            <p className={`font-mono text-xl font-bold ${sentimentStyle.color} capitalize mt-2`}>
              {data.marketSentiment === "bullish" ? "Alcista" : data.marketSentiment === "bearish" ? "Bajista" : "Neutral"}
            </p>
          </div>
          <div className="space-y-3 pt-4 border-t border-zinc-800">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-zinc-500">VIX (Índice de Miedo)</span>
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
              {data.vix < 20 ? "Baja volatilidad - Mercados tranquilos" :
               data.vix < 30 ? "Volatilidad moderada" :
               "Alta volatilidad - Miedo en mercados"}
            </p>
          </div>
        </SectionCard>
      </div>

      {/* Agent Configuration Modal */}
      {showConfigModal && (
        <AgentConfigModal
          agent={agentData}
          onClose={closeConfig}
          onAgentModelChange={handleAgentModelChange}
          onSubAgentModelChange={handleSubAgentModelChange}
        />
      )}
    </div>
  );
}
