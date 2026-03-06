/**
 * Data Provider Manager
 *
 * Central manager for all data sources in the dashboard.
 * Enables bots to register, query, and manage data sources programmatically.
 */

import {
  DataSourceConfig,
  DataState,
  DataStatus,
  DataSubscription,
  DataEvent,
  DataEventType,
  TransformFunction,
  TransformRegistration,
  MockDataConfig,
} from "./types";

class DataProviderManager {
  private sources: Map<string, DataSourceConfig> = new Map();
  private states: Map<string, DataState> = new Map();
  private subscriptions: Map<string, Set<DataSubscription>> = new Map();
  private transforms: Map<string, TransformRegistration> = new Map();
  private eventListeners: Set<(event: DataEvent) => void> = new Set();
  private mockConfig: MockDataConfig = { enabled: false };

  // Active connections for WebSocket sources
  private connections: Map<string, WebSocket> = new Map();

  // Polling intervals
  private pollingIntervals: Map<string, NodeJS.Timeout> = new Map();

  // ============================================
  // DATA SOURCE REGISTRATION
  // ============================================

  /**
   * Register a new data source
   */
  registerSource(config: DataSourceConfig): void {
    if (this.sources.has(config.id)) {
      console.warn(`Data source "${config.id}" already exists. Overwriting.`);
      this.unregisterSource(config.id);
    }

    this.sources.set(config.id, config);
    this.states.set(config.id, this.createInitialState());
    this.subscriptions.set(config.id, new Set());

    this.emit({
      type: "source:registered",
      sourceId: config.id,
      timestamp: Date.now(),
    });

    // Initialize the data source based on type
    this.initializeSource(config);
  }

  /**
   * Unregister a data source
   */
  unregisterSource(sourceId: string): boolean {
    // Cleanup connections
    this.cleanupSource(sourceId);

    const deleted = this.sources.delete(sourceId);
    this.states.delete(sourceId);
    this.subscriptions.delete(sourceId);

    if (deleted) {
      this.emit({
        type: "source:unregistered",
        sourceId,
        timestamp: Date.now(),
      });
    }

    return deleted;
  }

  /**
   * Get a data source configuration
   */
  getSource(sourceId: string): DataSourceConfig | undefined {
    return this.sources.get(sourceId);
  }

  /**
   * Get all registered source IDs
   */
  getSourceIds(): string[] {
    return Array.from(this.sources.keys());
  }

  /**
   * Get all source configurations
   */
  getAllSources(): DataSourceConfig[] {
    return Array.from(this.sources.values());
  }

  // ============================================
  // DATA STATE MANAGEMENT
  // ============================================

  /**
   * Get current state of a data source
   */
  getState<T = unknown>(sourceId: string): DataState<T> | undefined {
    return this.states.get(sourceId) as DataState<T> | undefined;
  }

  /**
   * Get data from a source (convenience method)
   */
  getData<T = unknown>(sourceId: string): T | null {
    return this.states.get(sourceId)?.data as T | null;
  }

  /**
   * Update the state of a data source
   */
  private updateState(sourceId: string, updates: Partial<DataState>): void {
    const currentState = this.states.get(sourceId);
    if (!currentState) return;

    const newState: DataState = {
      ...currentState,
      ...updates,
    };

    this.states.set(sourceId, newState);
    this.notifySubscribers(sourceId, newState);
  }

  /**
   * Set data for a source
   */
  setData<T = unknown>(sourceId: string, data: T): void {
    this.updateState(sourceId, {
      status: "success",
      data,
      error: null,
      lastUpdated: Date.now(),
      isRefreshing: false,
    });

    this.emit({
      type: "data:updated",
      sourceId,
      timestamp: Date.now(),
      payload: data,
    });
  }

  /**
   * Set error state for a source
   */
  setError(sourceId: string, error: string): void {
    this.updateState(sourceId, {
      status: "error",
      error,
      isRefreshing: false,
    });

    this.emit({
      type: "data:error",
      sourceId,
      timestamp: Date.now(),
      payload: error,
    });
  }

  /**
   * Set loading state for a source
   */
  setLoading(sourceId: string, isRefreshing = false): void {
    this.updateState(sourceId, {
      status: isRefreshing ? "stale" : "loading",
      isRefreshing,
    });

    this.emit({
      type: "data:loading",
      sourceId,
      timestamp: Date.now(),
    });
  }

  // ============================================
  // SUBSCRIPTIONS
  // ============================================

