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
import { gambitoData } from "@/lib/api/mock/pascual-agents";

export default function GambitoDashboard() {
  const [data] = useState(gambitoData);
  const { sendToAgent } = useGrowl();

  // Usar el hook reutilizable para configuración del agente
  const {
    showConfigModal,
    agentData,
    handleAgentModelChange,
    handleSubAgentModelChange,
    openConfig,
    closeConfig,
  } = useAgentConfig("gambito");

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
      case "high": return <Badge variant="success" className="text-[9px]">ALTA</Badge>;
      case "medium": return <Badge variant="info" className="text-[9px]">MEDIA</Badge>;
      case "low": return <Badge variant="default" className="text-[9px]">BAJA</Badge>;
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
    <div className="space-y-4">
      <AgentHeader
        name={data.name}
        icon={data.icon}
        lema={data.lema}
        status={data.status}
        showTimeRange={true}
        usage={{
          data: [35, 42, 38, 55, 62, 58, 70, 78, 72, 85],
          dataByRange: {
            "24h": [35, 42, 38, 55, 62, 58, 70, 78, 72, 85],
            "7d": [240, 310, 280, 360, 420, 380, 450],
            "1m": [980, 1150, 1280, 1420, 1580, 1720, 1650, 1850, 1980, 2120, 2280, 2450],
            "1y": [10500, 12800, 15200, 18500, 22000, 26500, 31000, 35500, 40000, 45000, 50500, 56000],
          },
          color: "#39ff14",
        }}
        kpis={[
          {
            label: "ROI",
            value: `${data.metrics.roi > 0 ? "+" : ""}${data.metrics.roi}%`,
            values: { "24h": `${data.metrics.roi > 0 ? "+" : ""}${data.metrics.roi}%`, "7d": "+9.5%", "1m": "+7.2%", "1y": "+12.8%" },
            status: data.metrics.roi > 5 ? "good" : data.metrics.roi > 0 ? "neutral" : "critical",
            statuses: { "24h": "good", "7d": "good", "1m": "good", "1y": "good" },
          },
          {
            label: "Win Rate",
            value: `${data.metrics.winRate}%`,
            values: { "24h": `${data.metrics.winRate}%`, "7d": "58%", "1m": "56%", "1y": "54%" },
            status: data.metrics.winRate > 55 ? "good" : "warning",
            statuses: { "24h": "good", "7d": "good", "1m": "good", "1y": "warning" },
          },
          {
            label: "Precisión",
            value: `${data.metrics.modelAccuracy}%`,
            values: { "24h": `${data.metrics.modelAccuracy}%`, "7d": "73%", "1m": "71%", "1y": "69%" },
            status: data.metrics.modelAccuracy > 70 ? "good" : "warning",
            statuses: { "24h": "good", "7d": "good", "1m": "good", "1y": "warning" },
          },
          {
            label: "Sharpe",
            value: data.metrics.sharpeRatio.toFixed(2),
            values: { "24h": data.metrics.sharpeRatio.toFixed(2), "7d": "1.35", "1m": "1.22", "1y": "1.48" },
            status: data.metrics.sharpeRatio > 1 ? "good" : "warning",
            statuses: { "24h": "good", "7d": "good", "1m": "good", "1y": "good" },
          },
          {
            label: "Drawdown",
            value: `${data.metrics.maxDrawdown}%`,
            values: { "24h": `${data.metrics.maxDrawdown}%`, "7d": "-6.5%", "1m": "-9.2%", "1y": "-12.5%" },
            status: data.metrics.maxDrawdown > -10 ? "good" : "critical",
            statuses: { "24h": "good", "7d": "good", "1m": "good", "1y": "warning" },
          },
        ]}
      />

      {/* Sub-Agents Status Grid */}
      <SubAgentStatusGrid
        subAgents={data.subAgents}
        onSettings={openConfig}
      />

      {/* Canvas + Predictions + Bankroll - Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Canvas - Lienzo de respuestas de Pascual */}
        <Canvas
          title="Canvas"
          placeholder="¿Qué partido o mercado quieres analizar?"
          onSendMessage={(msg) => sendToAgent("gambito", "Gambito", "⚽", msg)}
          minHeight="180px"
          quickPrompts={[
            { label: "Partidos hoy", prompt: "Muéstrame las predicciones para hoy" },
            { label: "Alta convicción", prompt: "¿Cuáles son las apuestas de alta convicción?" },
            { label: "Rendimiento", prompt: "Dame un resumen de mi rendimiento este mes" },
          ]}
        />

        {/* Active Predictions */}
        <div className="md:col-span-2">
          <SectionCard
            title="Predicciones Activas"
            action={
              <Badge variant="info">{data.metrics.highConfidenceCount} alta convicción</Badge>
            }
            maxHeight="320px"
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
      </div>

      {/* Bankroll + Market Performance + Model Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Bankroll */}
        <SectionCard title="Bankroll" maxHeight="320px">
          <div className="space-y-4">
            <div className="text-center p-4 bg-zinc-900 rounded-sm">
              <p className="font-mono text-[10px] text-zinc-500 mb-1">ACTUAL</p>
              <p className={`font-mono text-3xl font-bold ${data.bankroll.pnl >= 0 ? "text-[#39ff14]" : "text-[#ff006e]"}`}>
                ${data.bankroll.current.toLocaleString()}
              </p>
              <p className={`font-mono text-sm ${data.bankroll.pnl >= 0 ? "text-[#39ff14]" : "text-[#ff006e]"}`}>
                {data.bankroll.pnl >= 0 ? "+" : ""}{data.bankroll.pnlPercent}%
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2 bg-zinc-900 rounded-sm text-center">
                <p className="font-mono text-[10px] text-zinc-500">Inicial</p>
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
                <span className="font-mono text-[10px] text-zinc-500">Stake Promedio</span>
                <span className="font-mono text-xs text-white">{data.bankroll.avgStake}%</span>
              </div>
              <div className="flex justify-between">
                <span className="font-mono text-[10px] text-zinc-500">Fracción Kelly</span>
                <span className="font-mono text-xs text-white">{data.bankroll.kellyFraction}%</span>
              </div>
            </div>
          </div>
        </SectionCard>

        {/* Market Performance */}
        <SectionCard title="Rendimiento por Mercado" maxHeight="320px">
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
        <SectionCard title="Rendimiento de Modelos" maxHeight="320px">
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
