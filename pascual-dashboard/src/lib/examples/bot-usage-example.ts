/**
 * Bot Usage Example
 *
 * This file demonstrates how a bot can use the Pascual Dashboard API
 * to programmatically create, manage, and customize dashboards.
 *
 * Para usar: importar botAPI desde '@/lib'
 */

import { botAPI } from "../bot-api";

// ============================================
// EJEMPLO 1: Descubrir componentes disponibles
// ============================================

export function discoverComponents() {
  // Obtener todos los componentes
  const allComponents = botAPI.getComponents();
  console.log("Componentes disponibles:", allComponents.length);

  // Buscar componentes de tipo chart
  const charts = botAPI.searchComponents({ category: "chart" });
  console.log("Charts disponibles:", charts);

  // Buscar componentes por tags
  const statComponents = botAPI.searchComponents({ tags: ["stat", "metric"] });
  console.log("Componentes de estadísticas:", statComponents);

  // Obtener schema JSON de un componente específico
  const statCardSchema = botAPI.getComponentSchema("ui.stat-card");
  console.log("Schema de StatCard:", statCardSchema);

  // Exportar catálogo completo para documentación
  const catalog = botAPI.exportComponentCatalog();
  console.log("Catálogo exportado:", catalog.substring(0, 200) + "...");
}

// ============================================
// EJEMPLO 2: Crear un dashboard desde cero
// ============================================

export function createDashboardExample() {
  // Crear nuevo dashboard
  const dashboard = botAPI.createDashboard({
    name: "Mi Dashboard de Monitoreo",
    description: "Dashboard creado por bot para monitoreo del sistema",
    columns: 12,
    createdBy: "bot-ejemplo",
    tags: ["monitoreo", "sistema", "auto-generado"],
  });

  console.log("Dashboard creado:", dashboard.id);

  // Agregar fila de estadísticas
  const statsIds = botAPI.addStatsRow(dashboard.id, [
    { title: "CPU", value: "45%", trend: { value: 5, positive: false }, variant: "warning" },
    { title: "Memoria", value: "3.2GB", trend: { value: 2, positive: true }, variant: "info" },
    { title: "Disco", value: "67%", variant: "default" },
    { title: "Red", value: "125 Mbps", trend: { value: 15, positive: true }, variant: "success" },
  ]);

  console.log("Stats agregadas:", statsIds);

  // Agregar un componente individual
  const chartId = botAPI.addComponent(
    dashboard.id,
    "ui.card",
    { variant: "default", glow: true },
    { colSpan: 6 }
  );

  console.log("Chart agregado:", chartId);

  // Validar el dashboard
  const validation = botAPI.validateDashboard(dashboard.id);
  console.log("Validación:", validation);

  // Exportar configuración
  const exportedConfig = botAPI.exportDashboard(dashboard.id);
  console.log("Configuración exportada:", exportedConfig?.substring(0, 200) + "...");

  return dashboard;
}

// ============================================
// EJEMPLO 3: Gestión de datos
// ============================================

export function dataManagementExample() {
  // Registrar fuente de datos estática
  botAPI.registerStaticData("system-metrics", "Métricas del Sistema", {
    cpu: 45,
    memory: 3.2,
    disk: 67,
    network: 125,
    timestamp: Date.now(),
  });

  // Registrar fuente de datos de API
  botAPI.registerApiData(
    "agents-status",
    "Estado de Agentes",
    "/api/agents/status",
    "GET"
  );

  // Obtener datos
  const metrics = botAPI.getData("system-metrics");
  console.log("Métricas actuales:", metrics);

  // Actualizar datos
  botAPI.setData("system-metrics", {
    cpu: 52,
    memory: 3.5,
    disk: 68,
    network: 140,
    timestamp: Date.now(),
  });

  // Listar todas las fuentes de datos
  const sources = botAPI.getDataSources();
  console.log("Fuentes de datos registradas:", sources.length);
}

// ============================================
// EJEMPLO 4: Vincular datos a componentes
// ============================================

export function dataBindingExample() {
  // Crear dashboard
  const dashboard = botAPI.createDashboard({
    name: "Dashboard con Datos Dinámicos",
    createdBy: "bot-ejemplo",
  });

  // Registrar fuente de datos
  botAPI.registerStaticData("cpu-data", "CPU Data", {
    current: 45,
    trend: { value: 5, positive: false },
  });

  // Agregar componente
  const componentId = botAPI.addComponent(dashboard.id, "ui.stat-card", {
    title: "CPU Usage",
    value: "Loading...",
  });

  if (componentId) {
    // Vincular datos al componente
    const bound = botAPI.bindDataToComponent(
      dashboard.id,
      componentId,
      "cpu-data",
      {
        value: "current",
        trend: "trend",
      }
    );

    console.log("Datos vinculados:", bound);
  }

  return dashboard;
}

// ============================================
// EJEMPLO 5: Templates
// ============================================

