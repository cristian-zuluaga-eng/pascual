/**
 * Dashboard Builder
 *
 * Programmatic API for building and managing dashboards.
 * Designed for bot consumption with full CRUD operations.
 */

import { ComponentInstance, LayoutConfig } from "../registry/types";
import { registry } from "../registry";
import { dataProvider } from "../data";
import {
  DashboardConfig,
  DashboardLayout,
  DashboardMetadata,
  DashboardOperation,
  DashboardTemplate,
  DashboardValidationResult,
  DashboardValidationError,
  DashboardValidationWarning,
  DataSourceBinding,
  ThemeOverrides,
} from "./types";

class DashboardBuilder {
  private dashboards: Map<string, DashboardConfig> = new Map();
  private templates: Map<string, DashboardTemplate> = new Map();
  private operationHistory: Map<string, DashboardOperation[]> = new Map();

  // ============================================
  // DASHBOARD CRUD
  // ============================================

  /**
   * Create a new dashboard
   */
  create(config: {
    name: string;
    description?: string;
    layout?: Partial<DashboardLayout>;
    theme?: ThemeOverrides;
    createdBy?: string;
    tags?: string[];
  }): DashboardConfig {
    const id = `dashboard_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const now = new Date().toISOString();

    const dashboard: DashboardConfig = {
      id,
      name: config.name,
      description: config.description || "",
      version: "1.0.0",
      layout: {
        type: "grid",
        columns: 12,
        gap: "1rem",
        ...config.layout,
      },
      components: [],
      dataSources: [],
      theme: config.theme,
      metadata: {
        createdAt: now,
        updatedAt: now,
        createdBy: config.createdBy || "system",
        updatedBy: config.createdBy || "system",
        tags: config.tags || [],
        isTemplate: false,
      },
    };

    this.dashboards.set(id, dashboard);
    this.operationHistory.set(id, []);

    return dashboard;
  }

  /**
   * Create dashboard from template
   */
  createFromTemplate(
    templateId: string,
    config: {
      name: string;
      description?: string;
      createdBy?: string;
      slotOverrides?: Record<string, string>;
    }
  ): DashboardConfig | null {
    const template = this.templates.get(templateId);
    if (!template) {
      console.error(`Template "${templateId}" not found`);
      return null;
    }

    const dashboard = this.create({
      name: config.name,
      description: config.description || template.description,
      layout: template.config.layout,
      theme: template.config.theme,
      createdBy: config.createdBy,
      tags: [...template.tags],
    });

    // Copy components from template
    dashboard.components = JSON.parse(JSON.stringify(template.config.components));

    // Apply slot overrides
    if (config.slotOverrides) {
      for (const [slotId, componentId] of Object.entries(config.slotOverrides)) {
        const slot = template.slots.find((s) => s.id === slotId);
        if (slot && slot.acceptedComponents.includes(componentId)) {
          // Find and replace the slot component
          const slotIndex = dashboard.components.findIndex(
            (c) => c.instanceId === slotId
          );
          if (slotIndex !== -1) {
            dashboard.components[slotIndex].componentId = componentId;
          }
        }
      }
    }

    // Copy data sources
    dashboard.dataSources = JSON.parse(JSON.stringify(template.config.dataSources));

    // Update metadata
    dashboard.metadata.templateId = templateId;

    this.dashboards.set(dashboard.id, dashboard);
    return dashboard;
  }

  /**
   * Get a dashboard by ID
   */
  get(dashboardId: string): DashboardConfig | undefined {
    return this.dashboards.get(dashboardId);
  }

  /**
   * Get all dashboards
   */
  getAll(): DashboardConfig[] {
    return Array.from(this.dashboards.values());
  }

  /**
   * Update a dashboard
   */
  update(
    dashboardId: string,
    updates: Partial<Pick<DashboardConfig, "name" | "description" | "layout" | "theme">>
  ): DashboardConfig | null {
    const dashboard = this.dashboards.get(dashboardId);
    if (!dashboard) return null;

    const updated: DashboardConfig = {
      ...dashboard,
      ...updates,
      metadata: {
        ...dashboard.metadata,
        updatedAt: new Date().toISOString(),
      },
    };

    this.dashboards.set(dashboardId, updated);
    this.recordOperation(dashboardId, {
      type: "layout:update",
      target: dashboardId,
      payload: updates,
      timestamp: Date.now(),
    });

    return updated;
  }

  /**
   * Delete a dashboard
   */
  delete(dashboardId: string): boolean {
    this.operationHistory.delete(dashboardId);
    return this.dashboards.delete(dashboardId);
  }

  // ============================================
  // COMPONENT MANAGEMENT
  // ============================================

  /**
   * Add a component to a dashboard
   */
  addComponent(
    dashboardId: string,
    config: {
      componentId: string;
      props?: Record<string, unknown>;
      layout?: LayoutConfig;
      dataBinding?: ComponentInstance["dataBinding"];
    }
  ): ComponentInstance | null {
    const dashboard = this.dashboards.get(dashboardId);
    if (!dashboard) return null;

    // Validate component exists in registry
    if (!registry.has(config.componentId)) {
      console.error(`Component "${config.componentId}" not found in registry`);
      return null;
    }

    const instanceId = `inst_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    const instance: ComponentInstance = {
      instanceId,
      componentId: config.componentId,
      props: config.props || {},
      layout: config.layout,
      dataBinding: config.dataBinding,
    };

    dashboard.components.push(instance);
    this.updateDashboardTimestamp(dashboardId);

    this.recordOperation(dashboardId, {
      type: "component:add",
      target: instanceId,
      payload: config,
      timestamp: Date.now(),
    });

    return instance;
  }

