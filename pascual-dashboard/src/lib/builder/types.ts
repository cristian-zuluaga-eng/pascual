/**
 * Dashboard Builder Types
 *
 * Type definitions for building dashboards programmatically.
 * Bots can use these types to create, modify, and manage dashboard configurations.
 */

import { ComponentInstance, LayoutConfig } from "../registry/types";

// ============================================
// DASHBOARD CONFIGURATION
// ============================================

export interface DashboardConfig {
  /** Unique identifier */
  id: string;

  /** Dashboard name */
  name: string;

  /** Description */
  description: string;

  /** Version for tracking changes */
  version: string;

  /** Layout configuration */
  layout: DashboardLayout;

  /** Component instances */
  components: ComponentInstance[];

  /** Data source bindings */
  dataSources: DataSourceBinding[];

  /** Theme overrides */
  theme?: ThemeOverrides;

  /** Metadata for bot management */
  metadata: DashboardMetadata;
}

export interface DashboardLayout {
  /** Layout type */
  type: "grid" | "flex" | "fixed";

  /** Number of columns (for grid) */
  columns?: number;

  /** Gap between items */
  gap?: string;

  /** Regions/areas for component placement */
  regions?: LayoutRegion[];

  /** Sidebar configuration */
  sidebar?: SidebarConfig;

  /** Header configuration */
  header?: HeaderConfig;
}

export interface LayoutRegion {
  /** Region identifier */
  id: string;

  /** Region name */
  name: string;

  /** Grid area or flex order */
  area?: string;

  /** Default size */
  defaultSize?: { width?: string; height?: string };

  /** Whether region can be collapsed */
  collapsible?: boolean;
}

export interface SidebarConfig {
  /** Whether sidebar is enabled */
  enabled: boolean;

  /** Initial state */
  collapsed?: boolean;

  /** Position */
  position?: "left" | "right";

  /** Width when expanded */
  width?: string;

  /** Width when collapsed */
  collapsedWidth?: string;
}

export interface HeaderConfig {
  /** Whether header is enabled */
  enabled: boolean;

  /** Header height */
  height?: string;

  /** Show search */
  showSearch?: boolean;

  /** Show notifications */
  showNotifications?: boolean;

  /** Show user menu */
  showUserMenu?: boolean;
}

// ============================================
// DATA SOURCE BINDING
// ============================================

export interface DataSourceBinding {
  /** Binding identifier */
  id: string;

  /** Data source ID from data provider */
  sourceId: string;

  /** Component instances that use this data */
  consumers: ComponentDataConsumer[];

  /** Refresh configuration */
  refresh?: RefreshConfig;
}

export interface ComponentDataConsumer {
  /** Component instance ID */
  instanceId: string;

  /** Mapping from data fields to component props */
  propMappings: Record<string, string | DataMapping>;
}

export interface DataMapping {
  /** Source field path (dot notation) */
  field: string;

  /** Optional transform function name */
  transform?: string;

  /** Default value if field is missing */
  defaultValue?: unknown;
}

export interface RefreshConfig {
  /** Auto-refresh enabled */
  enabled: boolean;

  /** Refresh interval in ms */
  interval?: number;

  /** Refresh on visibility change */
  onVisibilityChange?: boolean;
}

// ============================================
// THEME OVERRIDES
// ============================================

export interface ThemeOverrides {
  /** Color overrides */
  colors?: Record<string, string>;

  /** Spacing overrides */
  spacing?: Record<string, string>;

  /** Typography overrides */
  typography?: {
    fontFamily?: string;
    fontSize?: Record<string, string>;
  };

  /** Custom CSS */
  customCSS?: string;
}

// ============================================
// DASHBOARD METADATA
// ============================================

export interface DashboardMetadata {
  /** Creation timestamp */
  createdAt: string;

  /** Last modified timestamp */
  updatedAt: string;

  /** Creator (user or bot ID) */
  createdBy: string;

  /** Last modifier */
  updatedBy: string;

  /** Tags for organization */
  tags: string[];

  /** Whether this is a template */
  isTemplate: boolean;

  /** Parent template ID if derived from template */
  templateId?: string;

  /** Custom metadata fields */
  custom?: Record<string, unknown>;
}

// ============================================
// DASHBOARD OPERATIONS
// ============================================

export interface DashboardOperation {
  type: DashboardOperationType;
  target: string; // Component instance ID or path
  payload: unknown;
  timestamp: number;
}

export type DashboardOperationType =
  | "component:add"
  | "component:remove"
  | "component:update"
  | "component:move"
  | "layout:update"
  | "datasource:bind"
  | "datasource:unbind"
  | "theme:update";

// ============================================
// DASHBOARD TEMPLATES
// ============================================

export interface DashboardTemplate {
  /** Template ID */
  id: string;

  /** Template name */
  name: string;

  /** Description */
  description: string;

  /** Preview image URL */
  previewUrl?: string;

  /** Category */
  category: string;

  /** Tags */
  tags: string[];

  /** The dashboard configuration */
  config: Omit<DashboardConfig, "id" | "metadata">;

  /** Customizable slots */
  slots: TemplateSlot[];
}

export interface TemplateSlot {
  /** Slot identifier */
  id: string;

  /** Slot name */
  name: string;

  /** Description */
  description: string;

  /** Accepted component types */
  acceptedComponents: string[];

  /** Default component */
  defaultComponent?: string;

  /** Whether slot is required */
  required: boolean;
}

// ============================================
// VALIDATION
// ============================================

export interface DashboardValidationResult {
  valid: boolean;
  errors: DashboardValidationError[];
  warnings: DashboardValidationWarning[];
}

export interface DashboardValidationError {
  code: string;
  message: string;
  path: string;
  severity: "error";
}

export interface DashboardValidationWarning {
  code: string;
  message: string;
  path: string;
  severity: "warning";
}
