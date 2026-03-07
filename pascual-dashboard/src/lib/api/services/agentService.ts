// ============================================================================
// AGENT SERVICE - Capa de abstracción para datos de agentes
// ============================================================================
//
// Este servicio abstrae el origen de los datos.
// Actualmente usa mock data, pero está diseñado para migrar fácilmente a API real.
//
// Para migrar a API real:
// 1. Cambiar las importaciones de mock a fetch calls
// 2. Actualizar los métodos para hacer requests HTTP
// 3. Agregar manejo de errores y retry logic
// 4. Implementar cache si es necesario

import type { TimeRange, AgentConfig, AgentMetricsBase, ApiResponse } from "../types";
import type { AgentStatus, SubAgentStatus } from "../mock/pascual-agents";

// Importar datos mock
import {
  asistenteData,
  nexusData,
  sentinelData,
  scoutData,
  audiovisualData,
  consultorData,
  gambitoData,
  condor360Data,
  optimusData,
} from "../mock/pascual-agents";

import { mockAgents, AVAILABLE_MODELS } from "../mock/agents";

// ============================================================================
// TIPOS INTERNOS
// ============================================================================

type AgentId =
  | "asistente"
  | "nexus"
  | "sentinel"
  | "scout"
  | "audiovisual"
  | "consultor"
  | "gambito"
  | "condor360"
  | "optimus"
  | "pascual";

interface AgentDataMap {
  asistente: typeof asistenteData;
  nexus: typeof nexusData;
  sentinel: typeof sentinelData;
  scout: typeof scoutData;
  audiovisual: typeof audiovisualData;
  consultor: typeof consultorData;
  gambito: typeof gambitoData;
  condor360: typeof condor360Data;
  optimus: typeof optimusData;
}

// Mapa de datos mock por agente
const AGENT_DATA_MAP: Record<string, unknown> = {
  asistente: asistenteData,
  nexus: nexusData,
  sentinel: sentinelData,
  scout: scoutData,
  audiovisual: audiovisualData,
  consultor: consultorData,
  gambito: gambitoData,
  condor360: condor360Data,
  optimus: optimusData,
};

// ============================================================================
// CONFIGURACIÓN
// ============================================================================

const API_CONFIG = {
  // Cambiar a true cuando se conecte a API real
  useMockData: true,
  // Base URL del API (cuando se implemente)
  baseUrl: process.env.NEXT_PUBLIC_API_URL || "/api",
  // Timeout para requests
  timeout: 30000,
};

// ============================================================================
// AGENT SERVICE
// ============================================================================

