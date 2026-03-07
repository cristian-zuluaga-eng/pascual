// ============================================================================
// COLOR MAPS - Paleta centralizada de colores del sistema
// ============================================================================

import type { AgentStatus } from "@/lib/api/mock/pascual-agents";

// ============================================================================
// COLORES PRIMARIOS DEL SISTEMA
// ============================================================================

export const SYSTEM_COLORS = {
  cyan: "#00d9ff",
  pink: "#ff006e",
  green: "#39ff14",
  amber: "#ffaa00",
  white: "#ffffff",
  muted: "#a1a1a1",
} as const;

// ============================================================================
// COLORES POR ESTADO DE AGENTE
// ============================================================================

export const STATUS_COLORS: Record<AgentStatus, string> = {
  active: SYSTEM_COLORS.green,
  busy: SYSTEM_COLORS.amber,
  idle: SYSTEM_COLORS.muted,
  offline: "#52525b",
  error: SYSTEM_COLORS.pink,
} as const;

export const STATUS_BG_COLORS: Record<AgentStatus, string> = {
  active: "bg-[#39ff14]",
  busy: "bg-amber-400",
  idle: "bg-zinc-500",
  offline: "bg-zinc-600",
  error: "bg-[#ff006e]",
} as const;

export const STATUS_TEXT_COLORS: Record<AgentStatus, string> = {
  active: "text-[#39ff14]",
  busy: "text-amber-400",
  idle: "text-zinc-500",
  offline: "text-zinc-600",
  error: "text-[#ff006e]",
} as const;

export const STATUS_LABELS: Record<AgentStatus, string> = {
  active: "Activo",
  busy: "Ocupado",
  idle: "Inactivo",
  offline: "Offline",
  error: "Error",
} as const;

// ============================================================================
// COLORES POR SEVERIDAD
// ============================================================================

export type Severity = "critical" | "high" | "medium" | "low" | "info";

export const SEVERITY_COLORS: Record<Severity, string> = {
  critical: SYSTEM_COLORS.pink,
  high: SYSTEM_COLORS.pink,
  medium: SYSTEM_COLORS.amber,
  low: SYSTEM_COLORS.green,
  info: SYSTEM_COLORS.cyan,
} as const;

export const SEVERITY_BG_COLORS: Record<Severity, string> = {
  critical: "bg-[#ff006e]",
  high: "bg-[#ff006e]",
  medium: "bg-amber-400",
  low: "bg-[#39ff14]",
  info: "bg-[#00d9ff]",
} as const;

export const SEVERITY_TEXT_COLORS: Record<Severity, string> = {
  critical: "text-[#ff006e]",
  high: "text-[#ff006e]",
  medium: "text-amber-400",
  low: "text-[#39ff14]",
  info: "text-[#00d9ff]",
} as const;

export const SEVERITY_LABELS: Record<Severity, string> = {
  critical: "Crítico",
  high: "Alto",
  medium: "Medio",
  low: "Bajo",
  info: "Info",
} as const;

// ============================================================================
// COLORES POR PRIORIDAD
// ============================================================================

export type Priority = "critical" | "high" | "medium" | "low";

export const PRIORITY_COLORS: Record<Priority, string> = {
  critical: SYSTEM_COLORS.pink,
  high: SYSTEM_COLORS.pink,
  medium: SYSTEM_COLORS.amber,
  low: SYSTEM_COLORS.muted,
} as const;

export const PRIORITY_TEXT_COLORS: Record<Priority, string> = {
  critical: "text-[#ff006e]",
  high: "text-[#ff006e]",
  medium: "text-amber-400",
  low: "text-zinc-400",
} as const;

export const PRIORITY_LABELS: Record<Priority, string> = {
  critical: "Crítica",
  high: "Alta",
  medium: "Media",
  low: "Baja",
} as const;

// ============================================================================
// COLORES POR ESTADO DE KPI
// ============================================================================

export type KPIStatus = "good" | "warning" | "critical" | "neutral";

export const KPI_COLORS: Record<KPIStatus, string> = {
  good: SYSTEM_COLORS.green,
  warning: SYSTEM_COLORS.amber,
  critical: SYSTEM_COLORS.pink,
  neutral: SYSTEM_COLORS.white,
} as const;

export const KPI_TEXT_COLORS: Record<KPIStatus, string> = {
  good: "text-[#39ff14]",
  warning: "text-amber-400",
  critical: "text-[#ff006e]",
  neutral: "text-white",
} as const;

// ============================================================================
// COLORES POR ESTADO DE TAREA
// ============================================================================

export type TaskStatus = "completed" | "in_progress" | "pending" | "failed" | "blocked";

export const TASK_STATUS_COLORS: Record<TaskStatus, string> = {
  completed: SYSTEM_COLORS.green,
  in_progress: SYSTEM_COLORS.cyan,
  pending: SYSTEM_COLORS.amber,
  failed: SYSTEM_COLORS.pink,
  blocked: SYSTEM_COLORS.muted,
} as const;

export const TASK_STATUS_TEXT_COLORS: Record<TaskStatus, string> = {
  completed: "text-[#39ff14]",
  in_progress: "text-[#00d9ff]",
  pending: "text-amber-400",
  failed: "text-[#ff006e]",
  blocked: "text-zinc-500",
} as const;

