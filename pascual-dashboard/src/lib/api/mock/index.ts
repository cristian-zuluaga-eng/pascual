// ============================================================================
// CENTRAL EXPORT - MOCK DATA
// ============================================================================
//
// Este archivo re-exporta toda la mock data organizada por modulos.
// La estructura permite facil intercambio con APIs reales en produccion.
//
// ESTRUCTURA:
// - types/     -> Tipos base y utilidades (DeepPartial, mergeWithDefaults)
// - system/    -> Recursos del sistema, stats, agentes reales
// - modules/   -> Datos especificos de cada modulo del dashboard
//
// ============================================================================

// Tipos base y utilidades
export * from "./types";

// Sistema (header, dashboard stats, agentes)
export * from "./system";

// Todos los modulos
export * from "./modules";

// ============================================================================
// LEGACY EXPORTS - Para compatibilidad con codigo existente
// ============================================================================

// Re-export de finance.ts (legacy)
export * from "./finance";

// Re-export de security.ts (legacy)
export * from "./security";
