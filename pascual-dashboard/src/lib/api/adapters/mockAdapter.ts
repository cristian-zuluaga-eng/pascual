/**
 * Mock Adapter para Agentes IA
 *
 * Proporciona respuestas simuladas cuando Ollama no está disponible.
 * Útil para desarrollo y testing sin necesidad de backend.
 */

import {
  IAgentAdapter,
  AgentId,
  AgentConfig,
  StreamOptions,
  StreamChunk,
  AGENT_CONFIGS,
  delay,
} from "./types";

// ============================================================================
// RESPUESTAS SIMULADAS POR AGENTE
// ============================================================================

const AGENT_RESPONSES: Record<AgentId, string[]> = {
  pascual: [
    "Entendido. He procesado tu solicitud y estoy coordinando con los agentes necesarios.",
    "Recibido. Voy a delegar esto al agente especializado correspondiente.",
    "Tu mensaje ha sido registrado. Te mantendré informado del progreso.",
    "Perfecto. He iniciado el proceso y te notificaré cuando haya resultados.",
    "Mensaje recibido. Estoy analizando la mejor forma de proceder con tu solicitud.",
    "He registrado tu solicitud. La tarea será asignada al agente más apropiado según su naturaleza.",
  ],
  nexus: [
    "Analizando el código... He detectado algunos patrones que podemos optimizar.",
    "El PR está listo para review. He ejecutado los tests y todo pasa correctamente.",
    "He creado un branch con la implementación sugerida. Puedes revisarlo cuando quieras.",
    "La arquitectura propuesta cumple con los estándares. Procederé con la implementación.",
    "Análisis de deuda técnica completado. Recomiendo refactorizar los módulos identificados.",
    "Pipeline de CI/CD ejecutado exitosamente. Deployment listo para producción.",
  ],
  hunter: [
    "Búsqueda completada. He encontrado 15 resultados relevantes para tu consulta.",
    "Tendencia agregada a monitoreo. Te notificaré de cambios importantes.",
    "Datos extraídos y sintetizados. El reporte está listo para revisión.",
    "He actualizado el feed con la información más reciente de las fuentes configuradas.",
    "Análisis de sentimiento completado. Tendencia general: positiva con 78% de confianza.",
    "Fuentes RSS sincronizadas. 23 nuevos artículos agregados al índice.",
  ],
  warden: [
    "Escaneo de seguridad completado. No se detectaron amenazas críticas.",
    "He actualizado las reglas del firewall según tu solicitud.",
    "Auditoría de accesos generada. Te envío el reporte completo.",
    "Sistema de backup ejecutado exitosamente. Recovery point actualizado.",
    "Monitoreo de recursos: CPU 45%, RAM 68%, Disk 52%. Todo dentro de parámetros.",
    "Análisis de vulnerabilidades completado. 2 parches pendientes de aplicar.",
  ],
};

// ============================================================================
// GENERADOR DE RESPUESTAS
// ============================================================================

/**
 * Genera una respuesta contextual basada en el mensaje del usuario
 */
function generateContextualResponse(agentId: AgentId, userMessage: string): string {
  const lowerMessage = userMessage.toLowerCase();
  const responses = AGENT_RESPONSES[agentId];

  // Respuestas contextuales básicas
  if (lowerMessage.includes("ayuda") || lowerMessage.includes("help")) {
    return `Estoy aquí para ayudarte. Como ${AGENT_CONFIGS[agentId].description}, puedo asistirte con tareas relacionadas. ¿Qué necesitas específicamente?`;
  }

  if (lowerMessage.includes("estado") || lowerMessage.includes("status")) {
    return `Estado actual: Activo y operativo. Modelo ${AGENT_CONFIGS[agentId].model} cargado en ${AGENT_CONFIGS[agentId].location}. Listo para procesar solicitudes.`;
  }

  if (lowerMessage.includes("hola") || lowerMessage.includes("hi") || lowerMessage.includes("hey")) {
    return `¡Hola! Soy el agente ${agentId.toUpperCase()}, ${AGENT_CONFIGS[agentId].description}. ¿En qué puedo ayudarte?`;
  }

  // Respuesta aleatoria del pool
  return responses[Math.floor(Math.random() * responses.length)];
}

// ============================================================================
// MOCK ADAPTER
// ============================================================================

export class MockAdapter implements IAgentAdapter {
  readonly name = "MockAdapter";

  // Velocidad de "typing" en ms por caracter
  private readonly charDelay = 15;

  // Delay inicial antes de empezar a "escribir"
  private readonly initialDelay = 300;

  /**
   * Genera respuesta en streaming simulando typing
   */
  async *generateStream(
    agentId: AgentId,
    prompt: string,
    options?: StreamOptions
  ): AsyncGenerator<StreamChunk, void, unknown> {
    // Delay inicial para simular procesamiento
    await delay(this.initialDelay);

    // Verificar si la solicitud fue cancelada
    if (options?.signal?.aborted) {
      return;
    }

    const response = generateContextualResponse(agentId, prompt);
    let tokensGenerated = 0;
    const startTime = Date.now();

    // Emitir caracter por caracter
    for (const char of response) {
      // Verificar cancelación
      if (options?.signal?.aborted) {
        return;
      }

      tokensGenerated++;
      await delay(this.charDelay + Math.random() * 10); // Variación natural

      yield {
        content: char,
        done: false,
        metadata: {
          tokensGenerated,
          timeElapsed: Date.now() - startTime,
        },
      };
    }

    // Chunk final
    yield {
      content: "",
      done: true,
      metadata: {
        tokensGenerated,
        timeElapsed: Date.now() - startTime,
      },
    };
  }

  /**
   * El mock siempre está disponible
   */
  async healthCheck(): Promise<boolean> {
    return true;
  }

  /**
   * Retorna los modelos "disponibles" (simulados)
   */
  async getAvailableModels(): Promise<string[]> {
    return Object.values(AGENT_CONFIGS).map((config) => config.model);
  }

  /**
   * Obtiene la configuración de un agente
   */
  getAgentConfig(agentId: AgentId): AgentConfig | undefined {
    return AGENT_CONFIGS[agentId];
  }
}
