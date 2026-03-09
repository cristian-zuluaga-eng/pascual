"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import {
  AgentHeader,
  SubAgentStatusGrid,
  Canvas,
  SectionCard,
  ProgressBar,
  FilterTabs,
  ExpandableListItem,
  AgentConfigModal,
  useAgentConfig,
} from "@/components/agents";
import { HeatMap } from "@/components/charts/HeatMap";
import { useGrowl } from "@/components/growl";
import { sentinelData } from "@/lib/api/mock/pascual-agents";
import { useDashboardConfig } from "@/lib/context/DashboardConfigContext";

export default function SentinelDashboard() {
  const [data] = useState(sentinelData);
  const [threatSearch, setThreatSearch] = useState("");
  const [improvementSearch, setImprovementSearch] = useState("");
  const { sendToAgent } = useGrowl();
  const { config } = useDashboardConfig();

  // Usar el hook reutilizable para configuración del agente
  const {
    showConfigModal,
    agentData,
    handleAgentModelChange,
    handleSubAgentModelChange,
    openConfig,
    closeConfig,
  } = useAgentConfig("sentinel");

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-[#ff006e]";
      case "warning": return "bg-amber-500";
      case "info": return "bg-[#00d9ff]";
      default: return "bg-zinc-600";
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "high": return "bg-[#39ff14]";
      case "medium": return "bg-[#00d9ff]";
      case "low": return "bg-zinc-500";
      default: return "bg-zinc-600";
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "security": return "Seguridad";
      case "performance": return "Rendimiento";
      case "resilience": return "Resiliencia";
      case "compliance": return "Cumplimiento";
      case "optimization": return "Optimización";
      default: return category;
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

  return (
    <div className="space-y-4">
      <AgentHeader
        name={data.name}
        icon={data.icon}
        lema={data.lema}
        status={data.status}
        showTimeRange={true}
        kpiVisibility={config.kpis.sentinel}
        usage={{
          data: [30, 35, 42, 38, 45, 52, 48, 55, 50, 47],
          dataByRange: {
            "24h": [30, 35, 42, 38, 45, 52, 48, 55, 50, 47],
            "7d": [210, 280, 265, 310, 350, 380, 340],
            "1m": [950, 1120, 1080, 1250, 1380, 1200, 1320, 1450, 1400, 1520, 1580, 1480],
            "1y": [9500, 11200, 10800, 12500, 14200, 15800, 16500, 17200, 18100, 19500, 20800, 22100],
          },
          color: "#ff006e",
        }}
        kpis={[
          {
            id: "seguridad",
            label: "Seguridad",
            value: `${data.metrics.securityScore}%`,
            values: { "24h": `${data.metrics.securityScore}%`, "7d": "92%", "1m": "90%", "1y": "88%" },
            status: data.metrics.securityScore >= 90 ? "good" : "warning",
            statuses: { "24h": "good", "7d": "good", "1m": "good", "1y": "warning" },
          },
          {
            id: "uptime",
            label: "Uptime",
            value: `${data.metrics.uptime}%`,
            values: { "24h": `${data.metrics.uptime}%`, "7d": "99.8%", "1m": "99.7%", "1y": "99.5%" },
            status: data.metrics.uptime >= 99.5 ? "good" : "warning",
            statuses: { "24h": "good", "7d": "good", "1m": "good", "1y": "good" },
          },
          {
            id: "amenazas",
            label: "Amenazas",
            value: `${data.metrics.threatsBlocked}/${data.metrics.threatsDetected}`,
            values: { "24h": `${data.metrics.threatsBlocked}/${data.metrics.threatsDetected}`, "7d": "45/45", "1m": "156/158", "1y": "1842/1850" },
            status: "good",
          },
          {
            id: "mttd",
            label: "MTTD",
            value: `${data.metrics.mttd}s`,
            values: { "24h": `${data.metrics.mttd}s`, "7d": "3.5s", "1m": "3.8s", "1y": "4.2s" },
            status: data.metrics.mttd <= 5 ? "good" : "warning",
            statuses: { "24h": "good", "7d": "good", "1m": "good", "1y": "warning" },
          },
          {
            id: "cumplimiento",
            label: "Cumplimiento",
            value: `${data.metrics.complianceScore}%`,
            values: { "24h": `${data.metrics.complianceScore}%`, "7d": "100%", "1m": "98%", "1y": "97%" },
            status: data.metrics.complianceScore === 100 ? "good" : "warning",
            statuses: { "24h": "good", "7d": "good", "1m": "warning", "1y": "warning" },
          },
          {
            id: "disco",
            label: "Disco",
            value: `${data.metrics.diskUsage}%`,
            values: { "24h": `${data.metrics.diskUsage}%`, "7d": "68%", "1m": "62%", "1y": "45%" },
            status: data.metrics.diskUsage >= 80 ? "critical" : data.metrics.diskUsage >= 70 ? "warning" : "good",
            statuses: { "24h": "warning", "7d": "good", "1m": "good", "1y": "good" },
          },
        ]}
      />

      {/* Sub-Agents Status Grid */}
      <SubAgentStatusGrid
        subAgents={data.subAgents}
        onSettings={openConfig}
      />

      {/* Canvas, Monitor de Amenazas, Recursos del Sistema & Escaneo de Vulnerabilidades - 2x2 Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Canvas - Lienzo de respuestas de Pascual */}
        <Canvas
          title="Canvas"
          placeholder="¿Qué necesitas verificar en seguridad?"
          onSendMessage={(msg) => sendToAgent("sentinel", "Sentinel", "🛡️", msg)}
          minHeight="180px"
          quickPrompts={[
            { label: "Escaneo completo", prompt: "Ejecuta un escaneo de seguridad completo" },
            { label: "Auditar accesos", prompt: "Genera un reporte de auditoría de accesos" },
            { label: "Ver amenazas", prompt: "Muéstrame las amenazas detectadas hoy" },
          ]}
        />

        {/* Monitor de Amenazas */}
        <SectionCard
          title="Monitor de Amenazas"
          visible={config.grids.sentinel.monitorAmenazas}
          action={
            <FilterTabs
              options={[]}
              value=""
              onChange={() => {}}
              searchValue={threatSearch}
              onSearchChange={setThreatSearch}
              searchPlaceholder="Buscar amenaza..."
              searchOnly
            />
          }
          maxHeight="320px"
        >
          <div className="space-y-2">
            {data.threats
              .filter((threat) => threatSearch === "" ||
                threat.title.toLowerCase().includes(threatSearch.toLowerCase()) ||
                threat.description.toLowerCase().includes(threatSearch.toLowerCase())
              )
              .map((threat) => (
                <ExpandableListItem
                  key={threat.id}
                  icon={
                    <div className={`w-2 h-2 rounded-full ${getSeverityColor(threat.severity)}`} />
                  }
                  title={threat.title}
                  subtitle={threat.description}
                  timestamp={threat.timestamp}
                  status={threat.status === "active" ? "failed" : threat.status === "investigating" ? "processing" : "completed"}
                  expandable={!!threat.details}
                  details={threat.details ? [
                    { label: "Fuente", value: threat.details.source || "-" },
                    { label: "Sistema", value: threat.details.targetSystem || "-" },
                    { label: "Vector", value: threat.details.attackVector || "-" },
                    { label: "Usuarios afectados", value: String(threat.details.affectedUsers ?? 0) },
                    { label: "Mitigación", value: threat.details.mitigationSteps || "-" },
                    { label: "Detectado por", value: threat.details.detectedBy || "-" },
                    { label: "Tiempo respuesta", value: threat.details.responseTime || "-" },
                    { label: "Incidentes relacionados", value: String(threat.details.relatedIncidents ?? 0) },
                    { label: "Nivel de riesgo", value: threat.details.riskLevel || "-" },
                    { label: "Recomendaciones", value: threat.details.recommendations || "-" },
                  ] : undefined}
                />
              ))}
            {data.threats
              .filter((threat) => threatSearch === "" ||
                threat.title.toLowerCase().includes(threatSearch.toLowerCase()) ||
                threat.description.toLowerCase().includes(threatSearch.toLowerCase())
              ).length === 0 && (
              <p className="font-mono text-xs text-zinc-500 text-center py-4">
                No hay amenazas {threatSearch && `que contengan "${threatSearch}"`}
              </p>
            )}
          </div>
        </SectionCard>

        {/* Recursos del Sistema */}
        <SectionCard
          title="Recursos del Sistema"
          visible={config.grids.sentinel.recursosSistema}
          action={
            <div className="flex items-center gap-3">
              <span className="font-mono text-[10px] text-zinc-500">
                Sesiones: <span className="text-white">{data.metrics.activeSessions}</span>
              </span>
              <span className="font-mono text-[10px] text-zinc-500">
                API Keys: <span className="text-white">{data.metrics.activeApiKeys}</span>
              </span>
            </div>
          }
          maxHeight="320px"
        >
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
        </SectionCard>

        {/* Escaneo de Vulnerabilidades */}
        <SectionCard
          title="Escaneo de Vulnerabilidades"
          visible={config.grids.sentinel.escaneoVulnerabilidades}
          action={<span className="font-mono text-[10px] text-zinc-500">Último: {data.vulnerabilities.lastScan}</span>}
          maxHeight="320px"
        >
          <div className="grid grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <p className={`font-mono text-2xl font-bold ${data.vulnerabilities.critical > 0 ? "text-[#ff006e]" : "text-zinc-500"}`}>
                {data.vulnerabilities.critical}
              </p>
              <p className="font-mono text-[10px] text-zinc-500">Críticas</p>
            </div>
            <div className="text-center">
              <p className={`font-mono text-2xl font-bold ${data.vulnerabilities.high > 0 ? "text-amber-500" : "text-zinc-500"}`}>
                {data.vulnerabilities.high}
              </p>
              <p className="font-mono text-[10px] text-zinc-500">Altas</p>
            </div>
            <div className="text-center">
              <p className={`font-mono text-2xl font-bold ${data.vulnerabilities.medium > 0 ? "text-[#ffaa00]" : "text-zinc-500"}`}>
                {data.vulnerabilities.medium}
              </p>
              <p className="font-mono text-[10px] text-zinc-500">Medias</p>
            </div>
            <div className="text-center">
              <p className="font-mono text-2xl font-bold text-zinc-400">{data.vulnerabilities.low}</p>
              <p className="font-mono text-[10px] text-zinc-500">Bajas</p>
            </div>
          </div>

          {/* Estado de Backup */}
          <div className="pt-4 border-t border-zinc-800">
            <p className="font-mono text-xs text-zinc-400 mb-2">Estado de Backup</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-mono text-[10px] text-zinc-500">Último: {data.backup.lastBackup}</p>
                <p className="font-mono text-[10px] text-zinc-500">Próximo: {data.backup.nextBackup}</p>
              </div>
              <div className="text-right">
                <Badge variant={data.backup.recoveryTestStatus === "passed" ? "success" : "warning"}>
                  Recuperación: {data.backup.recoveryTestStatus === "passed" ? "OK" : data.backup.recoveryTestStatus}
                </Badge>
                <p className="font-mono text-[10px] text-zinc-500 mt-1">{data.backup.size}</p>
              </div>
            </div>
          </div>
        </SectionCard>

      </div>

      {/* Mejoras Implementadas + Mapa de Actividad - Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Mejoras Implementadas */}
        <SectionCard
          title="Mejoras Implementadas"
          visible={config.grids.sentinel.mejorasImplementadas}
          action={
            <FilterTabs
              options={[]}
              value=""
              onChange={() => {}}
              searchValue={improvementSearch}
              onSearchChange={setImprovementSearch}
              searchPlaceholder="Buscar mejora..."
              searchOnly
            />
          }
          maxHeight="320px"
        >
          <div className="space-y-2">
            {data.improvements
              .filter((imp) => improvementSearch === "" ||
                imp.title.toLowerCase().includes(improvementSearch.toLowerCase()) ||
                imp.description.toLowerCase().includes(improvementSearch.toLowerCase())
              )
              .map((improvement) => (
                <ExpandableListItem
                  key={improvement.id}
                  icon={
                    <div className={`w-2 h-2 rounded-full ${getImpactColor(improvement.impact)}`} />
                  }
                  title={improvement.title}
                  subtitle={`${getCategoryLabel(improvement.category)} • Por ${improvement.implementedBy}`}
                  timestamp={improvement.implementedAt}
                  status="completed"
                  expandable={!!improvement.details}
                  details={improvement.details ? [
                    { label: "Estado anterior", value: improvement.details.beforeState || "-" },
                    { label: "Estado actual", value: improvement.details.afterState || "-" },
                    { label: "Métricas mejoradas", value: improvement.details.metricsImproved || "-" },
                    { label: "Sistemas afectados", value: improvement.details.affectedSystems || "-" },
                    { label: "Estado de pruebas", value: improvement.details.testingStatus || "-" },
                    { label: "Plan de rollback", value: improvement.details.rollbackPlan || "-" },
                    { label: "Documentación", value: improvement.details.documentation || "-" },
                    { label: "Próximos pasos", value: improvement.details.nextSteps || "-" },
                  ] : undefined}
                />
              ))}
            {data.improvements
              .filter((imp) => improvementSearch === "" ||
                imp.title.toLowerCase().includes(improvementSearch.toLowerCase()) ||
                imp.description.toLowerCase().includes(improvementSearch.toLowerCase())
              ).length === 0 && (
              <p className="font-mono text-xs text-zinc-500 text-center py-4">
                No hay mejoras {improvementSearch && `que contengan "${improvementSearch}"`}
              </p>
            )}
          </div>
        </SectionCard>

        {/* Activity Heatmap - Mapa de calor de actividad de seguridad */}
        <SectionCard
          title="Mapa de Actividad"
          visible={config.grids.sentinel.mapaActividad}
          action={
            <span className="font-mono text-[10px] text-zinc-500">7 días</span>
          }
          maxHeight="320px"
        >
          <HeatMap
            data={data.activityHeatmap.data}
            xLabels={["0", "", "", "3", "", "", "6", "", "", "9", "", "", "12", "", "", "15", "", "", "18", "", "", "21", "", ""]}
            yLabels={data.activityHeatmap.yLabels}
            maxColor="#ff006e"
            gap={2}
            fullWidth
          />
          <div className="flex items-center justify-between mt-3 pt-2 border-t border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-sm bg-zinc-800" />
                <span className="font-mono text-[9px] text-zinc-500">Baja</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-sm bg-[#ff006e]" />
                <span className="font-mono text-[9px] text-zinc-500">Alta</span>
              </div>
            </div>
            <span className="font-mono text-[9px] text-zinc-400">
              Pico: <span className="text-[#ff006e]">Jue 15h</span>
            </span>
          </div>
        </SectionCard>
      </div>

      {/* Agent Configuration Modal - usando componente reutilizable */}
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