  /**
   * Remove a component from a dashboard
   */
  removeComponent(dashboardId: string, instanceId: string): boolean {
    const dashboard = this.dashboards.get(dashboardId);
    if (!dashboard) return false;

    const index = dashboard.components.findIndex((c) => c.instanceId === instanceId);
    if (index === -1) return false;

    dashboard.components.splice(index, 1);
    this.updateDashboardTimestamp(dashboardId);

    this.recordOperation(dashboardId, {
      type: "component:remove",
      target: instanceId,
      payload: null,
      timestamp: Date.now(),
    });

    return true;
  }

  /**
   * Update a component's props
   */
  updateComponent(
    dashboardId: string,
    instanceId: string,
    updates: {
      props?: Record<string, unknown>;
      layout?: LayoutConfig;
      dataBinding?: ComponentInstance["dataBinding"];
    }
  ): ComponentInstance | null {
    const dashboard = this.dashboards.get(dashboardId);
    if (!dashboard) return null;

    const component = dashboard.components.find((c) => c.instanceId === instanceId);
    if (!component) return null;

    if (updates.props) {
      component.props = { ...component.props, ...updates.props };
    }
    if (updates.layout) {
      component.layout = { ...component.layout, ...updates.layout };
    }
    if (updates.dataBinding !== undefined) {
      component.dataBinding = updates.dataBinding;
    }

    this.updateDashboardTimestamp(dashboardId);

    this.recordOperation(dashboardId, {
      type: "component:update",
      target: instanceId,
      payload: updates,
      timestamp: Date.now(),
    });

    return component;
  }

  /**
   * Move/reorder a component
   */
  moveComponent(
    dashboardId: string,
    instanceId: string,
    newIndex: number
  ): boolean {
    const dashboard = this.dashboards.get(dashboardId);
    if (!dashboard) return false;

    const currentIndex = dashboard.components.findIndex(
      (c) => c.instanceId === instanceId
    );
    if (currentIndex === -1) return false;

    const [component] = dashboard.components.splice(currentIndex, 1);
    dashboard.components.splice(newIndex, 0, component);

    this.updateDashboardTimestamp(dashboardId);

    this.recordOperation(dashboardId, {
      type: "component:move",
      target: instanceId,
      payload: { from: currentIndex, to: newIndex },
      timestamp: Date.now(),
    });

    return true;
  }

  /**
   * Get all components in a dashboard
   */
  getComponents(dashboardId: string): ComponentInstance[] {
    return this.dashboards.get(dashboardId)?.components || [];
  }

  // ============================================
  // DATA SOURCE BINDING
  // ============================================

