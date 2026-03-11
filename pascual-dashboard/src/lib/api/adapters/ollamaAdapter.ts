/**
 * Ollama Adapter para Agentes IA
 *
 * Proporciona conexión real a Ollama (http://localhost:11434)
 * con streaming de respuestas, retry logic y manejo de errores.
 */

import {
  IAgentAdapter,
  AgentId,
  AgentConfig,
  StreamOptions,
  StreamChunk,
  AGENT_CONFIGS,
  getAgentModel,
  getAgentTimeout,
  delay,
} from "./types";

// ============================================================================
// CONFIGURACIÓN
// ============================================================================

const OLLAMA_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_OLLAMA_URL || "http://localhost:11434",
  retryAttempts: 3,
  retryDelayMs: 1000,
  healthCheckTimeout: 3000,
};

// ============================================================================
// TIPOS DE OLLAMA API
// ============================================================================

interface OllamaGenerateRequest {
  model: string;
  prompt: string;
  stream: boolean;
  options?: {
    temperature?: number;
    num_predict?: number;
    num_ctx?: number;
  };
  system?: string;
}

interface OllamaStreamResponse {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
  context?: number[];
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  prompt_eval_duration?: number;
  eval_count?: number;
  eval_duration?: number;
}

interface OllamaTagsResponse {
  models: Array<{
    name: string;
    modified_at: string;
    size: number;
  }>;
}

// ============================================================================
// OLLAMA ADAPTER
// ============================================================================

export class OllamaAdapter implements IAgentAdapter {
  readonly name = "OllamaAdapter";
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = OLLAMA_CONFIG.baseUrl;
  }

  /**
   * Genera respuesta en streaming desde Ollama
   */
  async *generateStream(
    agentId: AgentId,
    prompt: string,
    options?: StreamOptions
  ): AsyncGenerator<StreamChunk, void, unknown> {
    const model = getAgentModel(agentId);
    const timeout = getAgentTimeout(agentId);

    const requestBody: OllamaGenerateRequest = {
      model,
      prompt,
      stream: true,
      options: {
        temperature: options?.temperature ?? 0.7,
        num_predict: options?.maxTokens ?? 2048,
        num_ctx: 4096,
      },
    };

    if (options?.systemPrompt) {
      requestBody.system = options.systemPrompt;
    }

    // Crear AbortController con timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    // Combinar señales si se proporciona una externa
    if (options?.signal) {
      options.signal.addEventListener("abort", () => controller.abort());
    }

    let tokensGenerated = 0;
    const startTime = Date.now();

    try {
      const response = await this.fetchWithRetry(
        `${this.baseUrl}/api/generate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
          signal: controller.signal,
        }
      );

      if (!response.ok) {
        throw new Error(`Ollama error: ${response.status} ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No response body");
      }

      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        // Decodificar chunk
        const text = decoder.decode(value, { stream: true });

        // Ollama envía JSON lines (NDJSON)
        const lines = text.split("\n").filter((line) => line.trim());

        for (const line of lines) {
          try {
            const data: OllamaStreamResponse = JSON.parse(line);

            if (data.response) {
              tokensGenerated++;
              yield {
                content: data.response,
                done: false,
                metadata: {
                  tokensGenerated,
                  timeElapsed: Date.now() - startTime,
                },
              };
            }

            if (data.done) {
              yield {
                content: "",
                done: true,
                metadata: {
                  tokensGenerated: data.eval_count ?? tokensGenerated,
                  timeElapsed: Date.now() - startTime,
                },
              };
              return;
            }
          } catch {
            // Ignorar líneas que no son JSON válido
            console.warn("[OllamaAdapter] Invalid JSON line:", line);
          }
        }
      }
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Verifica si Ollama está disponible
   */
  async healthCheck(): Promise<boolean> {
    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      OLLAMA_CONFIG.healthCheckTimeout
    );

    try {
      const response = await fetch(`${this.baseUrl}/api/tags`, {
        method: "GET",
        signal: controller.signal,
      });
      return response.ok;
    } catch {
      return false;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Obtiene los modelos disponibles en Ollama
   */
  async getAvailableModels(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`, {
        method: "GET",
      });

      if (!response.ok) {
        return [];
      }

      const data: OllamaTagsResponse = await response.json();
      return data.models.map((m) => m.name);
    } catch {
      return [];
    }
  }

  /**
   * Obtiene la configuración de un agente
   */
  getAgentConfig(agentId: AgentId): AgentConfig | undefined {
    return AGENT_CONFIGS[agentId];
  }

  /**
   * Fetch con retry logic y exponential backoff
   */
  private async fetchWithRetry(
    url: string,
    options: RequestInit,
    attempt = 1
  ): Promise<Response> {
    try {
      const response = await fetch(url, options);

      // Retry en errores 5xx
      if (response.status >= 500 && attempt < OLLAMA_CONFIG.retryAttempts) {
        throw new Error(`Server error: ${response.status}`);
      }

      return response;
    } catch (error) {
      if (attempt >= OLLAMA_CONFIG.retryAttempts) {
        throw error;
      }

      // Exponential backoff: 1s, 2s, 4s
      const delayMs = OLLAMA_CONFIG.retryDelayMs * Math.pow(2, attempt - 1);
      console.log(
        `[OllamaAdapter] Retry attempt ${attempt}/${OLLAMA_CONFIG.retryAttempts} after ${delayMs}ms`
      );
      await delay(delayMs);

      return this.fetchWithRetry(url, options, attempt + 1);
    }
  }
}
