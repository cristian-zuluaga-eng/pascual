"use client";

import { ReactNode } from "react";
import {
  AgentHeader,
  Canvas,
  AgentConfigModal,
  useAgentConfig,
  TimeRange,
} from "./AgentDashboardLayout";
import { useGrowl } from "@/components/growl";
import type { AgentStatus } from "@/lib/api/mock/pascual-agents";

// ============================================================================
// AGENT TEMPLATE - Plantilla base para dashboards de agentes
// ============================================================================

/**
 * KPI que se muestra en el header del agente
 */
export interface AgentKPI {
  /** ID único del KPI (para control de visibilidad) */
  id: string;
  /** Etiqueta del KPI */
  label: string;
  /** Valor actual del KPI */
  value: string | number;
  /** Valores para diferentes rangos de tiempo */
  values?: Record<TimeRange, string | number>;
  /** Estado visual del KPI */
  status?: "good" | "warning" | "critical" | "neutral";
  /** Estados para diferentes rangos de tiempo */
  statuses?: Record<TimeRange, "good" | "warning" | "critical" | "neutral">;
}

/**
 * Datos de uso para el sparkline
 */
export interface AgentUsageData {
  /** Datos por defecto */
  data: number[];
  /** Datos para diferentes rangos de tiempo */
  dataByRange?: Record<TimeRange, number[]>;
  /** Color del sparkline */
  color?: string;
}

/**
 * Prompt rápido para el Canvas
 */
export interface QuickPrompt {
  /** Texto del botón */
  label: string;
  /** Prompt que se envía */
  prompt: string;
}

/**
 * Props del componente AgentTemplate
 *
 * @example
 * ```tsx
 * <AgentTemplate
 *   agentId="sentinel"
 *   name="Sentinel"
 *   icon="🛡️"
 *   lema="Seguridad proactiva"
 *   status="active"
 *   kpis={[
 *     { label: "Amenazas", value: 3, status: "warning" },
 *     { label: "Uptime", value: "99.9%", status: "good" },
 *   ]}
 *   usage={{ data: [45, 52, 48, 60], color: "#39ff14" }}
 *   canvasPlaceholder="¿Qué necesitas monitorear?"
 *   quickPrompts={[
 *     { label: "Escanear", prompt: "Ejecuta un escaneo de seguridad" },
 *   ]}
 * >
 *   <SectionCard title="Mi Contenido">...</SectionCard>
 * </AgentTemplate>
 * ```
 */
export interface AgentTemplateProps {
  // === Identificación del Agente ===
  /** ID único del agente (usado para config y comunicación) */
  agentId: string;
  /** Nombre del agente */
  name: string;
  /** Emoji/icono del agente */
  icon: string;
  /** Lema o descripción corta */
  lema: string;
  /** Estado actual del agente */
  status: AgentStatus;

  // === KPIs y Métricas ===
  /** KPIs a mostrar en el header (máximo 5 recomendado) */
  kpis?: AgentKPI[];
  /** Datos de uso para el sparkline */
  usage?: AgentUsageData;
  /** Mostrar filtro de rango de tiempo */
  showTimeRange?: boolean;
  /** Callback cuando cambia el rango de tiempo */
  onTimeRangeChange?: (range: TimeRange) => void;

  // === Canvas ===
  /** Mostrar el componente Canvas */
  showCanvas?: boolean;
  /** Placeholder del input del Canvas */
  canvasPlaceholder?: string;
  /** Prompts rápidos para el Canvas */
  quickPrompts?: QuickPrompt[];
  /** Contenido personalizado para el Canvas */
  canvasContent?: ReactNode;

  // === Contenido Principal ===
  /** Contenido principal (grids, SectionCards, etc.) */
  children: ReactNode;

  // === Configuración ===
  /** Mostrar botón de configuración en SubAgentStatusGrid */
  showConfigButton?: boolean;
  /** Callback personalizado para configuración */
  onConfig?: () => void;
}

/**
 * AgentTemplate - Componente base para crear dashboards de módulos
 *
 * Estructura:
 * 1. AgentHeader con KPIs y sparkline
 * 2. Grid principal con Canvas (opcional) + contenido personalizado
 * 3. AgentConfigModal para configuración
 *
 * @example Uso básico
 * ```tsx
 * export default function MiModuloDashboard() {
 *   return (
 *     <AgentTemplate
 *       agentId="mi-modulo"
 *       name="Mi Módulo"
 *       icon="🤖"
 *       lema="Un módulo genial"
 *       status="active"
 *       kpis={misKPIs}
 *       usage={misDatosDeUso}
 *       canvasPlaceholder="¿Qué necesitas?"
 *       quickPrompts={misPrompts}
 *     >
 *       <div className="grid grid-cols-2 gap-4">
 *         <SectionCard title="Sección 1">...</SectionCard>
 *         <SectionCard title="Sección 2">...</SectionCard>
 *       </div>
 *     </AgentTemplate>
 *   );
 * }
 * ```
 */
export function AgentTemplate({
  // Identificación
  agentId,
  name,
  icon,
  lema,
  status,
  // KPIs y métricas
  kpis,
  usage,
  showTimeRange = true,
  onTimeRangeChange,
  // Canvas
  showCanvas = true,
  canvasPlaceholder,
  quickPrompts,
  canvasContent,
  // Contenido
  children,
  // Configuración
  showConfigButton = true,
  onConfig,
}: AgentTemplateProps) {
  const { sendToAgent } = useGrowl();

  // Hook de configuración del módulo
  const {
    showConfigModal,
    agentData,
    handleAgentModelChange,
    handleSubAgentModelChange,
    openConfig,
    closeConfig,
  } = useAgentConfig(agentId);

  // Handler para mensajes del Canvas
  const handleCanvasMessage = (message: string) => {
    sendToAgent(agentId, name, icon, message);
  };

  // Handler para configuración
  const handleConfig = () => {
    if (onConfig) {
      onConfig();
    } else {
      openConfig();
    }
  };

  return (
    <div className="space-y-4">
      {/* ================================================================ */}
      {/* HEADER - Nombre, estado, KPIs y sparkline de uso */}
      {/* ================================================================ */}
      <AgentHeader
        name={name}
        icon={icon}
        lema={lema}
        status={status}
        showTimeRange={showTimeRange}
        onTimeRangeChange={onTimeRangeChange}
        usage={usage}
        kpis={kpis}
      />

      {/* ================================================================ */}
      {/* CONTENIDO PRINCIPAL */}
      {/* ================================================================ */}
      {showCanvas ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Canvas - Comunicación con Pascual */}
          <Canvas
            title="Canvas"
            placeholder={canvasPlaceholder || `Háblale a ${name}...`}
            onSendMessage={handleCanvasMessage}
            minHeight="180px"
            quickPrompts={quickPrompts}
          >
            {canvasContent}
          </Canvas>

          {/* Contenido personalizado del módulo */}
          {children}
        </div>
      ) : (
        // Sin Canvas - solo contenido personalizado
        children
      )}

      {/* ================================================================ */}
      {/* MODAL DE CONFIGURACIÓN */}
      {/* ================================================================ */}
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

export default AgentTemplate;