  /**
   * Bind a data source to components
   */
  bindDataSource(
    dashboardId: string,
    binding: Omit<DataSourceBinding, "id">
  ): DataSourceBinding | null {
    const dashboard = this.dashboards.get(dashboardId);
    if (!dashboard) return null;

    const id = `binding_${Date.now()}`;
    const newBinding: DataSourceBinding = { id, ...binding };

    dashboard.dataSources.push(newBinding);
    this.updateDashboardTimestamp(dashboardId);

    this.recordOperation(dashboardId, {
      type: "datasource:bind",
      target: binding.sourceId,
      payload: binding,
      timestamp: Date.now(),
    });

    return newBinding;
  }

  /**
   * Unbind a data source
   */
  unbindDataSource(dashboardId: string, bindingId: string): boolean {
    const dashboard = this.dashboards.get(dashboardId);
    if (!dashboard) return false;

    const index = dashboard.dataSources.findIndex((b) => b.id === bindingId);
    if (index === -1) return false;

    dashboard.dataSources.splice(index, 1);
    this.updateDashboardTimestamp(dashboardId);

    this.recordOperation(dashboardId, {
      type: "datasource:unbind",
      target: bindingId,
      payload: null,
      timestamp: Date.now(),
    });

    return true;
  }

  // ============================================
  // TEMPLATES
  // ============================================

  /**
   * Register a dashboard template
   */
  registerTemplate(template: DashboardTemplate): void {
    this.templates.set(template.id, template);
  }

  /**
   * Get a template by ID
   */
  getTemplate(templateId: string): DashboardTemplate | undefined {
    return this.templates.get(templateId);
  }

  /**
   * Get all templates
   */
  getTemplates(): DashboardTemplate[] {
    return Array.from(this.templates.values());
  }

  /**
   * Convert a dashboard to a template
   */
  saveAsTemplate(
    dashboardId: string,
    config: {
      name: string;
      description: string;
      category: string;
      tags: string[];
      slots?: DashboardTemplate["slots"];
    }
  ): DashboardTemplate | null {
    const dashboard = this.dashboards.get(dashboardId);
    if (!dashboard) return null;

    const templateId = `template_${Date.now()}`;
    const template: DashboardTemplate = {
      id: templateId,
      name: config.name,
      description: config.description,
      category: config.category,
      tags: config.tags,
      config: {
        name: dashboard.name,
        description: dashboard.description,
        version: dashboard.version,
        layout: dashboard.layout,
        components: JSON.parse(JSON.stringify(dashboard.components)),
        dataSources: JSON.parse(JSON.stringify(dashboard.dataSources)),
        theme: dashboard.theme,
      },
      slots: config.slots || [],
    };

    this.templates.set(templateId, template);
    return template;
  }

  // ============================================
  // VALIDATION
  // ============================================

