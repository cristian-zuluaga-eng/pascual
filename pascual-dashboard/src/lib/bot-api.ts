/**
 * Bot API
 *
 * Main entry point for bot interaction with the dashboard system.
 * Provides a unified, easy-to-use API for creating and managing dashboards programmatically.
 */

import { registry } from "./registry";
import { dataProvider } from "./data";
import { dashboardBuilder } from "./builder";
import { theme, colors, spacing, typography, shadows } from "./theme";
import type { ComponentMetadata, ComponentQuery } from "./registry/types";
import type { DataSourceConfig, DataState } from "./data/types";
import type { DashboardConfig, DashboardTemplate } from "./builder/types";

// ============================================
// BOT API CLASS
// ============================================

class BotAPI {
  // ============================================
  // COMPONENT DISCOVERY
  // ============================================

  /**
   * Get all available components
   */
  getComponents(): ComponentMetadata[] {
    return registry.getAll();
  }

  /**
   * Search for components by criteria
   */
  searchComponents(query: ComponentQuery): ComponentMetadata[] {
    return registry.query(query).components;
  }

  /**
   * Get a specific component's metadata
   */
  getComponent(componentId: string): ComponentMetadata | undefined {
    return registry.get(componentId)?.metadata;
  }

  /**
   * Get JSON schema for a component (for validation)
   */
  getComponentSchema(componentId: string): object | null {
    return registry.getJSONSchema(componentId);
  }

  /**
   * Export full component catalog as JSON
   */
  exportComponentCatalog(): string {
    return registry.exportCatalog();
  }

  // ============================================
  // DASHBOARD MANAGEMENT
  // ============================================

  /**
   * Create a new dashboard
   */
  createDashboard(config: {
    name: string;
    description?: string;
    columns?: number;
    createdBy?: string;
    tags?: string[];
  }): DashboardConfig {
    return dashboardBuilder.create({
      name: config.name,
      description: config.description,
      layout: { type: "grid", columns: config.columns || 12 },
      createdBy: config.createdBy || "bot",
      tags: config.tags,
    });
  }

  /**
   * Get a dashboard by ID
   */
  getDashboard(dashboardId: string): DashboardConfig | undefined {
    return dashboardBuilder.get(dashboardId);
  }

  /**
   * Get all dashboards
   */
  getAllDashboards(): DashboardConfig[] {
    return dashboardBuilder.getAll();
  }

  /**
   * Delete a dashboard
   */
  deleteDashboard(dashboardId: string): boolean {
    return dashboardBuilder.delete(dashboardId);
  }

  /**
   * Add a component to a dashboard
   */
  addComponent(
    dashboardId: string,
    componentId: string,
    props?: Record<string, unknown>,
    layout?: { colSpan?: number; rowSpan?: number }
  ): string | null {
    const instance = dashboardBuilder.addComponent(dashboardId, {
      componentId,
      props,
      layout,
    });
    return instance?.instanceId ?? null;
  }

  /**
   * Remove a component from a dashboard
   */
  removeComponent(dashboardId: string, instanceId: string): boolean {
    return dashboardBuilder.removeComponent(dashboardId, instanceId);
  }

  /**
   * Update a component's props
   */
  updateComponent(
    dashboardId: string,
    instanceId: string,
    props: Record<string, unknown>
  ): boolean {
    const result = dashboardBuilder.updateComponent(dashboardId, instanceId, { props });
    return result !== null;
  }

  /**
   * Validate a dashboard configuration
   */
  validateDashboard(dashboardId: string) {
    return dashboardBuilder.validate(dashboardId);
  }

  /**
   * Export a dashboard as JSON
   */
  exportDashboard(dashboardId: string): string | null {
    return dashboardBuilder.export(dashboardId);
  }

  /**
   * Import a dashboard from JSON
   */
  importDashboard(json: string): DashboardConfig | null {
    return dashboardBuilder.import(json);
  }

  // ============================================
  // TEMPLATES
  // ============================================

  /**
   * Get all available templates
   */
  getTemplates(): DashboardTemplate[] {
    return dashboardBuilder.getTemplates();
  }

  /**
   * Create dashboard from template
   */
  createFromTemplate(
    templateId: string,
    name: string,
    createdBy?: string
  ): DashboardConfig | null {
    return dashboardBuilder.createFromTemplate(templateId, {
      name,
      createdBy: createdBy || "bot",
    });
  }

  /**
   * Save a dashboard as template
   */
  saveAsTemplate(
    dashboardId: string,
    config: {
      name: string;
      description: string;
      category: string;
      tags: string[];
    }
  ): DashboardTemplate | null {
    return dashboardBuilder.saveAsTemplate(dashboardId, config);
  }

  // ============================================
  // DATA MANAGEMENT
  // ============================================

