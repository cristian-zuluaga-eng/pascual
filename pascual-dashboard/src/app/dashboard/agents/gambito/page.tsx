"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import {
  AgentHeader,
  Canvas,
  SectionCard,
  ProgressBar,
  AgentConfigModal,
  useAgentConfig,
} from "@/components/agents";
import { useGrowl } from "@/components/growl";
import { gambitoData } from "@/lib/api/mock/pascual-agents";
import { useDashboardConfig } from "@/lib/context/DashboardConfigContext";

export default function GambitoDashboard() {
  const [data] = useState(gambitoData);
  const { sendToAgent } = useGrowl();
  const { config } = useDashboardConfig();
  const [sportFilter, setSportFilter] = useState<string>("all");
  const [predictionSearch, setPredictionSearch] = useState("");
  const [balanceTab, setBalanceTab] = useState<"real" | "simulado">("real");

  // Datos simulados para el balance
  const simulatedBankroll = {
    initial: 10000,
    current: 12850,
    pnl: 2850,
    pnlPercent: 28.5,
    avgStake: 3.5,
    kellyFraction: 30,
  };

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

  const getPrecisionColor = (accuracy: number) => {
    if (accuracy >= 80) return "text-[#39ff14]";
    if (accuracy >= 70) return "text-[#00d9ff]";
    if (accuracy >= 60) return "text-[#ffaa00]";
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
        kpiVisibility={config.kpis.gambito}
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
            id: "roi",
            label: "ROI",
            value: `${data.metrics.roi > 0 ? "+" : ""}${data.metrics.roi}%`,
            values: { "24h": `${data.metrics.roi > 0 ? "+" : ""}${data.metrics.roi}%`, "7d": "+9.5%", "1m": "+7.2%", "1y": "+12.8%" },
            status: data.metrics.roi > 5 ? "good" : data.metrics.roi > 0 ? "neutral" : "critical",
            statuses: { "24h": "good", "7d": "good", "1m": "good", "1y": "good" },
          },
          {
            id: "winRate",
            label: "Win Rate",
            value: `${data.metrics.winRate}%`,
            values: { "24h": `${data.metrics.winRate}%`, "7d": "58%", "1m": "56%", "1y": "54%" },
            status: data.metrics.winRate > 55 ? "good" : "warning",
            statuses: { "24h": "good", "7d": "good", "1m": "good", "1y": "warning" },
          },
          {
            id: "precision",
            label: "Precisión",
            value: `${data.metrics.modelAccuracy}%`,
            values: { "24h": `${data.metrics.modelAccuracy}%`, "7d": "73%", "1m": "71%", "1y": "69%" },
            status: data.metrics.modelAccuracy > 70 ? "good" : "warning",
            statuses: { "24h": "good", "7d": "good", "1m": "good", "1y": "warning" },
          },
          {
            id: "sharpe",
            label: "Sharpe",
            value: data.metrics.sharpeRatio.toFixed(2),
            values: { "24h": data.metrics.sharpeRatio.toFixed(2), "7d": "1.35", "1m": "1.22", "1y": "1.48" },
            status: data.metrics.sharpeRatio > 1 ? "good" : "warning",
            statuses: { "24h": "good", "7d": "good", "1m": "good", "1y": "good" },
          },
          {
            id: "drawdown",
            label: "Drawdown",
            value: `${data.metrics.maxDrawdown}%`,
            values: { "24h": `${data.metrics.maxDrawdown}%`, "7d": "-6.5%", "1m": "-9.2%", "1y": "-12.5%" },
            status: data.metrics.maxDrawdown > -10 ? "good" : "critical",
            statuses: { "24h": "good", "7d": "good", "1m": "good", "1y": "warning" },
          },
        ]}
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
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Buscar predicción..."
                  value={predictionSearch}
                  onChange={(e) => setPredictionSearch(e.target.value)}
                  className="px-2 py-1 bg-zinc-800 border border-zinc-700 rounded-sm font-mono text-[10px] text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#00d9ff] w-32"
                />
                <select
                  value={sportFilter}
                  onChange={(e) => setSportFilter(e.target.value)}
                  className="px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-white text-xs font-mono"
                >
                  <option value="all">Todos</option>
                  <option value="⚽">⚽ Fútbol</option>
                  <option value="🎾">🎾 Tenis</option>
                  <option value="🏀">🏀 Basket</option>
                  <option value="⚾">⚾ Baseball</option>
                  <option value="🥊">🥊 MMA</option>
                </select>
              </div>
            }
            maxHeight="380px"
          >
            <div className="divide-y divide-zinc-800">
              {data.activePredictions
                .filter(pred =>
                  (sportFilter === "all" || pred.sportIcon === sportFilter) &&
                  (predictionSearch === "" ||
                    pred.match.toLowerCase().includes(predictionSearch.toLowerCase()) ||
                    pred.prediction.toLowerCase().includes(predictionSearch.toLowerCase()))
                )
                .map((pred) => (
                <div
                  key={pred.id}
                  className="py-2 px-2"
                >
                  <div className="flex items-center justify-between">
                    {/* Left: Teams */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-base">{pred.sportIcon}</span>
                      <Badge variant="default" className="text-xs">{pred.sport}</Badge>
                      <div className="flex gap-1 items-center">
                        <span className={`font-mono text-xs font-bold ${pred.predictedWinner === "1" ? "text-white" : "text-zinc-400"}`}>{pred.team1}</span>
                      </div>
                      <span className="font-mono text-xs text-zinc-500">vs</span>
                      <div className="flex gap-1 items-center">
                        <span className={`font-mono text-xs font-bold ${pred.predictedWinner === "2" ? "text-white" : "text-zinc-400"}`}>{pred.team2}</span>
                      </div>
                      <span className="font-mono text-xs px-2 py-0.5 bg-zinc-800 rounded text-zinc-300 ml-1">{pred.timestamp} {pred.matchTime}</span>
                    </div>

                    {/* Right: Prediction info */}
                    <div className="flex items-center gap-3 bg-zinc-900 px-2 py-1 rounded">
                      <div className="flex items-center gap-1">
                        <span className="font-mono text-xs text-[#00d9ff]">{pred.prediction}</span>
                        <span className="font-mono text-xs text-white">({pred.team1} {pred.possibleScore.split("-")[0]} - {pred.possibleScore.split("-")[1]} {pred.team2})</span>
                      </div>
                      <span className="text-zinc-600">|</span>
                      <div className="flex items-center gap-1">
                        <span className="font-mono text-xs text-zinc-400">Mercado:</span>
                        {pred.sport === "Fútbol" ? (
                          <span className="font-mono text-xs text-zinc-300">
                            {pred.marketDistribution.team1Pct}%-{pred.marketDistribution.drawPct}%-{pred.marketDistribution.team2Pct}%
                          </span>
                        ) : (
                          <span className="font-mono text-xs text-zinc-300">
                            {pred.marketDistribution.team1Pct}%-{pred.marketDistribution.team2Pct}%
                          </span>
                        )}
                      </div>
                      <span className="text-zinc-600">|</span>
                      <div className="flex items-center gap-1">
                        <div className={`h-2 w-2 rounded-full ${
                          pred.modelConfidence >= 75 ? "bg-[#39ff14]" :
                          pred.modelConfidence >= 60 ? "bg-[#ffaa00]" :
                          "bg-[#ff006e]"}`}
                        />
                        <span className="font-mono text-sm font-bold text-white">{pred.modelConfidence}%</span>
                      </div>
                      <span className="text-zinc-600">|</span>
                      {/* Value Bet Indicator */}
                      <div className={`flex items-center gap-1 px-2 py-0.5 rounded ${
                        pred.valueBet.recommendation === "strong" ? "bg-[#39ff14]/20" :
                        pred.valueBet.recommendation === "moderate" ? "bg-[#00d9ff]/20" :
                        pred.valueBet.recommendation === "low" ? "bg-[#ffaa00]/20" :
                        "bg-zinc-800"
                      }`}>
                        <span className="font-mono text-[10px] text-zinc-400">Edge:</span>
                        <span className={`font-mono text-sm font-bold ${
                          pred.valueBet.edge >= 25 ? "text-[#39ff14]" :
                          pred.valueBet.edge >= 15 ? "text-[#00d9ff]" :
                          pred.valueBet.edge >= 5 ? "text-[#ffaa00]" :
                          "text-zinc-400"
                        }`}>+{pred.valueBet.edge}%</span>
                        {pred.valueBet.recommendation === "strong" && (
                          <span className="text-[#39ff14] text-xs ml-1">🔥</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {data.activePredictions
                .filter(pred =>
                  (sportFilter === "all" || pred.sportIcon === sportFilter) &&
                  (predictionSearch === "" ||
                    pred.match.toLowerCase().includes(predictionSearch.toLowerCase()) ||
                    pred.prediction.toLowerCase().includes(predictionSearch.toLowerCase()))
                )
                .length === 0 && (
                <p className="font-mono text-[10px] text-zinc-500 text-center py-4">
                  No hay predicciones que coincidan con los criterios de búsqueda
                </p>
              )}
            </div>
          </SectionCard>
        </div>
      </div>

      {/* Bankroll + Market Performance + Model Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Bankroll */}
        <SectionCard title="Balance" visible={config.grids.gambito.bankroll} maxHeight="320px">
          <div className="space-y-4">
            {/* Tabs */}
            <div className="flex border-b border-zinc-800">
              <button
                onClick={() => setBalanceTab("real")}
                className={`flex-1 py-2 font-mono text-xs transition-colors ${
                  balanceTab === "real"
                    ? "text-[#39ff14] border-b-2 border-[#39ff14]"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                Real
              </button>
              <button
                onClick={() => setBalanceTab("simulado")}
                className={`flex-1 py-2 font-mono text-xs transition-colors ${
                  balanceTab === "simulado"
                    ? "text-[#00d9ff] border-b-2 border-[#00d9ff]"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                Simulado
              </button>
            </div>

            {/* Balance Content */}
            {balanceTab === "real" ? (
              <>
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
              </>
            ) : (
              <>
                <div className="text-center p-4 bg-zinc-900 rounded-sm">
                  <p className="font-mono text-[10px] text-zinc-500 mb-1">SIMULADO</p>
                  <p className={`font-mono text-3xl font-bold ${simulatedBankroll.pnl >= 0 ? "text-[#00d9ff]" : "text-[#ff006e]"}`}>
                    ${simulatedBankroll.current.toLocaleString()}
                  </p>
                  <p className={`font-mono text-sm ${simulatedBankroll.pnl >= 0 ? "text-[#00d9ff]" : "text-[#ff006e]"}`}>
                    {simulatedBankroll.pnl >= 0 ? "+" : ""}{simulatedBankroll.pnlPercent}%
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 bg-zinc-900 rounded-sm text-center">
                    <p className="font-mono text-[10px] text-zinc-500">Inicial</p>
                    <p className="font-mono text-sm text-white">${simulatedBankroll.initial.toLocaleString()}</p>
                  </div>
                  <div className="p-2 bg-zinc-900 rounded-sm text-center">
                    <p className="font-mono text-[10px] text-zinc-500">P&L</p>
                    <p className={`font-mono text-sm ${simulatedBankroll.pnl >= 0 ? "text-[#00d9ff]" : "text-[#ff006e]"}`}>
                      {simulatedBankroll.pnl >= 0 ? "+" : ""}${simulatedBankroll.pnl}
                    </p>
                  </div>
                </div>
                <div className="pt-3 border-t border-zinc-800">
                  <div className="flex justify-between mb-1">
                    <span className="font-mono text-[10px] text-zinc-500">Stake Promedio</span>
                    <span className="font-mono text-xs text-white">{simulatedBankroll.avgStake}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-mono text-[10px] text-zinc-500">Fracción Kelly</span>
                    <span className="font-mono text-xs text-white">{simulatedBankroll.kellyFraction}%</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </SectionCard>

        {/* Sport Precision */}
        <SectionCard title="Precisión por Deporte" visible={config.grids.gambito.precisionDeporte} maxHeight="320px">
          <div className="space-y-2">
            {data.sportConfidence.map((sport) => (
              <div
                key={sport.sport}
                className="p-2 bg-zinc-900 rounded-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span>{sport.icon}</span>
                    <span className="font-mono text-xs text-white">{sport.sport}</span>
                    <span className="font-mono text-[10px] text-[#00d9ff]">({sport.bestModel})</span>
                  </div>
                  <span className={`font-mono text-sm font-bold ${getPrecisionColor(sport.accuracy)}`}>
                    {sport.accuracy}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Model Stats */}
        <SectionCard title="Rendimiento de Modelos" visible={config.grids.gambito.rendimientoModelos} maxHeight="320px">
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
