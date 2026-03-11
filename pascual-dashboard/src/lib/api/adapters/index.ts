/**
 * Adapters Module
 *
 * Exporta todos los adaptadores y utilidades relacionadas.
 */

// Tipos y configuración
export * from "./types";

// Factory (punto de entrada principal)
export {
  getAgentAdapter,
  createAgentAdapter,
  resetAdapter,
  getAdapterInfo,
  isUsingMock,
  isUsingOllama,
} from "./factory";

// Adaptadores individuales (para uso directo si es necesario)
export { OllamaAdapter } from "./ollamaAdapter";
export { MockAdapter } from "./mockAdapter";
export { openClawAdapter, OpenClawAdapterClass } from "./openClawAdapter";
