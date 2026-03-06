/**
 * Component Registry Types
 *
 * Type definitions for the component registry system.
 * These types enable bots to understand and manipulate components programmatically.
 */

import { ComponentType, ReactNode } from "react";

// ============================================
// PROP SCHEMA TYPES
// ============================================

export type PropType =
  | "string"
  | "number"
  | "boolean"
  | "array"
  | "object"
  | "function"
  | "node"
  | "element"
  | "enum"
  | "union";

export interface PropSchema {
  /** The type of the prop */
  type: PropType;

  /** Human-readable description */
  description: string;

  /** Whether this prop is required */
  required: boolean;

  /** Default value if not provided */
  defaultValue?: unknown;

  /** For enum types, the allowed values */
  enumValues?: string[];

  /** For union types, the possible types */
  unionTypes?: PropType[];

  /** For array types, the type of items */
  itemType?: PropType;

  /** For object types, nested schema */
  objectSchema?: Record<string, PropSchema>;

  /** Example values for documentation */
  examples?: unknown[];
}

export type PropsSchema = Record<string, PropSchema>;

// ============================================
// COMPONENT METADATA
// ============================================

export type ComponentCategory =
  | "ui"
  | "layout"
  | "chart"
  | "dashboard"
  | "chat"
  | "form"
  | "navigation"
  | "feedback";

export interface ComponentMetadata {
  /** Unique identifier for the component */
  id: string;

  /** Display name */
  name: string;

  /** Human-readable description */
  description: string;

  /** Component category for organization */
  category: ComponentCategory;

  /** Tags for search and filtering */
  tags: string[];

  /** Version of the component */
  version: string;

  /** Schema describing the component's props */
  propsSchema: PropsSchema;

  /** Default props to use when creating instances */
  defaultProps?: Record<string, unknown>;

  /** Example configurations */
  examples?: ComponentExample[];

  /** Whether this component can contain children */
  acceptsChildren: boolean;

  /** If true, this component can be used as a data-bound component */
  dataBindable: boolean;

  /** Data schema if dataBindable is true */
  dataSchema?: PropsSchema;

  /** Dependencies on other components */
  dependencies?: string[];
}

export interface ComponentExample {
  name: string;
  description: string;
  props: Record<string, unknown>;
  code?: string;
}

// ============================================
// REGISTERED COMPONENT
// ============================================

export interface RegisteredComponent<P = Record<string, unknown>> {
  /** Component metadata */
  metadata: ComponentMetadata;

  /** The actual React component */
  component: ComponentType<P>;

  /** Factory function to create component with validated props */
  create: (props: Partial<P>) => ReactNode;

  /** Validate props against schema */
  validateProps: (props: unknown) => ValidationResult;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

export interface ValidationError {
  path: string;
  message: string;
  received: unknown;
  expected: string;
}

// ============================================
// REGISTRY QUERY TYPES
// ============================================

export interface ComponentQuery {
  /** Filter by category */
  category?: ComponentCategory | ComponentCategory[];

  /** Filter by tags (matches any) */
  tags?: string[];

  /** Search in name and description */
  search?: string;

  /** Only data-bindable components */
  dataBindable?: boolean;

  /** Only components that accept children */
  acceptsChildren?: boolean;
}

export interface ComponentQueryResult {
  components: ComponentMetadata[];
  total: number;
}

// ============================================
// COMPONENT INSTANCE
// ============================================

export interface ComponentInstance {
  /** Unique instance ID */
  instanceId: string;

  /** Component ID from registry */
  componentId: string;

  /** Props for this instance */
  props: Record<string, unknown>;

  /** Children instances (for containers) */
  children?: ComponentInstance[];

  /** Data binding configuration */
  dataBinding?: DataBinding;

  /** Layout position/sizing */
  layout?: LayoutConfig;
}

export interface DataBinding {
  /** Data source ID */
  sourceId: string;

  /** Mapping from data fields to props */
  fieldMappings: Record<string, string>;

  /** Transform function name (if any) */
  transform?: string;
}

export interface LayoutConfig {
  /** Grid column span */
  colSpan?: number;

  /** Grid row span */
  rowSpan?: number;

  /** Order in container */
  order?: number;

  /** Custom width */
  width?: string;

  /** Custom height */
  height?: string;

  /** Visibility condition */
  visible?: boolean | string;
}
