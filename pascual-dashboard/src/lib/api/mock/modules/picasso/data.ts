// ============================================================================
// PICASSO - Mock Data
// ============================================================================

import { DeepPartial, mergeWithDefaults } from "../../types/base";
import { PicassoData } from "./types";

const defaultPicassoData: PicassoData = {
  id: "picasso",
  name: "Dashboard",
  icon: "🎨",
  lema: "Informacion valiosa, perfectamente presentada",
  description: "Sistema de Interfaces y Experiencia de Usuario",
  status: "active",
  lastSync: "tiempo real",
  quickActions: [
    { id: "component", label: "Nuevo componente", icon: "🧩", prompt: "Pascual, disena un componente para [proposito]" },
    { id: "audit", label: "UX audit", icon: "🔍", prompt: "Pascual, realiza una auditoria UX de [pagina/componente]" },
    { id: "performance", label: "Performance", icon: "⚡", prompt: "Pascual, analiza el rendimiento de la aplicacion" },
    { id: "accessibility", label: "Accesibilidad", icon: "♿", prompt: "Pascual, verifica accesibilidad WCAG de [componente]" },
  ],
  recentMessages: [],
  metrics: {
    uptime: 99.8,
    loadTime: 1.8,
    accessibilityScore: 98,
    componentsCount: 47,
    uxScore: 92,
    errorRate: 0.2,
    activeSessions: 12,
  },
  uxNeeds: [
    {
      title: "Simplificacion de flujo de checkout",
      description: "Los usuarios abandonan el proceso de compra por su complejidad. Se necesita un rediseno que reduzca los pasos de 5 a maximo 3, con autollenado de datos y vista previa del total en cada etapa.",
      priority: "high"
    },
    {
      title: "Coherencia en el lenguaje visual",
      description: "El equipo de marketing necesita un sistema de diseno unificado para todas las comunicaciones. La inconsistencia actual causa confusion en la identidad de marca y ralentiza la produccion de nuevos materiales.",
      priority: "medium"
    },
    {
      title: "Visualizacion de datos financieros",
      description: "El area financiera necesita una forma mas clara de presentar indicadores clave. Los reportes actuales son dificiles de interpretar y requieren demasiado tiempo para extraer conclusiones importantes.",
      priority: "high"
    },
  ],
  componentsUsage: [
    { name: "Card", instances: 234 },
    { name: "Button", instances: 189 },
    { name: "Badge", instances: 156 },
    { name: "LineChart", instances: 89 },
    { name: "PascualFeedbackBar", instances: 9, isNew: true },
    { name: "AgentStatusGrid", instances: 5, isNew: true },
  ],
  implementationLogs: [
    {
      id: "1",
      componentName: "AgentStatusGrid",
      agentName: "Condor360",
      agentIcon: "📈",
      implementationDetails: "Ajuste de componente para soportar indicadores de confianza del modelo por sector. Adicion de filtro de texto y cambio en el sistema de visualizacion de metricas.",
      timestamp: "hace 1h"
    },
    {
      id: "2",
      componentName: "SectionCard",
      agentName: "Sentinel",
      agentIcon: "🛡️",
      implementationDetails: "Modificacion de altura maxima y comportamiento de scroll para adaptarse a visualizaciones de eventos de seguridad. Anadido soporte para destacar amenazas criticas.",
      timestamp: "hace 3h"
    },
    {
      id: "3",
      componentName: "Canvas",
      agentName: "Asistente",
      agentIcon: "👤",
      implementationDetails: "Integracion de quick prompts especificos para gestion personal y adicion de soporte para respuestas estructuradas con tareas pendientes.",
      timestamp: "hace 6h"
    },
    {
      id: "4",
      componentName: "ProgressBar",
      agentName: "Gambito",
      agentIcon: "🎯",
      implementationDetails: "Adaptacion del componente para visualizar rangos de confianza en predicciones deportivas y ajuste de la escala de colores segun el tipo de mercado.",
      timestamp: "ayer"
    },
  ],
  accessibilityReport: {
    wcagCompliance: 98,
    checks: [
      { name: "Color contrast", passed: true },
      { name: "Keyboard nav", passed: true },
      { name: "Screen reader", passed: true },
      { name: "Focus indicators", passed: false },
      { name: "ARIA labels", passed: true },
    ],
    issues: [
      { id: "1", description: "Missing alt text on 2 images", severity: "medium" },
      { id: "2", description: "Low contrast link in footer", severity: "low" },
    ],
  },
  lighthouseScore: 92,
};

export function getPicassoData(
  partial?: DeepPartial<PicassoData>
): PicassoData {
  return mergeWithDefaults(partial, defaultPicassoData);
}

export const picassoData = defaultPicassoData;
