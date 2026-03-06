/**
 * Component Registry
 *
 * Central registry for all dashboard components.
 * Enables bots to discover, query, and instantiate components programmatically.
 */

import { ComponentType, createElement, ReactNode } from "react";
import {
  ComponentMetadata,
  ComponentQuery,
  ComponentQueryResult,
  RegisteredComponent,
  ValidationResult,
  ValidationError,
  PropsSchema,
  PropSchema,
} from "./types";

class ComponentRegistry {
  private components: Map<string, RegisteredComponent> = new Map();
  private listeners: Set<(event: RegistryEvent) => void> = new Set();

  /**
   * Register a component with the registry
   */
  register<P extends Record<string, unknown>>(
    metadata: ComponentMetadata,
    component: ComponentType<P>
  ): void {
    if (this.components.has(metadata.id)) {
      console.warn(`Component "${metadata.id}" is already registered. Overwriting.`);
    }

    const registeredComponent: RegisteredComponent<P> = {
      metadata,
      component,
      create: (props: Partial<P>) => this.createComponent(metadata.id, props),
      validateProps: (props: unknown) => this.validateProps(metadata.propsSchema, props),
    };

    this.components.set(metadata.id, registeredComponent as RegisteredComponent);
    this.emit({ type: "register", componentId: metadata.id });
  }

  /**
   * Unregister a component
   */
  unregister(componentId: string): boolean {
    const result = this.components.delete(componentId);
    if (result) {
      this.emit({ type: "unregister", componentId });
    }
    return result;
  }

  /**
   * Get a registered component by ID
   */
  get<P = Record<string, unknown>>(componentId: string): RegisteredComponent<P> | undefined {
    return this.components.get(componentId) as RegisteredComponent<P> | undefined;
  }

  /**
   * Check if a component is registered
   */
  has(componentId: string): boolean {
    return this.components.has(componentId);
  }

  /**
   * Get all registered component IDs
   */
  getIds(): string[] {
    return Array.from(this.components.keys());
  }

  /**
   * Get all component metadata
   */
  getAll(): ComponentMetadata[] {
    return Array.from(this.components.values()).map((c) => c.metadata);
  }

  /**
   * Query components with filters
   */
  query(query: ComponentQuery): ComponentQueryResult {
    let results = Array.from(this.components.values()).map((c) => c.metadata);

    // Filter by category
    if (query.category) {
      const categories = Array.isArray(query.category) ? query.category : [query.category];
      results = results.filter((c) => categories.includes(c.category));
    }

    // Filter by tags
    if (query.tags && query.tags.length > 0) {
      results = results.filter((c) => query.tags!.some((tag) => c.tags.includes(tag)));
    }

    // Search in name and description
    if (query.search) {
      const searchLower = query.search.toLowerCase();
      results = results.filter(
        (c) =>
          c.name.toLowerCase().includes(searchLower) ||
          c.description.toLowerCase().includes(searchLower)
      );
    }

    // Filter by dataBindable
    if (query.dataBindable !== undefined) {
      results = results.filter((c) => c.dataBindable === query.dataBindable);
    }

    // Filter by acceptsChildren
    if (query.acceptsChildren !== undefined) {
      results = results.filter((c) => c.acceptsChildren === query.acceptsChildren);
    }

    return {
      components: results,
      total: results.length,
    };
  }

