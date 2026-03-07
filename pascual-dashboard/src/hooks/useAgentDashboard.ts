"use client";

import { useState, useCallback, useMemo } from "react";
import { useGrowl } from "@/components/growl";
import { useAgentConfig } from "@/components/agents";
import type { TimeRange } from "@/lib/api/types";
import type { AgentStatus, SubAgentStatus, QuickAction } from "@/lib/api/mock/pascual-agents";
import {
  getStatusColor,
  getStatusTextClass,
  getStatusBgClass,
  getStatusLabel,
  getSeverityColor,
  getSeverityTextClass,
  getSeverityLabel,
  getScoreColor,
  getScoreTextColor,
  getScoreBgColor,
  getPercentageColor,
  getPercentageTextColor,
  type Severity,
} from "@/lib/theme/colorMaps";

// ============================================================================
// USE AGENT DASHBOARD - Hook maestro para dashboards de agentes
// ============================================================================

interface AgentInfo {
  id: string;
  name: string;
  icon: string;
  lema: string;
  status: AgentStatus;
}

interface UseAgentDashboardOptions {
  /** ID del agente */
  agentId: string;
  /** Nombre del agente */
  agentName: string;
  /** Icono del agente */
  agentIcon: string;
}

interface UseAgentDashboardReturn {
  // === Estado ===
  /** Rango de tiempo seleccionado */
  timeRange: TimeRange;
  /** Setter para rango de tiempo */
  setTimeRange: (range: TimeRange) => void;

  // === Configuración ===
  /** Mostrar modal de configuración */
  showConfigModal: boolean;
  /** Datos del agente para configuración */
  agentData: ReturnType<typeof useAgentConfig>["agentData"];
  /** Abrir modal de configuración */
  openConfig: () => void;
  /** Cerrar modal de configuración */
  closeConfig: () => void;
  /** Handler para cambio de modelo del agente */
  handleAgentModelChange: (agentId: string, newModel: string) => void;
  /** Handler para cambio de modelo de sub-agente */
  handleSubAgentModelChange: (agentId: string, subAgentId: string, newModel: string) => void;

  // === Comunicación con Pascual ===
  /** Enviar mensaje al agente */
  sendMessage: (message: string) => void;
  /** Ejecutar quick action */
  executeQuickAction: (action: QuickAction) => void;

  // === Helpers de Color ===
  colors: {
    getStatusColor: typeof getStatusColor;
    getStatusTextClass: typeof getStatusTextClass;
    getStatusBgClass: typeof getStatusBgClass;
    getStatusLabel: typeof getStatusLabel;
    getSeverityColor: typeof getSeverityColor;
    getSeverityTextClass: typeof getSeverityTextClass;
    getSeverityLabel: typeof getSeverityLabel;
    getScoreColor: typeof getScoreColor;
    getScoreTextColor: typeof getScoreTextColor;
    getScoreBgColor: typeof getScoreBgColor;
    getPercentageColor: typeof getPercentageColor;
    getPercentageTextColor: typeof getPercentageTextColor;
  };
}

/**
 * Hook maestro que combina toda la lógica común de los dashboards de agentes
 *
 * @example
 * ```tsx
 * export default function SentinelDashboard() {
 *   const [data] = useState(sentinelData);
 *
 *   const {
 *     timeRange,
 *     setTimeRange,
 *     showConfigModal,
 *     openConfig,
 *     closeConfig,
 *     agentData,
 *     handleAgentModelChange,
 *     handleSubAgentModelChange,
 *     sendMessage,
 *     colors,
 *   } = useAgentDashboard({
 *     agentId: "sentinel",
 *     agentName: data.name,
 *     agentIcon: data.icon,
 *   });
 *
 *   return (
 *     <div>
 *       <AgentHeader
 *         {...data}
 *         showTimeRange
 *         onTimeRangeChange={setTimeRange}
 *       />
 *       <SubAgentStatusGrid
 *         subAgents={data.subAgents}
 *         onSettings={openConfig}
 *       />
 *       <Canvas onSendMessage={sendMessage} />
 *
 *       {showConfigModal && (
 *         <AgentConfigModal
 *           agent={agentData}
 *           onClose={closeConfig}
 *           onAgentModelChange={handleAgentModelChange}
 *           onSubAgentModelChange={handleSubAgentModelChange}
 *         />
 *       )}
 *     </div>
 *   );
 * }
 * ```
 */
