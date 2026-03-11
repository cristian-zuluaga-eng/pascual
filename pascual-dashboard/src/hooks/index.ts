// ============================================================================
// HOOKS - Exportación centralizada
// ============================================================================

// Filtrado y búsqueda
export {
  useFilteredData,
  useCategoryFilter,
  useSearch,
} from "./useFilteredData";

// Dashboard de agentes
export {
  useAgentDashboard,
  useAgentKPIs,
  useTimeRangeData,
  useTimeRangeValue,
} from "./useAgentDashboard";

// Accesibilidad y performance
export {
  useReducedMotion,
  useIsVisible,
  useShouldAnimate,
} from "./useReducedMotion";
