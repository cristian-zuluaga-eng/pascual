// ============================================================================
// RE-EXPORT DE TODOS LOS MODULOS
// ============================================================================

// Asistente
export * from "./asistente";

// Nexus
export * from "./nexus";

// Sentinel
export * from "./sentinel";

// Scout
export * from "./scout";

// Audiovisual
export * from "./audiovisual";

// Consultor
export * from "./consultor";

// Gambito
export * from "./gambito";

// Condor360
export * from "./condor360";

// Picasso
export * from "./picasso";

// ============================================================================
// EXPORT ALL DATA - Objeto con todos los datos de modulos
// ============================================================================

import { asistenteData } from "./asistente";
import { nexusData } from "./nexus";
import { sentinelData } from "./sentinel";
import { scoutData } from "./scout";
import { audiovisualData } from "./audiovisual";
import { consultorData } from "./consultor";
import { gambitoData } from "./gambito";
import { condor360Data } from "./condor360";
import { picassoData } from "./picasso";

export const allModulesData = {
  asistente: asistenteData,
  nexus: nexusData,
  sentinel: sentinelData,
  scout: scoutData,
  audiovisual: audiovisualData,
  consultor: consultorData,
  gambito: gambitoData,
  condor360: condor360Data,
  picasso: picassoData,
};

// Alias para compatibilidad
export const allAgentsData = allModulesData;

export type ModuleId = keyof typeof allModulesData;
export type AgentId = ModuleId;