export function useAgentDashboard({
  agentId,
  agentName,
  agentIcon,
}: UseAgentDashboardOptions): UseAgentDashboardReturn {
  // Time range state
  const [timeRange, setTimeRange] = useState<TimeRange>("24h");

  // Growl (chat emergente)
  const { sendToAgent } = useGrowl();

  // Configuración del agente
  const {
    showConfigModal,
    agentData,
    handleAgentModelChange,
    handleSubAgentModelChange,
    openConfig,
    closeConfig,
  } = useAgentConfig(agentId);

  // Enviar mensaje al agente
  const sendMessage = useCallback(
    (message: string) => {
      sendToAgent(agentId, agentName, agentIcon, message);
    },
    [agentId, agentName, agentIcon, sendToAgent]
  );

  // Ejecutar quick action
  const executeQuickAction = useCallback(
    (action: QuickAction) => {
      sendToAgent(agentId, agentName, agentIcon, action.prompt);
    },
    [agentId, agentName, agentIcon, sendToAgent]
  );

  // Bundle de helpers de color
  const colors = useMemo(
    () => ({
      getStatusColor,
      getStatusTextClass,
      getStatusBgClass,
      getStatusLabel,
      getSeverityColor,
      getSeverityTextClass,
      getSeverityLabel,
      getScoreColor,
      getScoreTextColor,
      getScoreBgColor,
      getPercentageColor,
      getPercentageTextColor,
    }),
    []
  );

  return {
    // Estado
    timeRange,
    setTimeRange,

    // Configuración
    showConfigModal,
    agentData,
    openConfig,
    closeConfig,
    handleAgentModelChange,
    handleSubAgentModelChange,

    // Comunicación
    sendMessage,
    executeQuickAction,

    // Helpers
    colors,
  };
}

// ============================================================================
// USE AGENT KPIS - Hook para generar KPIs dinámicos
// ============================================================================

interface KPIDefinition {
  id: string;
  label: string;
  getValue: (metrics: Record<string, unknown>, timeRange: TimeRange) => string | number;
  getStatus?: (value: unknown, timeRange: TimeRange) => "good" | "warning" | "critical" | "neutral";
  format?: (value: unknown) => string;
}

interface UseAgentKPIsOptions {
  metrics: Record<string, unknown>;
  definitions: KPIDefinition[];
  timeRange: TimeRange;
}

/**
 * Hook para generar KPIs dinámicos basados en métricas y rango de tiempo
 */
export function useAgentKPIs({ metrics, definitions, timeRange }: UseAgentKPIsOptions) {
  return useMemo(() => {
    return definitions.map((def) => {
      const value = def.getValue(metrics, timeRange);
      const status = def.getStatus?.(value, timeRange) || "neutral";
      const formattedValue = def.format ? def.format(value) : value;

      return {
        label: def.label,
        value: formattedValue,
        status,
      };
    });
  }, [metrics, definitions, timeRange]);
}

// ============================================================================
// USE TIME RANGE DATA - Hook para seleccionar datos por rango de tiempo
// ============================================================================

interface TimeRangeData<T> {
  "24h": T;
  "7d": T;
  "1m": T;
  "1y": T;
}

/**
 * Hook para seleccionar datos basados en el rango de tiempo
 */
export function useTimeRangeData<T>(
  data: TimeRangeData<T>,
  timeRange: TimeRange
): T {
  return useMemo(() => data[timeRange], [data, timeRange]);
}

/**
 * Hook para seleccionar un valor basado en el rango de tiempo
 */
export function useTimeRangeValue<T>(
  defaultValue: T,
  valuesByRange: Partial<TimeRangeData<T>> | undefined,
  timeRange: TimeRange
): T {
  return useMemo(() => {
    if (valuesByRange && valuesByRange[timeRange] !== undefined) {
      return valuesByRange[timeRange] as T;
    }
    return defaultValue;
  }, [defaultValue, valuesByRange, timeRange]);
}

export default useAgentDashboard;
