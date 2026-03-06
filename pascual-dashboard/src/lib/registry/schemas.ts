/**
 * Common Prop Schemas
 *
 * Reusable prop schema definitions for component registration.
 * Bots can reference these schemas when creating component definitions.
 */

import { PropsSchema, PropSchema } from "./types";

// ============================================
// PRIMITIVE SCHEMAS
// ============================================

export const stringProp = (
  description: string,
  required = false,
  defaultValue?: string
): PropSchema => ({
  type: "string",
  description,
  required,
  defaultValue,
});

export const numberProp = (
  description: string,
  required = false,
  defaultValue?: number
): PropSchema => ({
  type: "number",
  description,
  required,
  defaultValue,
});

export const booleanProp = (
  description: string,
  required = false,
  defaultValue?: boolean
): PropSchema => ({
  type: "boolean",
  description,
  required,
  defaultValue,
});

export const enumProp = (
  description: string,
  values: string[],
  required = false,
  defaultValue?: string
): PropSchema => ({
  type: "enum",
  description,
  required,
  defaultValue,
  enumValues: values,
});

export const arrayProp = (
  description: string,
  itemType: PropSchema["type"] = "object",
  required = false
): PropSchema => ({
  type: "array",
  description,
  required,
  itemType,
});

export const objectProp = (
  description: string,
  schema?: Record<string, PropSchema>,
  required = false
): PropSchema => ({
  type: "object",
  description,
  required,
  objectSchema: schema,
});

export const nodeProp = (description: string, required = false): PropSchema => ({
  type: "node",
  description,
  required,
});

export const functionProp = (description: string, required = false): PropSchema => ({
  type: "function",
  description,
  required,
});

// ============================================
// COMMON COMPOSITE SCHEMAS
// ============================================

/**
 * Standard className prop
 */
export const classNameSchema: PropSchema = {
  type: "string",
  description: "Additional CSS classes to apply",
  required: false,
  defaultValue: "",
};

/**
 * Standard children prop
 */
export const childrenSchema: PropSchema = {
  type: "node",
  description: "Child elements to render",
  required: false,
};

/**
 * Variant prop for styled components
 */
export const variantSchema = (
  variants: string[],
  defaultVariant: string
): PropSchema => ({
  type: "enum",
  description: "Visual variant of the component",
  required: false,
  enumValues: variants,
  defaultValue: defaultVariant,
});

/**
 * Size prop for scalable components
 */
export const sizeSchema = (defaultSize = "md"): PropSchema => ({
  type: "enum",
  description: "Size of the component",
  required: false,
  enumValues: ["xs", "sm", "md", "lg", "xl"],
  defaultValue: defaultSize,
});

/**
 * Status prop for state indicators
 */
export const statusSchema: PropSchema = {
  type: "enum",
  description: "Status state of the component",
  required: false,
  enumValues: ["active", "busy", "offline", "error", "success", "warning"],
  defaultValue: "active",
};

/**
 * Color prop using theme colors
 */
export const colorSchema: PropSchema = {
  type: "string",
  description: "Color from theme tokens (e.g., 'accent.cyan') or hex value",
  required: false,
  defaultValue: "accent.cyan",
  examples: ["accent.cyan", "accent.pink", "accent.green", "#00d9ff"],
};

/**
 * Trend data for stat cards
 */
export const trendSchema: PropSchema = {
  type: "object",
  description: "Trend indicator data",
  required: false,
  objectSchema: {
    value: numberProp("Trend percentage value", true),
    positive: booleanProp("Whether trend is positive", true),
  },
};

/**
 * Data point for charts
 */
export const dataPointSchema: PropSchema = {
  type: "object",
  description: "Single data point for charts",
  required: true,
  objectSchema: {
    name: stringProp("Label for the data point", true),
    value: numberProp("Numeric value", true),
    color: stringProp("Optional color override", false),
  },
};

/**
 * Chart data array
 */
export const chartDataSchema: PropSchema = {
  type: "array",
  description: "Array of data points for the chart",
  required: true,
  itemType: "object",
};

// ============================================
// COMPONENT-SPECIFIC SCHEMAS
// ============================================

/**
 * Card component props schema
 */
export const cardPropsSchema: PropsSchema = {
  children: childrenSchema,
  className: classNameSchema,
  variant: variantSchema(["default", "success", "danger", "warning", "info"], "default"),
  glow: booleanProp("Enable glow effect on hover", false, true),
};

/**
 * Button component props schema
 */