  /**
   * Subscribe to data updates
   */
  subscribe(
    sourceId: string,
    callback: (state: DataState) => void,
    filter?: DataSubscription["filter"]
  ): () => void {
    const subscriptionSet = this.subscriptions.get(sourceId);
    if (!subscriptionSet) {
      console.warn(`Data source "${sourceId}" not found`);
      return () => {};
    }

    const subscription: DataSubscription = {
      id: `sub_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      sourceId,
      callback,
      filter,
    };

    subscriptionSet.add(subscription);

    // Immediately call with current state
    const currentState = this.states.get(sourceId);
    if (currentState) {
      callback(currentState);
    }

    // Return unsubscribe function
    return () => {
      subscriptionSet.delete(subscription);
    };
  }

  /**
   * Notify all subscribers of a state change
   */
  private notifySubscribers(sourceId: string, state: DataState): void {
    const subscriptions = this.subscriptions.get(sourceId);
    if (!subscriptions) return;

    subscriptions.forEach((sub) => {
      // Apply filters
      if (sub.filter?.status && !sub.filter.status.includes(state.status)) {
        return;
      }

      sub.callback(state);
    });
  }

  // ============================================
  // DATA FETCHING
  // ============================================

  /**
   * Fetch/refresh data for a source
   */
  async fetch(sourceId: string): Promise<void> {
    const config = this.sources.get(sourceId);
    if (!config) {
      console.error(`Data source "${sourceId}" not found`);
      return;
    }

    // Use mock data if enabled
    if (this.mockConfig.enabled) {
      await this.fetchMock(sourceId);
      return;
    }

    const sourceConfig = config.config;

    switch (sourceConfig.type) {
      case "static":
        this.setData(sourceId, sourceConfig.data);
        break;

      case "api":
        await this.fetchApi(sourceId, sourceConfig);
        break;

      case "computed":
        await this.computeData(sourceId, sourceConfig);
        break;

      // WebSocket and polling are handled by their initialization
      default:
        break;
    }
  }

  /**
   * Fetch from API endpoint
   */
  private async fetchApi(
    sourceId: string,
    config: { endpoint: string; method: string; headers?: Record<string, string>; body?: unknown }
  ): Promise<void> {
    this.setLoading(sourceId);

    try {
      const response = await fetch(config.endpoint, {
        method: config.method,
        headers: {
          "Content-Type": "application/json",
          ...config.headers,
        },
        body: config.body ? JSON.stringify(config.body) : undefined,
      });

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      const data = await response.json();
      const transformedData = this.applyTransform(sourceId, data);
      this.setData(sourceId, transformedData);
    } catch (error) {
      this.setError(sourceId, error instanceof Error ? error.message : "Unknown error");
    }
  }

  /**
   * Fetch mock data
   */
  private async fetchMock(sourceId: string): Promise<void> {
    this.setLoading(sourceId);

    // Simulate network delay
    if (this.mockConfig.delay) {
      await new Promise((resolve) => setTimeout(resolve, this.mockConfig.delay));
    }

    // Simulate errors
    if (this.mockConfig.errorRate && Math.random() < this.mockConfig.errorRate) {
      this.setError(sourceId, "Simulated error");
      return;
    }

    // Get mock data
    const generator = this.mockConfig.generators?.[sourceId];
    if (generator) {
      const data = generator();
      this.setData(sourceId, data);
    } else {
      // Fall back to static config data
      const config = this.sources.get(sourceId);
      if (config?.config.type === "static") {
        this.setData(sourceId, config.config.data);
      }
    }
  }

  /**
   * Compute data from other sources
   */
  private async computeData(
    sourceId: string,
    config: { sources: string[]; compute: string }
  ): Promise<void> {
    this.setLoading(sourceId);

    try {
      // Gather source data
      const sourceData: Record<string, unknown> = {};
      for (const depId of config.sources) {
        const state = this.states.get(depId);
        if (state?.status === "success") {
          sourceData[depId] = state.data;
        }
      }

      // Get compute function
      const computeFn = this.transforms.get(config.compute);
      if (!computeFn) {
        throw new Error(`Compute function "${config.compute}" not found`);
      }

      const result = computeFn.fn(sourceData, {
        sources: Object.fromEntries(this.states),
        timestamp: Date.now(),
      });

      this.setData(sourceId, result);
    } catch (error) {
      this.setError(sourceId, error instanceof Error ? error.message : "Compute error");
    }
  }

  // ============================================
  // SOURCE INITIALIZATION
  // ============================================

  private initializeSource(config: DataSourceConfig): void {
    const sourceConfig = config.config;

    switch (sourceConfig.type) {
      case "static":
        this.setData(config.id, sourceConfig.data);
        break;

      case "polling":
        this.startPolling(config.id, sourceConfig);
        break;

      case "websocket":
        this.connectWebSocket(config.id, sourceConfig);
        break;

      case "api":
        // API sources are fetched on demand
        break;

      case "computed":
        // Set up dependencies
        for (const depId of sourceConfig.sources) {
          this.subscribe(depId, () => {
            this.computeData(config.id, sourceConfig);
          });
        }
        break;
    }
  }

  private startPolling(
    sourceId: string,
    config: { endpoint: string; interval: number; method?: string }
  ): void {
    const poll = async () => {
      await this.fetchApi(sourceId, {
        endpoint: config.endpoint,
        method: config.method || "GET",
      });
    };

    // Initial fetch
    poll();

    // Set up interval
    const interval = setInterval(poll, config.interval);
    this.pollingIntervals.set(sourceId, interval);
  }

  private connectWebSocket(
    sourceId: string,
    config: { url: string; channel: string; reconnect?: boolean; reconnectInterval?: number }
  ): void {
    const connect = () => {
      const ws = new WebSocket(config.url);

      ws.onopen = () => {
        this.connections.set(sourceId, ws);
        ws.send(JSON.stringify({ type: "subscribe", channel: config.channel }));
        this.emit({
          type: "connection:opened",
          sourceId,
          timestamp: Date.now(),
        });
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const transformedData = this.applyTransform(sourceId, data);
          this.setData(sourceId, transformedData);
        } catch {
          console.error(`Failed to parse WebSocket message for "${sourceId}"`);
        }
      };

      ws.onerror = () => {
        this.setError(sourceId, "WebSocket error");
      };

      ws.onclose = () => {
        this.connections.delete(sourceId);
        this.emit({
          type: "connection:closed",
          sourceId,
          timestamp: Date.now(),
        });

        // Reconnect if configured
        if (config.reconnect) {
          setTimeout(connect, config.reconnectInterval || 5000);
        }
      };
    };

    connect();
  }

  private cleanupSource(sourceId: string): void {
    // Close WebSocket
    const ws = this.connections.get(sourceId);
    if (ws) {
      ws.close();
      this.connections.delete(sourceId);
    }

    // Clear polling interval
    const interval = this.pollingIntervals.get(sourceId);
    if (interval) {
      clearInterval(interval);
      this.pollingIntervals.delete(sourceId);
    }
  }

  // ============================================
  // TRANSFORMS
  // ============================================

  /**
   * Register a transform function
   */
  registerTransform(registration: TransformRegistration): void {
    this.transforms.set(registration.name, registration);
  }

  /**
   * Apply transform to data if configured
   */
  private applyTransform(sourceId: string, data: unknown): unknown {
    const config = this.sources.get(sourceId);
    if (!config?.transform) return data;

    const transform = this.transforms.get(config.transform);
    if (!transform) {
      console.warn(`Transform "${config.transform}" not found`);
      return data;
    }

    return transform.fn(data, {
      sources: Object.fromEntries(this.states),
      timestamp: Date.now(),
    });
  }

  // ============================================
  // MOCK DATA
  // ============================================

  /**
   * Configure mock data behavior
   */
  configureMock(config: MockDataConfig): void {
    this.mockConfig = config;
  }

  /**
   * Register a mock data generator
   */
  registerMockGenerator(sourceId: string, generator: () => unknown): void {
    if (!this.mockConfig.generators) {
      this.mockConfig.generators = {};
    }
    this.mockConfig.generators[sourceId] = generator;
  }

  // ============================================
  // EVENTS
  // ============================================

  /**
   * Subscribe to data events
   */
  onEvent(listener: (event: DataEvent) => void): () => void {
    this.eventListeners.add(listener);
    return () => this.eventListeners.delete(listener);
  }

  private emit(event: DataEvent): void {
    this.eventListeners.forEach((listener) => listener(event));
  }

  // ============================================
  // UTILITIES
  // ============================================

  private createInitialState(): DataState {
    return {
      status: "idle",
      data: null,
      error: null,
      lastUpdated: null,
      isRefreshing: false,
    };
  }

  /**
   * Export all source configurations as JSON
   */
  exportSources(): string {
    return JSON.stringify(
      {
        version: "1.0.0",
        sources: Array.from(this.sources.values()),
        transforms: Array.from(this.transforms.keys()),
      },
      null,
      2
    );
  }

  /**
   * Import source configurations from JSON
   */
  importSources(json: string): void {
    const data = JSON.parse(json);
    if (data.sources) {
      for (const source of data.sources) {
        this.registerSource(source);
      }
    }
  }
}

// Singleton instance
export const dataProvider = new DataProviderManager();

export default dataProvider;
