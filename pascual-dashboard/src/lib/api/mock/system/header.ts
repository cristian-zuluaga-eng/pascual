// ============================================================================
// SYSTEM RESOURCES (RAM / VRAM)
// ============================================================================

import { DeepPartial, mergeWithDefaults } from "../types/base";

/**
 * Recurso de memoria individual (RAM o VRAM)
 */
export interface MemoryResource {
  used: number;
  total: number;
}

/**
 * Recursos del sistema para monitoreo en el Header
 */
export interface SystemResources {
  ram: MemoryResource;
  vram: MemoryResource;
}

const defaultSystemResources: SystemResources = {
  ram: {
    used: 12.4,
    total: 32,
  },
  vram: {
    used: 18.2,
    total: 24,
  },
};

export function getSystemResources(
  partial?: DeepPartial<SystemResources>
): SystemResources {
  return mergeWithDefaults(partial, defaultSystemResources);
}

export const mockSystemResources = defaultSystemResources;

/**
 * Calcula el porcentaje de uso de un recurso de memoria
 */
export const getMemoryPercentage = (resource: MemoryResource): number => {
  return Math.round((resource.used / resource.total) * 100);
};

/**
 * Obtiene el color segun el porcentaje de uso
 * - Verde (#39ff14): < 75% - Normal
 * - Ambar (#ffaa00): 75-89% - Warning
 * - Rosa (#ff006e): >= 90% - Critico
 */
export const getUsageColor = (percentage: number): string => {
  if (percentage >= 90) return "#ff006e";
  if (percentage >= 75) return "#ffaa00";
  return "#39ff14";
};

/**
 * Obtiene el estado segun el porcentaje de uso
 */
export const getUsageStatus = (percentage: number): "good" | "warning" | "critical" => {
  if (percentage >= 90) return "critical";
  if (percentage >= 75) return "warning";
  return "good";
};