export function templateExample() {
  // Crear dashboard base
  const baseDashboard = botAPI.createDashboard({
    name: "Template Base de Monitoreo",
    createdBy: "bot-ejemplo",
  });

  // Agregar componentes al template
  botAPI.addStatsRow(baseDashboard.id, [
    { title: "Metric 1", value: "0" },
    { title: "Metric 2", value: "0" },
    { title: "Metric 3", value: "0" },
    { title: "Metric 4", value: "0" },
  ]);

  // Guardar como template
  const template = botAPI.saveAsTemplate(baseDashboard.id, {
    name: "Template de Monitoreo 4-Stats",
    description: "Template con 4 tarjetas de estadísticas",
    category: "monitoring",
    tags: ["stats", "monitoring", "4-col"],
  });

  console.log("Template creado:", template?.id);

  // Listar templates disponibles
  const templates = botAPI.getTemplates();
  console.log("Templates disponibles:", templates.length);

  // Crear dashboard desde template
  if (template) {
    const newDashboard = botAPI.createFromTemplate(
      template.id,
      "Dashboard desde Template",
      "bot-ejemplo"
    );
    console.log("Dashboard desde template:", newDashboard?.id);
  }
}

// ============================================
// EJEMPLO 6: Acceso al tema
// ============================================

export function themeAccessExample() {
  // Obtener tema completo
  const theme = botAPI.getTheme();
  console.log("Colores disponibles:", Object.keys(theme.colors));

  // Obtener color específico
  const cyanColor = botAPI.getColor("accent.cyan");
  console.log("Color cyan:", cyanColor); // "#00d9ff"

  const pinkColor = botAPI.getColor("accent.pink");
  console.log("Color pink:", pinkColor); // "#ff006e"

  // Usar colores en componentes
  const dashboard = botAPI.createDashboard({ name: "Dashboard Themed" });

  botAPI.addComponent(dashboard.id, "ui.stat-card", {
    title: "Custom Colored",
    value: "100",
    // Los componentes usan los colores del tema automáticamente
  });
}

// ============================================
// EJEMPLO 7: Estadísticas del sistema
// ============================================

export function getSystemStats() {
  // Obtener información del sistema
  const info = botAPI.getInfo();
  console.log("API Info:", info);

  // Obtener estadísticas
  const stats = botAPI.getStats();
  console.log("Estadísticas:");
  console.log("- Dashboards:", stats.totalDashboards);
  console.log("- Templates:", stats.totalTemplates);
  console.log("- Componentes usados:", stats.totalComponents);
  console.log("- Componentes registrados:", stats.registeredComponents);
  console.log("- Fuentes de datos:", stats.registeredDataSources);
  console.log("- Uso por componente:", stats.componentUsage);
}

// ============================================
// EJEMPLO 8: Flujo completo de bot
// ============================================

export async function fullBotWorkflow() {
  console.log("=== Iniciando flujo de bot ===\n");

  // 1. Verificar capacidades
  const info = botAPI.getInfo();
  console.log("1. API disponible:", info.name, "v" + info.version);
  console.log("   Capacidades:", info.capabilities.join(", "));

  // 2. Descubrir componentes
  const components = botAPI.getComponents();
  console.log("\n2. Componentes disponibles:", components.length);
  components.forEach((c) => console.log(`   - ${c.id}: ${c.description}`));

  // 3. Crear dashboard
  const dashboard = botAPI.createDashboard({
    name: "Dashboard Generado por Bot",
    description: "Este dashboard fue creado automáticamente",
    createdBy: "pascual-bot",
    tags: ["auto-generated", "monitoring"],
  });
  console.log("\n3. Dashboard creado:", dashboard.id);

  // 4. Registrar datos
  botAPI.registerStaticData("bot-metrics", "Bot Metrics", {
    tasksCompleted: 150,
    activeAgents: 5,
    systemHealth: 98,
    responseTime: 45,
  });
  console.log("\n4. Datos registrados");

  // 5. Agregar componentes con datos
  botAPI.addStatsRow(dashboard.id, [
    { title: "Tasks Completadas", value: "150", variant: "success" },
    { title: "Agentes Activos", value: "5", variant: "info" },
    { title: "Salud del Sistema", value: "98%", variant: "success" },
    { title: "Tiempo de Respuesta", value: "45ms", variant: "default" },
  ]);
  console.log("\n5. Componentes agregados");

  // 6. Validar
  const validation = botAPI.validateDashboard(dashboard.id);
  console.log("\n6. Validación:", validation.valid ? "OK" : "Errores encontrados");

  // 7. Exportar
  const exported = botAPI.exportDashboard(dashboard.id);
  console.log("\n7. Dashboard exportado:", exported ? "OK" : "Error");

  // 8. Estadísticas finales
  const stats = botAPI.getStats();
  console.log("\n8. Estadísticas finales:");
  console.log("   - Total dashboards:", stats.totalDashboards);
  console.log("   - Total componentes:", stats.totalComponents);

  console.log("\n=== Flujo completado ===");

  return dashboard;
}