  /**
   * Register a static data source
   */
  registerStaticData(id: string, name: string, data: unknown): void {
    dataProvider.registerSource({
      id,
      name,
      type: "static",
      description: `Static data source: ${name}`,
      schema: { type: "object", description: "Static data" },
      config: { type: "static", data },
    });
  }

  /**
   * Register an API data source
   */
  registerApiData(
    id: string,
    name: string,
    endpoint: string,
    method: "GET" | "POST" = "GET"
  ): void {
    dataProvider.registerSource({
      id,
      name,
      type: "api",
      description: `API data source: ${name}`,
      schema: { type: "object", description: "API response data" },
      config: { type: "api", endpoint, method },
    });
  }

  /**
   * Get data from a source
   */
  getData<T = unknown>(sourceId: string): T | null {
    return dataProvider.getData<T>(sourceId);
  }

  /**
   * Set data in a source
   */
  setData(sourceId: string, data: unknown): void {
    dataProvider.setData(sourceId, data);
  }

  /**
   * Fetch/refresh data from a source
   */
  async refreshData(sourceId: string): Promise<void> {
    await dataProvider.fetch(sourceId);
  }

  /**
   * Get all registered data sources
   */
  getDataSources(): DataSourceConfig[] {
    return dataProvider.getAllSources();
  }

  /**
   * Bind data source to component
   */
  bindDataToComponent(
    dashboardId: string,
    instanceId: string,
    sourceId: string,
    fieldMappings: Record<string, string>
  ): boolean {
    const result = dashboardBuilder.updateComponent(dashboardId, instanceId, {
      dataBinding: { sourceId, fieldMappings },
    });
    return result !== null;
  }

  // ============================================
  // THEME ACCESS
  // ============================================

  /**
   * Get theme tokens
   */
  getTheme() {
    return theme;
  }

  /**
   * Get color by path (e.g., "accent.cyan")
   */
  getColor(path: string): string {
    const parts = path.split(".");
    let current: unknown = colors;
    for (const part of parts) {
      if (current && typeof current === "object" && part in current) {
        current = (current as Record<string, unknown>)[part];
      }
    }
    if (current && typeof current === "object" && "value" in current) {
      return (current as { value: string }).value;
    }
    return path;
  }

  // ============================================
  // STATISTICS & INFO
  // ============================================

  /**
   * Get system statistics
   */
  getStats() {
    return {
      ...dashboardBuilder.getStats(),
      registeredComponents: registry.getIds().length,
      registeredDataSources: dataProvider.getSourceIds().length,
    };
  }

  /**
   * Get API version info
   */
  getInfo() {
    return {
      name: "Pascual Dashboard Bot API",
      version: "1.0.0",
      capabilities: [
        "component-discovery",
        "dashboard-crud",
        "template-management",
        "data-binding",
        "theme-access",
      ],
    };
  }

  // ============================================
  // QUICK BUILDERS
  // ============================================

  /**
   * Quick builder: Create a stats row
   */
  addStatsRow(
    dashboardId: string,
    stats: Array<{
      title: string;
      value: string | number;
      trend?: { value: number; positive: boolean };
      variant?: string;
    }>
  ): string[] {
    const instanceIds: string[] = [];
    const colSpan = Math.floor(12 / stats.length);

    for (const stat of stats) {
      const id = this.addComponent(
        dashboardId,
        "ui.stat-card",
        {
          title: stat.title,
          value: stat.value,
          trend: stat.trend,
          variant: stat.variant || "default",
        },
        { colSpan }
      );
      if (id) instanceIds.push(id);
    }

    return instanceIds;
  }

  /**
   * Quick builder: Create a chart card
   */
  addChartCard(
    dashboardId: string,
    config: {
      title: string;
      chartType: "line" | "bar";
      data: Array<{ name: string; value: number }>;
      color?: string;
      colSpan?: number;
    }
  ): string | null {
    const componentId = config.chartType === "line" ? "chart.line" : "chart.bar";

    return this.addComponent(
      dashboardId,
      componentId,
      {
        data: config.data,
        color: config.color || this.getColor("accent.cyan"),
        height: 200,
      },
      { colSpan: config.colSpan || 6 }
    );
  }
}

// Singleton instance
export const botAPI = new BotAPI();

// Also export for direct imports
export default botAPI;

// ============================================
// CONVENIENCE EXPORTS
// ============================================

// Re-export everything bots might need
export { registry } from "./registry";
export { dataProvider } from "./data";
export { dashboardBuilder } from "./builder";
export { theme, colors, spacing, typography, shadows } from "./theme";

// Types
export type { ComponentMetadata, ComponentQuery } from "./registry/types";
export type { DataSourceConfig, DataState } from "./data/types";
export type { DashboardConfig, DashboardTemplate } from "./builder/types";
