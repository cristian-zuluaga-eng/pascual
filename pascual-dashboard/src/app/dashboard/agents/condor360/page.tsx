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
import { condor360Data } from "@/lib/api/mock/pascual-agents";
import { useDashboardConfig } from "@/lib/context/DashboardConfigContext";

type TrendFilter = "all" | "high" | "medium" | "low";
type ConvictionFilter = "all" | "high" | "medium" | "low";

export default function Condor360Dashboard() {
  const [data] = useState(condor360Data);
  const { sendToAgent } = useGrowl();
  const { config } = useDashboardConfig();
  const [trendFilter, setTrendFilter] = useState<TrendFilter>("all");
  const [trendSearch, setTrendSearch] = useState("");
  const [confidenceSearch, setConfidenceSearch] = useState("");
  const [balanceTab, setBalanceTab] = useState<"real" | "simulado">("real");

  // Datos de balance real
  const realBalance = {
    initial: 50000,
    current: 56250,
    pnl: 6250,
    pnlPercent: 12.5,
    avgAllocation: 15,
    riskLevel: "Moderado",
  };

  // Datos de balance simulado
  const simulatedBalance = {
    initial: 50000,
    current: 68500,
    pnl: 18500,
    pnlPercent: 37.0,
    avgAllocation: 25,
    riskLevel: "Agresivo",
  };

  // Usar el hook reutilizable para configuración del agente
  const {
    showConfigModal,
    agentData,
    handleAgentModelChange,
    handleSubAgentModelChange,
    openConfig,
    closeConfig,
  } = useAgentConfig("condor360");

  // Filtrar señales de mercado
  const filteredSignals = data.marketSignals.filter((signal) => {
    const matchesFilter = trendFilter === "all" || signal.conviction === trendFilter;
    const matchesSearch = trendSearch === "" ||
      signal.symbol.toLowerCase().includes(trendSearch.toLowerCase()) ||
      signal.reason.toLowerCase().includes(trendSearch.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getConvictionStyle = (conviction: string) => {
    switch (conviction) {
      case "high": return { border: "border-transparent", bg: "bg-[#39ff14]/10", badge: "success" as const };
      case "medium": return { border: "border-transparent", bg: "bg-zinc-800", badge: "info" as const };
      case "low": return { border: "border-transparent", bg: "bg-[#ff006e]/10", badge: "danger" as const };
      default: return { border: "border-transparent", bg: "bg-zinc-800", badge: "default" as const };
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


  return (
    <div className="space-y-4">
      <AgentHeader
        name={data.name}
        icon={data.icon}
        lema={data.lema}
        status={data.status}
        showTimeRange={true}
        kpiVisibility={config.kpis.condor360}
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
            id: "retorno",
            label: "Retorno",
            value: `${data.metrics.portfolioReturn > 0 ? "+" : ""}${data.metrics.portfolioReturn}%`,
            values: { "24h": `${data.metrics.portfolioReturn > 0 ? "+" : ""}${data.metrics.portfolioReturn}%`, "7d": "+11.2%", "1m": "+8.5%", "1y": "+18.5%" },
            status: data.metrics.portfolioReturn > 10 ? "good" : data.metrics.portfolioReturn > 0 ? "neutral" : "critical",
            statuses: { "24h": "good", "7d": "good", "1m": "good", "1y": "good" },
          },
          {
            id: "precision",
            label: "Precisión",
            value: `${data.metrics.predictionAccuracy}%`,
            values: { "24h": `${data.metrics.predictionAccuracy}%`, "7d": "72%", "1m": "68%", "1y": "66%" },
            status: data.metrics.predictionAccuracy > 65 ? "good" : "warning",
            statuses: { "24h": "good", "7d": "good", "1m": "good", "1y": "good" },
          },
        ]}
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
        <SectionCard title="Asignación de Portafolio" visible={config.grids.condor360.asignacionPortafolio} maxHeight="320px">
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

        {/* Portfolio Trends */}
        <SectionCard
          title="Tendencia de Portafolio"
          action={
            <Badge variant="info">{filteredSignals.length} activas</Badge>
          }
          maxHeight="380px"
        >
          {/* Filters */}
          <div className="flex items-center gap-2 mb-3">
            <input
              type="text"
              placeholder="Buscar..."
              value={trendSearch}
              onChange={(e) => setTrendSearch(e.target.value)}
              className="flex-1 px-2 py-1 bg-zinc-800 border border-zinc-700 rounded-sm font-mono text-[10px] text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#00d9ff]"
            />
            <div className="flex items-center gap-1">
              {(["all", "high", "medium", "low"] as TrendFilter[]).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setTrendFilter(filter)}
                  className={`px-2 py-1 font-mono text-[9px] rounded-sm transition-colors ${
                    trendFilter === filter
                      ? "bg-[#00d9ff]/20 text-[#00d9ff] border border-[#00d9ff]/30"
                      : "bg-zinc-800 text-zinc-500 border border-zinc-700 hover:text-zinc-300"
                  }`}
                >
                  {filter === "all" ? "todos" : filter === "high" ? "alza" : filter === "medium" ? "neutro" : "baja"}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            {filteredSignals.map((signal) => {
              const style = getConvictionStyle(signal.conviction);
              return (
                <div
                  key={signal.id}
                  className={`p-2 rounded-sm border ${style.border} ${style.bg}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-white">{signal.symbol}</span>
                      {signal.conviction === "high" && (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-[#39ff14]">
                          <path d="M5 19L19 5M19 5H8M19 5V16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                      {signal.conviction === "low" && (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-[#ff006e]">
                          <path d="M5 5L19 19M19 19H8M19 19V8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <span className={`font-mono text-xs font-bold ${signal.upside > 0 ? "text-[#39ff14]" : "text-[#ff006e]"}`}>
                          {signal.upside > 0 ? "+" : ""}{signal.upside}%
                        </span>
                        <span className="font-mono text-[9px] text-zinc-500">impacto</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="font-mono text-xs font-bold text-[#00d9ff]">
                          {signal.confidence}%
                        </span>
                        <span className="font-mono text-[9px] text-zinc-500">confianza</span>
                      </div>
                    </div>
                  </div>
                  <p className="font-mono text-[10px] text-zinc-400 mt-1">{signal.reason}</p>
                </div>
              );
            })}
            {filteredSignals.length === 0 && (
              <p className="font-mono text-[10px] text-zinc-500 text-center py-4">Sin resultados</p>
            )}
          </div>
        </SectionCard>
      </div>

      {/* Balance, Oportunidades, Confianza, Noticias */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Balance */}
        <SectionCard title="Balance" visible={config.grids.condor360.balance} maxHeight="320px">
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
                  <p className={`font-mono text-3xl font-bold ${realBalance.pnl >= 0 ? "text-[#39ff14]" : "text-[#ff006e]"}`}>
                    ${realBalance.current.toLocaleString()}
                  </p>
                  <p className={`font-mono text-sm ${realBalance.pnl >= 0 ? "text-[#39ff14]" : "text-[#ff006e]"}`}>
                    {realBalance.pnl >= 0 ? "+" : ""}{realBalance.pnlPercent}%
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 bg-zinc-900 rounded-sm text-center">
                    <p className="font-mono text-[10px] text-zinc-500">Inicial</p>
                    <p className="font-mono text-sm text-white">${realBalance.initial.toLocaleString()}</p>
                  </div>
                  <div className="p-2 bg-zinc-900 rounded-sm text-center">
                    <p className="font-mono text-[10px] text-zinc-500">P&L</p>
                    <p className={`font-mono text-sm ${realBalance.pnl >= 0 ? "text-[#39ff14]" : "text-[#ff006e]"}`}>
                      {realBalance.pnl >= 0 ? "+" : ""}${realBalance.pnl.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="pt-3 border-t border-zinc-800">
                  <div className="flex justify-between mb-1">
                    <span className="font-mono text-[10px] text-zinc-500">Asignación Prom.</span>
                    <span className="font-mono text-xs text-white">{realBalance.avgAllocation}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-mono text-[10px] text-zinc-500">Nivel de Riesgo</span>
                    <span className="font-mono text-xs text-white">{realBalance.riskLevel}</span>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="text-center p-4 bg-zinc-900 rounded-sm">
                  <p className="font-mono text-[10px] text-zinc-500 mb-1">SIMULADO</p>
                  <p className={`font-mono text-3xl font-bold ${simulatedBalance.pnl >= 0 ? "text-[#00d9ff]" : "text-[#ff006e]"}`}>
                    ${simulatedBalance.current.toLocaleString()}
                  </p>
                  <p className={`font-mono text-sm ${simulatedBalance.pnl >= 0 ? "text-[#00d9ff]" : "text-[#ff006e]"}`}>
                    {simulatedBalance.pnl >= 0 ? "+" : ""}{simulatedBalance.pnlPercent}%
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 bg-zinc-900 rounded-sm text-center">
                    <p className="font-mono text-[10px] text-zinc-500">Inicial</p>
                    <p className="font-mono text-sm text-white">${simulatedBalance.initial.toLocaleString()}</p>
                  </div>
                  <div className="p-2 bg-zinc-900 rounded-sm text-center">
                    <p className="font-mono text-[10px] text-zinc-500">P&L</p>
                    <p className={`font-mono text-sm ${simulatedBalance.pnl >= 0 ? "text-[#00d9ff]" : "text-[#ff006e]"}`}>
                      {simulatedBalance.pnl >= 0 ? "+" : ""}${simulatedBalance.pnl.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="pt-3 border-t border-zinc-800">
                  <div className="flex justify-between mb-1">
                    <span className="font-mono text-[10px] text-zinc-500">Asignación Prom.</span>
                    <span className="font-mono text-xs text-white">{simulatedBalance.avgAllocation}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-mono text-[10px] text-zinc-500">Nivel de Riesgo</span>
                    <span className="font-mono text-xs text-white">{simulatedBalance.riskLevel}</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </SectionCard>

        {/* Oportunidades */}
        <SectionCard title="Oportunidades" visible={config.grids.condor360.oportunidades} maxHeight="320px">
          <div className="space-y-2">
            {data.recommendations.map((rec) => (
              <div
                key={rec.id}
                className="p-2 bg-zinc-900 rounded-sm"
              >
                <div className="flex items-center gap-2 mb-1">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-[#00d9ff]">
                    <path d="M8 17l-5 5M16 7l5-5M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12zM12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="font-mono text-xs font-bold text-white">{rec.asset}</span>
                  <div className="flex items-center gap-1 ml-auto">
                    <span className="font-mono text-xs font-bold text-[#00d9ff]">{rec.confidence}%</span>
                    <span className="font-mono text-[9px] text-zinc-500">confianza</span>
                  </div>
                </div>
                <p className="font-mono text-[10px] text-zinc-400">{rec.reason}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Model Confidence */}
        <SectionCard title="Confianza del Modelo" visible={config.grids.condor360.confianzaModelo} maxHeight="320px">
          {/* Search Filter */}
          <div className="mb-3">
            <input
              type="text"
              placeholder="Buscar sector..."
              value={confidenceSearch}
              onChange={(e) => setConfidenceSearch(e.target.value)}
              className="w-full px-2 py-1 bg-zinc-800 border border-zinc-700 rounded-sm font-mono text-[10px] text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#00d9ff]"
            />
          </div>
          <div className="space-y-2">
            {data.modelConfidence
              .filter((item) =>
                confidenceSearch === "" ||
                item.sector.toLowerCase().includes(confidenceSearch.toLowerCase())
              )
              .map((item) => {
                const getConfidenceColor = (confidence: number) => {
                  if (confidence > 85) return "text-[#39ff14]"; // Alta
                  if (confidence >= 65) return "text-[#ffaa00]"; // Media
                  return "text-[#ff006e]"; // Baja
                };
                const getConfidenceLabel = (conviction: string) => {
                  switch (conviction) {
                    case "high": return { text: "Alta", color: "text-[#39ff14]", bg: "bg-[#39ff14]/10" };
                    case "medium": return { text: "Media", color: "text-[#ffaa00]", bg: "bg-[#ffaa00]/10" };
                    case "low": return { text: "Baja", color: "text-[#ff006e]", bg: "bg-[#ff006e]/10" };
                    default: return { text: "N/A", color: "text-zinc-400", bg: "bg-zinc-800" };
                  }
                };
                const label = getConfidenceLabel(item.conviction);
                return (
                  <div
                    key={item.sector}
                    className="flex items-center justify-between p-2 bg-zinc-900 rounded-sm"
                  >
                    <span className="font-mono text-xs text-zinc-400 flex-1">{item.sector}</span>
                    <div className="flex items-center gap-2">
                      <span className={`font-mono text-sm font-bold ${getConfidenceColor(item.confidence)}`}>
                        {item.confidence}%
                      </span>
                      <span className={`font-mono text-[9px] px-1.5 py-0.5 rounded ${label.bg} ${label.color}`}>
                        {label.text}
                      </span>
                    </div>
                  </div>
                );
              })}
            {data.modelConfidence.filter((item) =>
              confidenceSearch === "" ||
              item.sector.toLowerCase().includes(confidenceSearch.toLowerCase())
            ).length === 0 && (
              <p className="font-mono text-[10px] text-zinc-500 text-center py-4">Sin resultados</p>
            )}
          </div>
        </SectionCard>

        {/* News */}
        <SectionCard title="Noticias Financieras" visible={config.grids.condor360.noticiasFinancieras} maxHeight="320px">
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
