// ============================================================================
// TIPOS COMPARTIDOS PARA API Y DATOS
// ============================================================================
//
// NOMENCLATURA:
// - "Módulo" = Secciones del dashboard (Asistente, Sentinel, Nexus, etc.)
// - "Agente" = Los 3 agentes reales: Pascual, Hunter, Warden
//
// Por compatibilidad, se mantienen aliases con prefijo "Agent" pero
// la nomenclatura correcta usa "Module".
// ============================================================================

// Re-export de tipos base desde la nueva ubicacion
export type {
  DeepPartial,
  ModuleStatus,
  AgentStatus,
  Priority,
  ConvictionLevel,
  QuickAction,
  PascualMessage,
  ModuleBase,
  AgentBase,
} from "../mock/types/base";

export { mergeWithDefaults } from "../mock/types/base";

// ============================================================================
// TIME RANGE
// ============================================================================

export type TimeRange = "24h" | "7d" | "1m" | "1y";

export const TIME_RANGE_LABELS: Record<TimeRange, string> = {
  "24h": "24 Horas",
  "7d": "7 Días",
  "1m": "1 Mes",
  "1y": "1 Año",
};

export const TIME_RANGE_MS: Record<TimeRange, number> = {
  "24h": 24 * 60 * 60 * 1000,
  "7d": 7 * 24 * 60 * 60 * 1000,
  "1m": 30 * 24 * 60 * 60 * 1000,
  "1y": 365 * 24 * 60 * 60 * 1000,
};

// ============================================================================
// MÉTRICAS BASE
// ============================================================================

/**
 * Punto de datos en una serie temporal
 */
export interface TimeSeriesDataPoint {
  timestamp: number;
  value: number;
  label?: string;
}

/**
 * Serie de datos para gráficos
 */
export interface ChartSeries {
  id: string;
  name: string;
  data: TimeSeriesDataPoint[];
  color?: string;
}

/**
 * Configuración de gráfico
 */
export interface ChartConfig {
  title: string;
  series: ChartSeries[];
  xAxisLabel?: string;
  yAxisLabel?: string;
  showLegend?: boolean;
}

/**
 * Métricas base que todos los módulos comparten
 */
export interface ModuleMetricsBase {
  moduleId: string;
  timestamp: number;
  timeRange: TimeRange;
  /** Métricas específicas del módulo */
  values: Record<string, number | string | boolean>;
  /** Series temporales para gráficos */
  series?: Record<string, number[]>;
}

// Alias para compatibilidad
export type AgentMetricsBase = ModuleMetricsBase;

/**
 * Snapshot de salud del módulo
 */
export interface ModuleHealthSnapshot {
  moduleId: string;
  timestamp: number;
  status: "healthy" | "degraded" | "critical";
  uptime: number; // porcentaje
  responseTime: number; // ms
  errorRate: number; // porcentaje
  activeConnections: number;
}

// Alias para compatibilidad
export type AgentHealthSnapshot = ModuleHealthSnapshot;

// ============================================================================
// KPIs
// ============================================================================

/**
 * KPI individual para mostrar en dashboards
 */
export interface KPI {
  id: string;
  label: string;
  value: string | number;
  /** Valores históricos por rango de tiempo */
  valuesByRange?: Record<TimeRange, string | number>;
  status?: "good" | "warning" | "critical" | "neutral";
  /** Estados por rango de tiempo */
  statusByRange?: Record<TimeRange, "good" | "warning" | "critical" | "neutral">;
  trend?: {
    value: number;
    direction: "up" | "down" | "stable";
    isPositive: boolean;
  };
  unit?: string;
  icon?: string;
}

/**
 * Grupo de KPIs relacionados
 */
export interface KPIGroup {
  id: string;
  title: string;
  kpis: KPI[];
}

// ============================================================================
// ALERTAS Y NOTIFICACIONES
// ============================================================================

export type AlertSeverity = "critical" | "warning" | "info";

/**
 * Alerta/Notificación del sistema
 */
export interface Alert {
  id: string;
  agentId: string;
  severity: AlertSeverity;
  title: string;
  description: string;
  timestamp: number;
  resolved?: boolean;
  resolvedAt?: number;
  resolvedBy?: string;
  metadata?: Record<string, unknown>;
}

// ============================================================================
// TAREAS
// ============================================================================

