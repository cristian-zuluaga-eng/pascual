/**
 * Pascual Dashboard Library
 *
 * Main entry point for the dashboard library.
 * Import from here for the complete API.
 */

// Bot API (main interface for bots)
export { botAPI, default } from "./bot-api";

// Registry system
export { registry, registerComponent } from "./registry";
export type {
  ComponentMetadata,
  ComponentQuery,
  ComponentInstance,
  PropsSchema,
  PropSchema,
} from "./registry/types";

// Data provider system
export { dataProvider } from "./data";
export {
  useDataSource,
  useMultipleDataSources,
  useDataSetter,
  useDerivedData,
  useDataEvents,
  useDataReady,
} from "./data/hooks";
export type {
  DataSourceConfig,
  DataState,
  DataStatus,
} from "./data/types";

// Dashboard builder
export { dashboardBuilder } from "./builder";
export { DashboardRenderer, DashboardPreview } from "./builder/renderer";
export type {
  DashboardConfig,
  DashboardTemplate,
  DashboardLayout,
} from "./builder/types";

// Theme system
export {
  theme,
  colors,
  spacing,
  typography,
  shadows,
  animations,
  radii,
  zIndex,
  breakpoints,
  getColor,
  getSpacing,
  getShadow,
} from "./theme";