export const agentService = {
  /**
   * Obtiene los datos completos de un agente
   */
  async getAgent<T = unknown>(agentId: string): Promise<ApiResponse<T>> {
    if (API_CONFIG.useMockData) {
      const data = AGENT_DATA_MAP[agentId];
      if (!data) {
        return {
          success: false,
          error: {
            code: "AGENT_NOT_FOUND",
            message: `Agent ${agentId} not found`,
          },
          meta: { timestamp: Date.now() },
        };
      }
      return {
        success: true,
        data: data as T,
        meta: { timestamp: Date.now() },
      };
    }

    // TODO: Implementar llamada a API real
    // return fetch(`${API_CONFIG.baseUrl}/agents/${agentId}`).then(r => r.json());
    throw new Error("API real no implementada");
  },

  /**
   * Obtiene la lista de todos los agentes
   */
  async getAllAgents() {
    if (API_CONFIG.useMockData) {
      return {
        success: true,
        data: mockAgents,
        meta: { timestamp: Date.now() },
      };
    }

    throw new Error("API real no implementada");
  },

  /**
   * Obtiene los sub-agentes de un agente
   */
  async getSubAgents(agentId: string): Promise<ApiResponse<SubAgentStatus[]>> {
    if (API_CONFIG.useMockData) {
      const data = AGENT_DATA_MAP[agentId] as { subAgents?: SubAgentStatus[] } | undefined;
      if (!data?.subAgents) {
        return {
          success: false,
          error: {
            code: "SUBAGENTS_NOT_FOUND",
            message: `SubAgents for ${agentId} not found`,
          },
          meta: { timestamp: Date.now() },
        };
      }
      return {
        success: true,
        data: data.subAgents,
        meta: { timestamp: Date.now() },
      };
    }

    throw new Error("API real no implementada");
  },

  /**
   * Obtiene métricas de un agente para un rango de tiempo
   */
  async getAgentMetrics(
    agentId: string,
    timeRange: TimeRange
  ): Promise<ApiResponse<AgentMetricsBase>> {
    if (API_CONFIG.useMockData) {
      const data = AGENT_DATA_MAP[agentId] as { metrics?: Record<string, unknown> } | undefined;
      if (!data?.metrics) {
        return {
          success: false,
          error: {
            code: "METRICS_NOT_FOUND",
            message: `Metrics for ${agentId} not found`,
          },
          meta: { timestamp: Date.now() },
        };
      }

      // Simular métricas por rango de tiempo
      const metrics: AgentMetricsBase = {
        agentId,
        timestamp: Date.now(),
        timeRange,
        values: data.metrics as Record<string, number | string | boolean>,
      };

      return {
        success: true,
        data: metrics,
        meta: { timestamp: Date.now() },
      };
    }

    // TODO: API real
    // return fetch(`${API_CONFIG.baseUrl}/agents/${agentId}/metrics?timeRange=${timeRange}`)
    throw new Error("API real no implementada");
  },

  /**
   * Actualiza el modelo de un agente
   */
  async updateAgentModel(
    agentId: string,
    newModel: string
  ): Promise<ApiResponse<{ model: string }>> {
    if (API_CONFIG.useMockData) {
      // En mock, solo validamos que el modelo exista
      if (!AVAILABLE_MODELS.includes(newModel)) {
        return {
          success: false,
          error: {
            code: "INVALID_MODEL",
            message: `Model ${newModel} is not available`,
          },
          meta: { timestamp: Date.now() },
        };
      }

      console.log(`[Mock] Updated agent ${agentId} model to ${newModel}`);
      return {
        success: true,
        data: { model: newModel },
        meta: { timestamp: Date.now() },
      };
    }

    // TODO: API real
    // return fetch(`${API_CONFIG.baseUrl}/agents/${agentId}/model`, {
    //   method: 'PUT',
    //   body: JSON.stringify({ model: newModel })
    // })
    throw new Error("API real no implementada");
  },

  /**
   * Actualiza el modelo de un sub-agente
   */
  async updateSubAgentModel(
    agentId: string,
    subAgentId: string,
    newModel: string
  ): Promise<ApiResponse<{ model: string }>> {
    if (API_CONFIG.useMockData) {
      if (!AVAILABLE_MODELS.includes(newModel)) {
        return {
          success: false,
          error: {
            code: "INVALID_MODEL",
            message: `Model ${newModel} is not available`,
          },
          meta: { timestamp: Date.now() },
        };
      }

      console.log(`[Mock] Updated subagent ${subAgentId} of ${agentId} to ${newModel}`);
      return {
        success: true,
        data: { model: newModel },
        meta: { timestamp: Date.now() },
      };
    }

    throw new Error("API real no implementada");
  },

  /**
   * Obtiene el estado de un agente
   */
  async getAgentStatus(agentId: string): Promise<ApiResponse<{ status: AgentStatus }>> {
    if (API_CONFIG.useMockData) {
      const data = AGENT_DATA_MAP[agentId] as { status?: AgentStatus } | undefined;
      if (!data?.status) {
        return {
          success: false,
          error: {
            code: "STATUS_NOT_FOUND",
            message: `Status for ${agentId} not found`,
          },
          meta: { timestamp: Date.now() },
        };
      }

      return {
        success: true,
        data: { status: data.status },
        meta: { timestamp: Date.now() },
      };
    }

    throw new Error("API real no implementada");
  },

  /**
   * Envía un mensaje a un agente (para el chat)
   */
  async sendMessage(
    agentId: string,
    message: string
  ): Promise<ApiResponse<{ response: string; confidence?: number }>> {
    if (API_CONFIG.useMockData) {
      // Simular respuesta
      await new Promise(resolve => setTimeout(resolve, 500));

      return {
        success: true,
        data: {
          response: `[Mock Response] Recibí tu mensaje: "${message}"`,
          confidence: 0.95,
        },
        meta: { timestamp: Date.now() },
      };
    }

    // TODO: API real con streaming
    throw new Error("API real no implementada");
  },

  /**
   * Obtiene los modelos disponibles
   */
  async getAvailableModels(): Promise<ApiResponse<string[]>> {
    if (API_CONFIG.useMockData) {
      return {
        success: true,
        data: AVAILABLE_MODELS,
        meta: { timestamp: Date.now() },
      };
    }

    throw new Error("API real no implementada");
  },

  /**
   * Obtiene las quick actions de un agente
   */
  async getQuickActions(agentId: string) {
    if (API_CONFIG.useMockData) {
      const data = AGENT_DATA_MAP[agentId] as { quickActions?: unknown[] } | undefined;
      return {
        success: true,
        data: data?.quickActions || [],
        meta: { timestamp: Date.now() },
      };
    }

    throw new Error("API real no implementada");
  },
};

// ============================================================================
// HOOKS HELPERS
// ============================================================================

/**
 * Verifica si estamos en modo mock
 */
export function isUsingMockData(): boolean {
  return API_CONFIG.useMockData;
}

/**
 * Obtiene la URL base del API
 */
export function getApiBaseUrl(): string {
  return API_CONFIG.baseUrl;
}

export default agentService;