export type TaskStatus = "pending" | "in_progress" | "completed" | "failed" | "blocked";
export type TaskPriority = "critical" | "high" | "medium" | "low";

/**
 * Tarea genérica
 */
export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo?: string;
  createdAt: number;
  updatedAt: number;
  dueDate?: number;
  completedAt?: number;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

// ============================================================================
// EVENTOS Y ACTIVIDAD
// ============================================================================

export type EventType = "info" | "success" | "warning" | "error" | "action";

/**
 * Evento de actividad
 */
export interface ActivityEvent {
  id: string;
  type: EventType;
  title: string;
  description?: string;
  timestamp: number;
  agentId?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Feed de actividad
 */
export interface ActivityFeed {
  events: ActivityEvent[];
  hasMore: boolean;
  nextCursor?: string;
}

// ============================================================================
// PAGINACIÓN
// ============================================================================

/**
 * Parámetros de paginación para requests
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  cursor?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

/**
 * Respuesta paginada
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
    nextCursor?: string;
  };
}

// ============================================================================
// FILTROS
// ============================================================================

/**
 * Filtro genérico
 */
export interface Filter {
  field: string;
  operator: "eq" | "ne" | "gt" | "gte" | "lt" | "lte" | "contains" | "in";
  value: unknown;
}

/**
 * Parámetros de búsqueda/filtrado
 */
export interface SearchParams {
  query?: string;
  filters?: Filter[];
  pagination?: PaginationParams;
}

// ============================================================================
// RESPUESTAS DE API
// ============================================================================

/**
 * Respuesta estándar de API
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  meta?: {
    timestamp: number;
    requestId?: string;
  };
}

/**
 * Respuesta de lista
 */
export interface ListResponse<T> extends ApiResponse<T[]> {
  pagination?: PaginatedResponse<T>["pagination"];
}

// ============================================================================
// CONFIGURACIÓN DE MÓDULO
// ============================================================================

/**
 * Configuración de modelo de un módulo
 */
export interface ModuleModelConfig {
  moduleId: string;
  model: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}

// Alias para compatibilidad
export type AgentModelConfig = ModuleModelConfig;

/**
 * Configuración completa de un módulo
 */
export interface ModuleConfig {
  id: string;
  name: string;
  enabled: boolean;
  model: ModuleModelConfig;
  subModules?: ModuleModelConfig[];
  settings?: Record<string, unknown>;
}

// Alias para compatibilidad
export type AgentConfig = ModuleConfig;

// ============================================================================
// RECURSOS DEL SISTEMA (RAM / VRAM)
// ============================================================================

/**
 * Recurso de memoria individual (RAM o VRAM)
 */
export interface MemoryResource {
  /** Memoria usada en GB */
  used: number;
  /** Memoria total en GB */
  total: number;
}

/**
 * Recursos del sistema para monitoreo en el Header
 */
export interface SystemResources {
  ram: MemoryResource;
  vram: MemoryResource;
}

/**
 * Calcula el porcentaje de uso de un recurso de memoria
 */
export const getMemoryPercentage = (resource: MemoryResource): number => {
  return Math.round((resource.used / resource.total) * 100);
};

/**
 * Obtiene el color según el porcentaje de uso
 * - Verde (#39ff14): < 75% - Normal
 * - Ámbar (#ffaa00): 75-89% - Warning
 * - Rosa (#ff006e): >= 90% - Crítico
 */
export const getUsageColor = (percentage: number): string => {
  if (percentage >= 90) return "#ff006e";
  if (percentage >= 75) return "#ffaa00";
  return "#39ff14";
};

/**
 * Obtiene el estado según el porcentaje de uso
 */
export const getUsageStatus = (percentage: number): "good" | "warning" | "critical" => {
  if (percentage >= 90) return "critical";
  if (percentage >= 75) return "warning";
  return "good";
};

// ============================================================================
// WEBSOCKET EVENTS
// ============================================================================

export type WSEventType =
  | "agent:status_change"
  | "agent:metrics_update"
  | "agent:task_update"
  | "alert:new"
  | "alert:resolved"
  | "sync:complete";

/**
 * Mensaje de WebSocket
 */
export interface WSMessage<T = unknown> {
  type: WSEventType;
  payload: T;
  timestamp: number;
  agentId?: string;
}
