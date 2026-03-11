/**
 * Tipos y interfaces para el sistema de adaptadores de agentes IA
 *
 * Este módulo define el contrato común para todos los adaptadores,
 * permitiendo intercambiar entre Ollama real y Mock sin cambiar el código consumidor.
 */

// ============================================================================
// TIPOS DE AGENTES
// ============================================================================

export type AgentId = "pascual" | "nexus" | "hunter" | "warden";

export interface AgentConfig {
  model: string;
  timeout: number;
  description: string;
  location: "CPU" | "GPU";
}

/**
 * Configuración de los 4 agentes reales del sistema PASCUAL
 */
export const AGENT_CONFIGS: Record<AgentId, AgentConfig> = {
  pascual: {
    model: "qwen2.5:1.5b",
    timeout: 30000,
    description: "Orquestador principal",
    location: "CPU",
  },
  nexus: {
    model: "qwen2.5:14b",
    timeout: 120000, // 2 minutos - modelo pesado
    description: "Análisis financiero, Gambito/Cóndor360",
    location: "GPU",
  },
  hunter: {
    model: "qwen2.5:3b",
    timeout: 45000,
    description: "Búsqueda web, RSS, noticias",
    location: "GPU",
  },
  warden: {
    model: "llama3.2:1b",
    timeout: 30000,
    description: "Monitoreo de sistema, seguridad",
    location: "CPU",
  },
};

// ============================================================================
// INTERFACE DEL ADAPTADOR
// ============================================================================

export interface StreamOptions {
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  signal?: AbortSignal;
}

export interface StreamChunk {
  content: string;
  done: boolean;
  metadata?: {
    tokensGenerated?: number;
    timeElapsed?: number;
  };
}

/**
 * Interface común para todos los adaptadores de agentes IA
 * Implementa el patrón Strategy para intercambiar entre Ollama y Mock
 */
export interface IAgentAdapter {
  /**
   * Nombre del adaptador para logging
   */
  readonly name: string;

  /**
   * Genera una respuesta en streaming
   * @param agentId - ID del agente a usar
   * @param prompt - Mensaje del usuario
   * @param options - Opciones de generación
   * @returns AsyncGenerator que produce chunks de texto
   */
  generateStream(
    agentId: AgentId,
    prompt: string,
    options?: StreamOptions
  ): AsyncGenerator<StreamChunk, void, unknown>;

  /**
   * Verifica si el adaptador está disponible y funcionando
   * @returns true si el backend está accesible
   */
  healthCheck(): Promise<boolean>;

  /**
   * Obtiene la lista de modelos disponibles en el backend
   * @returns Array de nombres de modelos
   */
  getAvailableModels(): Promise<string[]>;

  /**
   * Obtiene información del agente
   * @param agentId - ID del agente
   * @returns Configuración del agente o undefined si no existe
   */
  getAgentConfig(agentId: AgentId): AgentConfig | undefined;
}

// ============================================================================
// TIPOS DE EVENTOS OPENCLAW
// ============================================================================

export type OpenClawEventType =
  | "agent:status_change"
  | "agent:metrics_update"
  | "agent:task_start"
  | "agent:task_complete"
  | "system:health"
  | "system:alert";

export interface OpenClawMessage<T = unknown> {
  type: OpenClawEventType;
  agentId?: AgentId;
  payload: T;
  timestamp: number;
}

export interface OpenClawConfig {
  url: string;
  reconnect: boolean;
  reconnectInterval: number;
  heartbeatInterval: number;
  useFallback: boolean;
}

/**
 * Configuración por defecto para OpenClaw Gateway
 */
export const DEFAULT_OPENCLAW_CONFIG: OpenClawConfig = {
  url: process.env.NEXT_PUBLIC_OPENCLAW_URL || "ws://localhost:18789",
  reconnect: true,
  reconnectInterval: 5000,
  heartbeatInterval: 30000,
  useFallback: true,
};

// ============================================================================
// UTILIDADES
// ============================================================================

/**
 * Delay helper para simular latencia
 */
export const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Obtiene el timeout para un agente específico
 */
export function getAgentTimeout(agentId: AgentId): number {
  return AGENT_CONFIGS[agentId]?.timeout ?? 30000;
}

/**
 * Obtiene el modelo para un agente específico
 */
export function getAgentModel(agentId: AgentId): string {
  return AGENT_CONFIGS[agentId]?.model ?? "qwen2.5:1.5b";
}
