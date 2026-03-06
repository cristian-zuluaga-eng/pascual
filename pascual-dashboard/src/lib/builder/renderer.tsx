/**
 * Dashboard Renderer
 *
 * React component that renders a dashboard configuration.
 * Used by bots to display dashboards built programmatically.
 */

"use client";

import React, { useMemo, useEffect } from "react";
import { registry } from "../registry";
import { dataProvider, useDataSource } from "../data";
import { DashboardConfig, DataSourceBinding } from "./types";
import { ComponentInstance } from "../registry/types";

// ============================================
// DASHBOARD RENDERER
// ============================================

interface DashboardRendererProps {
  config: DashboardConfig;
  className?: string;
}

export function DashboardRenderer({ config, className = "" }: DashboardRendererProps) {
  // Initialize data sources
  useEffect(() => {
    for (const binding of config.dataSources) {
      dataProvider.fetch(binding.sourceId);
    }
  }, [config.dataSources]);

  const gridStyles = useMemo(() => {
    if (config.layout.type === "grid") {
      return {
        display: "grid",
        gridTemplateColumns: `repeat(${config.layout.columns || 12}, 1fr)`,
        gap: config.layout.gap || "1rem",
      };
    }
    if (config.layout.type === "flex") {
      return {
        display: "flex",
        flexWrap: "wrap" as const,
        gap: config.layout.gap || "1rem",
      };
    }
    return {};
  }, [config.layout]);

  return (
    <div className={`dashboard-renderer ${className}`} style={gridStyles}>
      {config.components.map((instance) => (
        <ComponentRenderer
          key={instance.instanceId}
          instance={instance}
          dataSources={config.dataSources}
        />
      ))}
    </div>
  );
}

// ============================================
// COMPONENT RENDERER
// ============================================

interface ComponentRendererProps {
  instance: ComponentInstance;
  dataSources: DataSourceBinding[];
}

function ComponentRenderer({ instance, dataSources }: ComponentRendererProps) {
  const registered = registry.get(instance.componentId);

  if (!registered) {
    return (
      <div className="p-4 bg-red-950 border border-red-800 rounded text-red-400 font-mono text-sm">
        Component &quot;{instance.componentId}&quot; not found
      </div>
    );
  }

  // Get layout styles
  const layoutStyles = useMemo(() => {
    const styles: React.CSSProperties = {};

    if (instance.layout) {
      if (instance.layout.colSpan) {
        styles.gridColumn = `span ${instance.layout.colSpan}`;
      }
      if (instance.layout.rowSpan) {
        styles.gridRow = `span ${instance.layout.rowSpan}`;
      }
      if (instance.layout.width) {
        styles.width = instance.layout.width;
      }
      if (instance.layout.height) {
        styles.height = instance.layout.height;
      }
      if (instance.layout.order !== undefined) {
        styles.order = instance.layout.order;
      }
    }

    return styles;
  }, [instance.layout]);

  // Check visibility
  if (instance.layout?.visible === false) {
    return null;
  }

  // If component has data binding, wrap with data provider
  if (instance.dataBinding) {
    return (
      <div style={layoutStyles}>
        <DataBoundComponent
          instance={instance}
          Component={registered.component}
          dataSources={dataSources}
        />
      </div>
    );
  }

  // Render with static props
  return (
    <div style={layoutStyles}>
      {React.createElement(registered.component, instance.props)}
    </div>
  );
}

// ============================================
// DATA BOUND COMPONENT
// ============================================

interface DataBoundComponentProps {
  instance: ComponentInstance;
  Component: React.ComponentType<Record<string, unknown>>;
  dataSources: DataSourceBinding[];
}

function DataBoundComponent({
  instance,
  Component,
  dataSources,
}: DataBoundComponentProps) {
  const { dataBinding } = instance;

  if (!dataBinding) {
    return React.createElement(Component, instance.props);
  }

  // Find the binding configuration
  const binding = dataSources.find(
    (b) => b.sourceId === dataBinding.sourceId
  );

  // Get consumer config for this component
  const consumerConfig = binding?.consumers.find(
    (c) => c.instanceId === instance.instanceId
  );

  // Subscribe to data source
  const { data, status } = useDataSource(dataBinding.sourceId);

  // Build props from data
  const dataProps = useMemo(() => {
    if (!data || !dataBinding.fieldMappings) {
      return {};
    }

    const props: Record<string, unknown> = {};

    for (const [propName, fieldPath] of Object.entries(dataBinding.fieldMappings)) {
      props[propName] = getNestedValue(data, fieldPath);
    }

    // Also apply consumer mappings if available
    if (consumerConfig?.propMappings) {
      for (const [propName, mapping] of Object.entries(consumerConfig.propMappings)) {
        if (typeof mapping === "string") {
          props[propName] = getNestedValue(data, mapping);
        } else {
          const value = getNestedValue(data, mapping.field);
          props[propName] = value ?? mapping.defaultValue;
        }
      }
    }

    return props;
  }, [data, dataBinding.fieldMappings, consumerConfig]);

  // Show loading state
  if (status === "loading") {
    return (
      <div className="animate-pulse bg-zinc-900 rounded h-24 flex items-center justify-center">
        <span className="text-zinc-500 font-mono text-sm">Loading...</span>
      </div>
    );
  }

  // Merge static props with data props
  const mergedProps = {
    ...instance.props,
    ...dataProps,
  };

  return React.createElement(Component, mergedProps);
}

// ============================================
// UTILITIES
// ============================================

/**
 * Get a nested value from an object using dot notation
 */
function getNestedValue(obj: unknown, path: string): unknown {
  if (!obj || typeof obj !== "object") return undefined;

  const parts = path.split(".");
  let current: unknown = obj;

  for (const part of parts) {
    if (current === null || current === undefined) return undefined;
    if (typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[part];
  }

  return current;
}

// ============================================
// PREVIEW COMPONENT
// ============================================

interface DashboardPreviewProps {
  config: DashboardConfig;
  scale?: number;
}

export function DashboardPreview({ config, scale = 0.5 }: DashboardPreviewProps) {
  return (
    <div
      className="overflow-hidden border border-zinc-800 rounded bg-zinc-950"
      style={{
        transform: `scale(${scale})`,
        transformOrigin: "top left",
        width: `${100 / scale}%`,
        height: `${100 / scale}%`,
      }}
    >
      <DashboardRenderer config={config} />
    </div>
  );
}

export default DashboardRenderer;
