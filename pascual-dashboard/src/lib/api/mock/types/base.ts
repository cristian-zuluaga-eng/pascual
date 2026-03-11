// ============================================================================
// TIPOS BASE COMPARTIDOS
// ============================================================================
//
// Este archivo contiene tipos y utilidades base compartidas por todos los modulos.
// DeepPartial permite validar datos parciales suministrados por bots.
//
// NOMENCLATURA:
// - "Modulo" = Secciones del dashboard (Asistente, Sentinel, Scout, etc.)
// - "Agente" = Los 4 agentes reales: Pascual, Hunter, Warden, Nexus
// ============================================================================

/**
 * Hace todos los campos de un tipo recursivamente opcionales.
 * Usado para validar datos parciales suministrados por bots.
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends Array<infer U>
    ? Array<DeepPartial<U>>
    : T[P] extends object
    ? DeepPartial<T[P]>
    : T[P];
};

/**
 * Valida y fusiona datos parciales con defaults
 */
export function mergeWithDefaults<T extends object>(
  partial: DeepPartial<T> | undefined,
  defaults: T
): T {
  if (!partial) return defaults;

  const result = { ...defaults };
  for (const key in partial) {
    if (partial[key] !== undefined) {
      const partialValue = partial[key];
      const defaultValue = defaults[key as keyof T];

      if (Array.isArray(partialValue)) {
        (result as Record<string, unknown>)[key] = partialValue;
      } else if (typeof partialValue === 'object' && partialValue !== null) {
        (result as Record<string, unknown>)[key] = mergeWithDefaults(
          partialValue as DeepPartial<object>,
          defaultValue as object
        );
      } else {
        (result as Record<string, unknown>)[key] = partialValue;
      }
    }
  }
  return result;
}

// ============================================================================
// ESTADOS Y PRIORIDADES
// ============================================================================

export type ModuleStatus = "active" | "busy" | "idle" | "offline" | "error";
export type Priority = "critical" | "high" | "medium" | "low";
export type ConvictionLevel = "high" | "medium" | "low";

// Alias para compatibilidad
export type AgentStatus = ModuleStatus;

// ============================================================================
// INTERFACES BASE DE ACCIONES Y MENSAJES
// ============================================================================

export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  prompt: string;
}

export interface PascualMessage {
  id: string;
  timestamp: string;
  moduleId: string;
  query: string;
  response: string;
  confidence?: number;
  suggestedActions?: string[];
}

// ============================================================================
// INTERFACE BASE DE MODULO
// ============================================================================

export interface ModuleBase {
  id: string;
  name: string;
  icon: string;
  lema: string;
  description: string;
  status: ModuleStatus;
  lastSync: string;
  quickActions: QuickAction[];
  recentMessages: PascualMessage[];
}

// Alias para compatibilidad con codigo existente
export type AgentBase = ModuleBase;