export const TASK_STATUS_ICONS: Record<TaskStatus, string> = {
  completed: "✓",
  in_progress: "◐",
  pending: "○",
  failed: "✕",
  blocked: "⊘",
} as const;

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  completed: "Completado",
  in_progress: "En Progreso",
  pending: "Pendiente",
  failed: "Fallido",
  blocked: "Bloqueado",
} as const;

// ============================================================================
// COLORES POR CATEGORÍA DE EVENTO
// ============================================================================

export type EventCategory = "work" | "personal" | "health" | "family" | "finance" | "other";

export const EVENT_CATEGORY_COLORS: Record<EventCategory, string> = {
  work: SYSTEM_COLORS.cyan,
  personal: SYSTEM_COLORS.green,
  health: SYSTEM_COLORS.pink,
  family: SYSTEM_COLORS.amber,
  finance: "#8b5cf6", // purple
  other: SYSTEM_COLORS.muted,
} as const;

export const EVENT_CATEGORY_BORDER_COLORS: Record<EventCategory, string> = {
  work: "border-[#00d9ff]",
  personal: "border-[#39ff14]",
  health: "border-[#ff006e]",
  family: "border-amber-400",
  finance: "border-purple-500",
  other: "border-zinc-500",
} as const;

// ============================================================================
// COLORES PARA CHARTS
// ============================================================================

export const CHART_COLORS = {
  primary: SYSTEM_COLORS.cyan,
  secondary: SYSTEM_COLORS.pink,
  tertiary: SYSTEM_COLORS.green,
  quaternary: SYSTEM_COLORS.amber,
  // Paleta extendida para múltiples series
  palette: [
    SYSTEM_COLORS.cyan,
    SYSTEM_COLORS.green,
    SYSTEM_COLORS.pink,
    SYSTEM_COLORS.amber,
    "#8b5cf6", // purple
    "#06b6d4", // teal
    "#f97316", // orange
    "#ec4899", // pink-400
  ],
} as const;

// ============================================================================
// COLORES PARA SCORES
// ============================================================================

export function getScoreColor(score: number): string {
  if (score >= 90) return SYSTEM_COLORS.green;
  if (score >= 75) return SYSTEM_COLORS.cyan;
  if (score >= 60) return SYSTEM_COLORS.amber;
  return SYSTEM_COLORS.pink;
}

export function getScoreTextColor(score: number): string {
  if (score >= 90) return "text-[#39ff14]";
  if (score >= 75) return "text-[#00d9ff]";
  if (score >= 60) return "text-amber-400";
  return "text-[#ff006e]";
}

export function getScoreBgColor(score: number): string {
  if (score >= 90) return "bg-[#39ff14]/20 text-[#39ff14] border-[#39ff14]/30";
  if (score >= 75) return "bg-[#00d9ff]/20 text-[#00d9ff] border-[#00d9ff]/30";
  if (score >= 60) return "bg-amber-400/20 text-amber-400 border-amber-400/30";
  return "bg-[#ff006e]/20 text-[#ff006e] border-[#ff006e]/30";
}

// ============================================================================
// COLORES PARA PORCENTAJES (Progreso, Uso, etc.)
// ============================================================================

export function getPercentageColor(value: number, invertThreshold = false): string {
  if (invertThreshold) {
    // Para cosas como "uso de disco" donde alto es malo
    if (value >= 90) return SYSTEM_COLORS.pink;
    if (value >= 75) return SYSTEM_COLORS.amber;
    return SYSTEM_COLORS.green;
  }
  // Para cosas como "completado" donde alto es bueno
  if (value >= 90) return SYSTEM_COLORS.green;
  if (value >= 50) return SYSTEM_COLORS.amber;
  return SYSTEM_COLORS.pink;
}

export function getPercentageTextColor(value: number, invertThreshold = false): string {
  if (invertThreshold) {
    if (value >= 90) return "text-[#ff006e]";
    if (value >= 75) return "text-amber-400";
    return "text-[#39ff14]";
  }
  if (value >= 90) return "text-[#39ff14]";
  if (value >= 50) return "text-amber-400";
  return "text-[#ff006e]";
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Obtiene el color de un estado genérico
 */
export function getStatusColor(status: AgentStatus): string {
  return STATUS_COLORS[status] || SYSTEM_COLORS.muted;
}

/**
 * Obtiene la clase CSS de texto para un estado
 */
export function getStatusTextClass(status: AgentStatus): string {
  return STATUS_TEXT_COLORS[status] || "text-zinc-400";
}

/**
 * Obtiene la clase CSS de fondo para un estado
 */
export function getStatusBgClass(status: AgentStatus): string {
  return STATUS_BG_COLORS[status] || "bg-zinc-500";
}

/**
 * Obtiene el label en español para un estado
 */
export function getStatusLabel(status: AgentStatus): string {
  return STATUS_LABELS[status] || status;
}

/**
 * Obtiene el color de severidad
 */
export function getSeverityColor(severity: Severity): string {
  return SEVERITY_COLORS[severity] || SYSTEM_COLORS.muted;
}

/**
 * Obtiene la clase CSS de texto para severidad
 */
export function getSeverityTextClass(severity: Severity): string {
  return SEVERITY_TEXT_COLORS[severity] || "text-zinc-400";
}

/**
 * Obtiene el label en español para severidad
 */
export function getSeverityLabel(severity: Severity): string {
  return SEVERITY_LABELS[severity] || severity;
}

export default SYSTEM_COLORS;
