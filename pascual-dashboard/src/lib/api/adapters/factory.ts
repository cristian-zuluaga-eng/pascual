/**
 * Factory de Adaptadores de Agentes IA
 *
 * Implementa el patrón Factory + Singleton para crear y gestionar
 * adaptadores de agentes. Detecta automáticamente si Ollama está
 * disponible y usa el adaptador apropiado.
 */

import { IAgentAdapter } from "./types";

// Los adaptadores se importan de forma lazy para evitar dependencias circulares
let OllamaAdapter: new () => IAgentAdapter;
let MockAdapter: new () => IAgentAdapter;

// Singleton del adaptador activo
let activeAdapter: IAgentAdapter | null = null;
let adapterInitPromise: Promise<IAgentAdapter> | null = null;

/**
 * Carga los adaptadores de forma lazy
 */
async function loadAdapters(): Promise<void> {
  if (!OllamaAdapter) {
    const ollamaModule = await import("./ollamaAdapter");
    OllamaAdapter = ollamaModule.OllamaAdapter;
  }
  if (!MockAdapter) {
    const mockModule = await import("./mockAdapter");
    MockAdapter = mockModule.MockAdapter;
  }
}

/**
 * Crea un nuevo adaptador de agentes
 *
 * Intenta conectar a Ollama primero. Si no está disponible,
 * usa el MockAdapter como fallback.
 *
 * @returns El adaptador apropiado según la disponibilidad del backend
 */
export async function createAgentAdapter(): Promise<IAgentAdapter> {
  await loadAdapters();

  // Verificar si se fuerza el modo mock
  const forceMock = process.env.NEXT_PUBLIC_FORCE_MOCK === "true";
  if (forceMock) {
    console.log("[AdapterFactory] Force mock mode enabled");
    return new MockAdapter();
  }

  // Intentar conectar a Ollama
  const ollamaAdapter = new OllamaAdapter();
  try {
    const isAvailable = await ollamaAdapter.healthCheck();
    if (isAvailable) {
      console.log("[AdapterFactory] Using OllamaAdapter");
      return ollamaAdapter;
    }
  } catch (error) {
    console.warn("[AdapterFactory] Ollama health check failed:", error);
  }

  // Fallback a Mock
  console.log("[AdapterFactory] Ollama unavailable, using MockAdapter");
  return new MockAdapter();
}

/**
 * Obtiene el adaptador de agentes (singleton)
 *
 * Si el adaptador no ha sido inicializado, lo crea.
 * Las llamadas concurrentes durante la inicialización
 * esperan el mismo Promise.
 *
 * @returns El adaptador singleton
 */
export async function getAgentAdapter(): Promise<IAgentAdapter> {
  if (activeAdapter) {
    return activeAdapter;
  }

  // Evitar múltiples inicializaciones concurrentes
  if (!adapterInitPromise) {
    adapterInitPromise = createAgentAdapter().then((adapter) => {
      activeAdapter = adapter;
      return adapter;
    });
  }

  return adapterInitPromise;
}

/**
 * Reinicia el adaptador, forzando una nueva detección
 *
 * Útil cuando se sabe que el backend ha cambiado de estado
 * (ej: Ollama se inició después del dashboard)
 */
export async function resetAdapter(): Promise<IAgentAdapter> {
  activeAdapter = null;
  adapterInitPromise = null;
  return getAgentAdapter();
}

/**
 * Obtiene información del adaptador actual
 * sin forzar inicialización
 */
export function getAdapterInfo(): { name: string; initialized: boolean } | null {
  if (!activeAdapter) {
    return null;
  }
  return {
    name: activeAdapter.name,
    initialized: true,
  };
}

/**
 * Verifica si el adaptador actual es el de mock
 */
export function isUsingMock(): boolean {
  return activeAdapter?.name === "MockAdapter";
}

/**
 * Verifica si el adaptador actual es el de Ollama
 */
export function isUsingOllama(): boolean {
  return activeAdapter?.name === "OllamaAdapter";
}
