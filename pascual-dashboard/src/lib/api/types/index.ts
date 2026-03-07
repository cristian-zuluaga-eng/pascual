// ============================================================================
// TIPOS COMPARTIDOS PARA API Y DATOS
// ============================================================================

// Re-export de tipos existentes
export type { AgentStatus, SubAgentStatus, QuickAction, PascualMessage } from "../mock/pascual-agents";

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
 * Métricas base que todos los agentes comparten
 */
export interface AgentMetricsBase {
  agentId: string;
  timestamp: number;
  timeRange: TimeRange;
  /** Métricas específicas del agente */
  values: Record<string, number | string | boolean>;
  /** Series temporales para gráficos */
  series?: Record<string, number[]>;
}

/**
 * Snapshot de salud del agente
 */
export interface AgentHealthSnapshot {
  agentId: string;
  timestamp: number;
  status: "healthy" | "degraded" | "critical";
  uptime: number; // porcentaje
  responseTime: number; // ms
  errorRate: number; // porcentaje
  activeConnections: number;
}

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
// CONFIGURACIÓN DE AGENTE
// ============================================================================

/**
 * Configuración de modelo de un agente
 */
export interface AgentModelConfig {
  agentId: string;
  model: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}

/**
 * Configuración completa de un agente
 */
export interface AgentConfig {
  id: string;
  name: string;
  enabled: boolean;
  model: AgentModelConfig;
  subAgents?: AgentModelConfig[];
  settings?: Record<string, unknown>;
}

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