export const buttonPropsSchema: PropsSchema = {
  children: { ...childrenSchema, required: true },
  variant: variantSchema(["primary", "secondary", "danger", "ghost"], "primary"),
  size: sizeSchema("md"),
  fullWidth: booleanProp("Make button full width", false, false),
  loading: booleanProp("Show loading state", false, false),
  disabled: booleanProp("Disable the button", false, false),
  onClick: functionProp("Click handler"),
  className: classNameSchema,
};

/**
 * Badge component props schema
 */
export const badgePropsSchema: PropsSchema = {
  children: { ...childrenSchema, required: true },
  variant: variantSchema(["default", "success", "warning", "danger", "info"], "default"),
  pulse: booleanProp("Enable pulse animation", false, false),
  className: classNameSchema,
};

/**
 * StatCard component props schema
 */
export const statCardPropsSchema: PropsSchema = {
  title: stringProp("Card title", true),
  value: {
    type: "union",
    description: "Main value to display",
    required: true,
    unionTypes: ["string", "number"],
  },
  trend: trendSchema,
  icon: nodeProp("Icon element to display"),
  variant: variantSchema(["default", "success", "danger", "warning", "info"], "default"),
};

/**
 * LineChart component props schema
 */
export const lineChartPropsSchema: PropsSchema = {
  data: chartDataSchema,
  dataKey: stringProp("Key in data object for Y values", false, "value"),
  height: numberProp("Chart height in pixels", false, 120),
  color: colorSchema,
  showAxis: booleanProp("Show X and Y axis", false, true),
  showTooltip: booleanProp("Show tooltip on hover", false, true),
};

/**
 * Agent data schema (for AgentCard)
 */
export const agentSchema: PropSchema = {
  type: "object",
  description: "Agent data object",
  required: true,
  objectSchema: {
    id: stringProp("Unique agent ID", true),
    name: stringProp("Agent display name", true),
    model: stringProp("AI model name", true),
    role: enumProp(
      "Agent role",
      ["general", "financial", "security", "assistant", "development"],
      true
    ),
    status: enumProp("Current status", ["active", "busy", "offline", "error"], true),
    activeTasks: numberProp("Number of active tasks", true),
    usageHistory: arrayProp("Historical usage data", "number", true),
  },
};

/**
 * AgentCard component props schema
 */
export const agentCardPropsSchema: PropsSchema = {
  agent: agentSchema,
  onConfigure: functionProp("Handler for configure button click"),
};

/**
 * ActivityItem data schema
 */
export const activityItemSchema: PropSchema = {
  type: "object",
  description: "Activity feed item",
  required: true,
  objectSchema: {
    id: stringProp("Unique item ID", true),
    type: enumProp("Activity type", ["agent", "security", "system", "task"], true),
    title: stringProp("Activity title", true),
    description: stringProp("Optional description", false),
    timestamp: stringProp("When the activity occurred", true),
    agentName: stringProp("Related agent name", false),
  },
};

/**
 * ActivityFeed component props schema
 */
export const activityFeedPropsSchema: PropsSchema = {
  activities: {
    type: "array",
    description: "Array of activity items",
    required: true,
    itemType: "object",
  },
  maxItems: numberProp("Maximum items to display", false, 10),
};

// ============================================
// LAYOUT SCHEMAS
// ============================================

/**
 * Grid component props schema
 */
export const gridPropsSchema: PropsSchema = {
  children: childrenSchema,
  cols: enumProp("Number of columns", ["1", "2", "3", "4", "5", "6"], false, "4"),
  gap: enumProp("Gap between items", ["sm", "md", "lg"], false, "md"),
  className: classNameSchema,
};

/**
 * Section component props schema
 */
export const sectionPropsSchema: PropsSchema = {
  children: childrenSchema,
  className: classNameSchema,
};

// ============================================
// EXPORT ALL SCHEMAS
// ============================================

export const schemas = {
  // Primitives
  string: stringProp,
  number: numberProp,
  boolean: booleanProp,
  enum: enumProp,
  array: arrayProp,
  object: objectProp,
  node: nodeProp,
  function: functionProp,

  // Common
  className: classNameSchema,
  children: childrenSchema,
  variant: variantSchema,
  size: sizeSchema,
  status: statusSchema,
  color: colorSchema,
  trend: trendSchema,
  dataPoint: dataPointSchema,
  chartData: chartDataSchema,

  // Component-specific
  card: cardPropsSchema,
  button: buttonPropsSchema,
  badge: badgePropsSchema,
  statCard: statCardPropsSchema,
  lineChart: lineChartPropsSchema,
  agent: agentSchema,
  agentCard: agentCardPropsSchema,
  activityItem: activityItemSchema,
  activityFeed: activityFeedPropsSchema,
  grid: gridPropsSchema,
  section: sectionPropsSchema,
};

export default schemas;
