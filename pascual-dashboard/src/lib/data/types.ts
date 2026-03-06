/**
 * Data Provider Types
 *
 * Types for the data provider system that separates data fetching from UI components.
 * Bots can register and manage data sources programmatically.
 */

// ============================================
// DATA SOURCE TYPES
// ============================================

export type DataSourceType = "static" | "api" | "websocket" | "polling" | "computed";

export interface DataSourceConfig {
  /** Unique identifier for the data source */
  id: string;

  /** Human-readable name */
  name: string;

  /** Type of data source */
  type: DataSourceType;

  /** Description of what data this source provides */
  description: string;

  /** Schema describing the shape of the data */
  schema: DataSchema;

  /** Configuration specific to the data source type */
  config: DataSourceTypeConfig;

  /** Transform function to apply to raw data */
  transform?: string;

  /** Cache configuration */
  cache?: CacheConfig;

  /** Dependencies on other data sources */
  dependencies?: string[];
}

export type DataSourceTypeConfig =
  | StaticDataConfig
  | ApiDataConfig
  | WebSocketDataConfig
  | PollingDataConfig
  | ComputedDataConfig;

export interface StaticDataConfig {
  type: "static";
  data: unknown;
}

export interface ApiDataConfig {
  type: "api";
  endpoint: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  headers?: Record<string, string>;
  body?: unknown;
}

export interface WebSocketDataConfig {
  type: "websocket";
  url: string;
  channel: string;
  reconnect?: boolean;
  reconnectInterval?: number;
}

export interface PollingDataConfig {
  type: "polling";
  endpoint: string;
  interval: number; // milliseconds
  method?: "GET" | "POST";
}

export interface ComputedDataConfig {
  type: "computed";
  sources: string[]; // IDs of source data providers
  compute: string; // Name of compute function
}

// ============================================
// DATA SCHEMA
// ============================================

export type DataFieldType =
  | "string"
  | "number"
  | "boolean"
  | "date"
  | "array"
  | "object"
  | "any";

export interface DataFieldSchema {
  type: DataFieldType;
  description: string;
  nullable?: boolean;
  itemType?: DataFieldType; // For arrays
  fields?: Record<string, DataFieldSchema>; // For objects
}

export interface DataSchema {
  type: "object" | "array";
  description: string;
  fields?: Record<string, DataFieldSchema>;
  itemSchema?: DataFieldSchema;
}

// ============================================
// CACHE CONFIGURATION
// ============================================

export interface CacheConfig {
  /** Whether caching is enabled */
  enabled: boolean;

  /** Time-to-live in milliseconds */
  ttl: number;

  /** Cache key generator function name */
  keyGenerator?: string;

  /** Whether to serve stale data while revalidating */
  staleWhileRevalidate?: boolean;
}

// ============================================
// DATA STATE
// ============================================

export type DataStatus = "idle" | "loading" | "success" | "error" | "stale";

export interface DataState<T = unknown> {
  /** Current status of the data */
  status: DataStatus;

  /** The actual data (if loaded) */
  data: T | null;

  /** Error message (if status is error) */
  error: string | null;

  /** Timestamp of last successful fetch */
  lastUpdated: number | null;

  /** Whether data is being refreshed in background */
  isRefreshing: boolean;
}

// ============================================
// DATA SUBSCRIPTION
// ============================================

export interface DataSubscription {
  /** Subscription ID */
  id: string;

  /** Data source ID */
  sourceId: string;

  /** Callback for data updates */
  callback: (state: DataState) => void;

  /** Optional filter for updates */
  filter?: DataFilter;
}

export interface DataFilter {
  /** Only trigger on specific status changes */
  status?: DataStatus[];

  /** Debounce updates by milliseconds */
  debounce?: number;

  /** Only trigger if data actually changed */
  distinctUntilChanged?: boolean;
}

// ============================================
// TRANSFORM FUNCTIONS
// ============================================

export type TransformFunction<TInput = unknown, TOutput = unknown> = (
  data: TInput,
  context?: TransformContext
) => TOutput;

export interface TransformContext {
  /** Other data sources that can be accessed */
  sources: Record<string, DataState>;

  /** Current timestamp */
  timestamp: number;

  /** User-defined parameters */
  params?: Record<string, unknown>;
}

export interface TransformRegistration {
  /** Unique name for the transform */
  name: string;

  /** Description of what the transform does */
  description: string;

  /** The transform function */
  fn: TransformFunction;

  /** Input schema */
  inputSchema?: DataSchema;

  /** Output schema */
  outputSchema?: DataSchema;
}

// ============================================
// DATA PROVIDER EVENTS
// ============================================

export type DataEventType =
  | "data:updated"
  | "data:error"
  | "data:loading"
  | "source:registered"
  | "source:unregistered"
  | "connection:opened"
  | "connection:closed";

export interface DataEvent {
  type: DataEventType;
  sourceId: string;
  timestamp: number;
  payload?: unknown;
}

// ============================================
// MOCK DATA CONFIGURATION
// ============================================

export interface MockDataConfig {
  /** Whether to use mock data */
  enabled: boolean;

  /** Delay to simulate network latency */
  delay?: number;

  /** Probability of error (0-1) for testing */
  errorRate?: number;

  /** Mock data generators by source ID */
  generators?: Record<string, () => unknown>;
}