  /**
   * Create a component instance with props
   */
  createComponent<P = Record<string, unknown>>(
    componentId: string,
    props: Partial<P>
  ): ReactNode {
    const registered = this.get<P>(componentId);
    if (!registered) {
      console.error(`Component "${componentId}" not found in registry`);
      return null;
    }

    // Merge with default props
    const mergedProps = {
      ...registered.metadata.defaultProps,
      ...props,
    } as P;

    // Validate props
    const validation = this.validateProps(registered.metadata.propsSchema, mergedProps);
    if (!validation.valid) {
      console.warn(`Invalid props for "${componentId}":`, validation.errors);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return createElement(registered.component as any, mergedProps as any);
  }

  /**
   * Validate props against a schema
   */
  validateProps(schema: PropsSchema, props: unknown): ValidationResult {
    const errors: ValidationError[] = [];

    if (typeof props !== "object" || props === null) {
      return {
        valid: false,
        errors: [
          {
            path: "",
            message: "Props must be an object",
            received: props,
            expected: "object",
          },
        ],
      };
    }

    const propsObj = props as Record<string, unknown>;

    // Check required props
    for (const [key, propSchema] of Object.entries(schema)) {
      if (propSchema.required && !(key in propsObj)) {
        errors.push({
          path: key,
          message: `Required prop "${key}" is missing`,
          received: undefined,
          expected: propSchema.type,
        });
      }
    }

    // Validate provided props
    for (const [key, value] of Object.entries(propsObj)) {
      const propSchema = schema[key];
      if (!propSchema) {
        continue; // Allow extra props
      }

      const propError = this.validateProp(key, value, propSchema);
      if (propError) {
        errors.push(propError);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  private validateProp(
    path: string,
    value: unknown,
    schema: PropSchema
  ): ValidationError | null {
    // Skip validation for undefined optional props
    if (value === undefined && !schema.required) {
      return null;
    }

    switch (schema.type) {
      case "string":
        if (typeof value !== "string") {
          return {
            path,
            message: `Expected string, got ${typeof value}`,
            received: value,
            expected: "string",
          };
        }
        break;

      case "number":
        if (typeof value !== "number") {
          return {
            path,
            message: `Expected number, got ${typeof value}`,
            received: value,
            expected: "number",
          };
        }
        break;

      case "boolean":
        if (typeof value !== "boolean") {
          return {
            path,
            message: `Expected boolean, got ${typeof value}`,
            received: value,
            expected: "boolean",
          };
        }
        break;

      case "array":
        if (!Array.isArray(value)) {
          return {
            path,
            message: `Expected array, got ${typeof value}`,
            received: value,
            expected: "array",
          };
        }
        break;

      case "object":
        if (typeof value !== "object" || value === null || Array.isArray(value)) {
          return {
            path,
            message: `Expected object, got ${typeof value}`,
            received: value,
            expected: "object",
          };
        }
        break;

      case "function":
        if (typeof value !== "function") {
          return {
            path,
            message: `Expected function, got ${typeof value}`,
            received: value,
            expected: "function",
          };
        }
        break;

      case "enum":
        if (schema.enumValues && !schema.enumValues.includes(value as string)) {
          return {
            path,
            message: `Expected one of [${schema.enumValues.join(", ")}], got "${value}"`,
            received: value,
            expected: `enum(${schema.enumValues.join("|")})`,
          };
        }
        break;

      case "node":
      case "element":
        // React nodes/elements are hard to validate at runtime
        break;
    }

    return null;
  }

  /**
   * Generate JSON schema for a component (for external tools)
   */
  getJSONSchema(componentId: string): object | null {
    const registered = this.get(componentId);
    if (!registered) return null;

    return {
      $schema: "http://json-schema.org/draft-07/schema#",
      $id: `pascual-dashboard/components/${componentId}`,
      title: registered.metadata.name,
      description: registered.metadata.description,
      type: "object",
      properties: this.propsSchemaToJSONSchema(registered.metadata.propsSchema),
      required: Object.entries(registered.metadata.propsSchema)
        .filter(([, schema]) => schema.required)
        .map(([key]) => key),
    };
  }

  private propsSchemaToJSONSchema(schema: PropsSchema): object {
    const properties: Record<string, object> = {};

    for (const [key, propSchema] of Object.entries(schema)) {
      properties[key] = {
        description: propSchema.description,
        ...this.propTypeToJSONSchema(propSchema),
      };
    }

    return properties;
  }

  private propTypeToJSONSchema(schema: PropSchema): object {
    switch (schema.type) {
      case "string":
        return { type: "string" };
      case "number":
        return { type: "number" };
      case "boolean":
        return { type: "boolean" };
      case "array":
        return { type: "array" };
      case "object":
        return { type: "object" };
      case "enum":
        return { type: "string", enum: schema.enumValues };
      default:
        return {};
    }
  }

  /**
   * Export registry catalog as JSON (for bot consumption)
   */
  exportCatalog(): string {
    const catalog = {
      version: "1.0.0",
      generatedAt: new Date().toISOString(),
      components: this.getAll().map((metadata) => ({
        ...metadata,
        jsonSchema: this.getJSONSchema(metadata.id),
      })),
    };

    return JSON.stringify(catalog, null, 2);
  }

  /**
   * Subscribe to registry events
   */
  subscribe(listener: (event: RegistryEvent) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emit(event: RegistryEvent): void {
    this.listeners.forEach((listener) => listener(event));
  }
}

interface RegistryEvent {
  type: "register" | "unregister";
  componentId: string;
}

// Singleton instance
export const registry = new ComponentRegistry();

// Helper function for registering components with less boilerplate
export function registerComponent<P extends Record<string, unknown>>(
  metadata: ComponentMetadata,
  component: ComponentType<P>
): void {
  registry.register(metadata, component);
}

export default registry;