  /**
   * Validate a dashboard configuration
   */
  validate(dashboardId: string): DashboardValidationResult {
    const dashboard = this.dashboards.get(dashboardId);
    const errors: DashboardValidationError[] = [];
    const warnings: DashboardValidationWarning[] = [];

    if (!dashboard) {
      errors.push({
        code: "DASHBOARD_NOT_FOUND",
        message: `Dashboard "${dashboardId}" not found`,
        path: "",
        severity: "error",
      });
      return { valid: false, errors, warnings };
    }

    // Validate components
    for (const component of dashboard.components) {
      // Check if component exists in registry
      if (!registry.has(component.componentId)) {
        errors.push({
          code: "COMPONENT_NOT_FOUND",
          message: `Component "${component.componentId}" not found in registry`,
          path: `components.${component.instanceId}`,
          severity: "error",
        });
        continue;
      }

      // Validate props
      const registered = registry.get(component.componentId);
      if (registered) {
        const validation = registered.validateProps(component.props);
        if (!validation.valid) {
          for (const error of validation.errors) {
            errors.push({
              code: "INVALID_PROPS",
              message: error.message,
              path: `components.${component.instanceId}.props.${error.path}`,
              severity: "error",
            });
          }
        }
      }

      // Validate data binding
      if (component.dataBinding) {
        const sourceExists = dataProvider.getSource(component.dataBinding.sourceId);
        if (!sourceExists) {
          warnings.push({
            code: "DATA_SOURCE_NOT_FOUND",
            message: `Data source "${component.dataBinding.sourceId}" not found`,
            path: `components.${component.instanceId}.dataBinding`,
            severity: "warning",
          });
        }
      }
    }

    // Validate data source bindings
    for (const binding of dashboard.dataSources) {
      const sourceExists = dataProvider.getSource(binding.sourceId);
      if (!sourceExists) {
        warnings.push({
          code: "DATA_SOURCE_NOT_FOUND",
          message: `Data source "${binding.sourceId}" not registered`,
          path: `dataSources.${binding.id}`,
          severity: "warning",
        });
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  // ============================================
  // EXPORT/IMPORT
  // ============================================

  /**
   * Export a dashboard as JSON
   */
  export(dashboardId: string): string | null {
    const dashboard = this.dashboards.get(dashboardId);
    if (!dashboard) return null;

    return JSON.stringify(dashboard, null, 2);
  }

  /**
   * Export all dashboards as JSON
   */
  exportAll(): string {
    return JSON.stringify(
      {
        version: "1.0.0",
        exportedAt: new Date().toISOString(),
        dashboards: Array.from(this.dashboards.values()),
        templates: Array.from(this.templates.values()),
      },
      null,
      2
    );
  }

  /**
   * Import a dashboard from JSON
   */
  import(json: string): DashboardConfig | null {
    try {
      const config = JSON.parse(json) as DashboardConfig;

      // Generate new ID to avoid conflicts
      config.id = `dashboard_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      config.metadata.updatedAt = new Date().toISOString();

      this.dashboards.set(config.id, config);
      this.operationHistory.set(config.id, []);

      return config;
    } catch (error) {
      console.error("Failed to import dashboard:", error);
      return null;
    }
  }

  // ============================================
  // OPERATION HISTORY
  // ============================================

  /**
   * Get operation history for a dashboard
   */
  getHistory(dashboardId: string): DashboardOperation[] {
    return this.operationHistory.get(dashboardId) || [];
  }

  /**
   * Undo last operation (simplified - just returns the operation)
   */
  getLastOperation(dashboardId: string): DashboardOperation | undefined {
    const history = this.operationHistory.get(dashboardId);
    return history?.[history.length - 1];
  }

  private recordOperation(dashboardId: string, operation: DashboardOperation): void {
    const history = this.operationHistory.get(dashboardId);
    if (history) {
      history.push(operation);
      // Keep only last 100 operations
      if (history.length > 100) {
        history.shift();
      }
    }
  }

  private updateDashboardTimestamp(dashboardId: string): void {
    const dashboard = this.dashboards.get(dashboardId);
    if (dashboard) {
      dashboard.metadata.updatedAt = new Date().toISOString();
    }
  }

  // ============================================
  // QUERY API FOR BOTS
  // ============================================

  /**
   * Query dashboards by criteria
   */
  query(criteria: {
    tags?: string[];
    search?: string;
    isTemplate?: boolean;
    createdBy?: string;
  }): DashboardConfig[] {
    let results = Array.from(this.dashboards.values());

    if (criteria.tags?.length) {
      results = results.filter((d) =>
        criteria.tags!.some((tag) => d.metadata.tags.includes(tag))
      );
    }

    if (criteria.search) {
      const searchLower = criteria.search.toLowerCase();
      results = results.filter(
        (d) =>
          d.name.toLowerCase().includes(searchLower) ||
          d.description.toLowerCase().includes(searchLower)
      );
    }

    if (criteria.isTemplate !== undefined) {
      results = results.filter((d) => d.metadata.isTemplate === criteria.isTemplate);
    }

    if (criteria.createdBy) {
      results = results.filter((d) => d.metadata.createdBy === criteria.createdBy);
    }

    return results;
  }

  /**
   * Get dashboard statistics
   */
  getStats(): {
    totalDashboards: number;
    totalTemplates: number;
    totalComponents: number;
    componentUsage: Record<string, number>;
  } {
    const componentUsage: Record<string, number> = {};

    let totalComponents = 0;
    for (const dashboard of this.dashboards.values()) {
      totalComponents += dashboard.components.length;
      for (const component of dashboard.components) {
        componentUsage[component.componentId] =
          (componentUsage[component.componentId] || 0) + 1;
      }
    }

    return {
      totalDashboards: this.dashboards.size,
      totalTemplates: this.templates.size,
      totalComponents,
      componentUsage,
    };
  }
}

// Singleton instance
export const dashboardBuilder = new DashboardBuilder();

export default dashboardBuilder;
