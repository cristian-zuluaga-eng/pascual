// ============================================================================
// AGENTES DEL SISTEMA Y CONFIGURACION
// ============================================================================
//
// Este archivo contiene la configuracion de los 4 agentes reales del sistema:
// - Pascual: Orquestador principal, finanzas y administracion
// - Hunter: Busqueda de informacion y extraccion de datos
// - Warden: Seguridad y actualizacion del dashboard
// - Nexus: Operaciones complejas de programacion y analisis financiero
//
// Tambien contiene modelos disponibles y capacidades de agentes.
// ============================================================================

import { DeepPartial, mergeWithDefaults } from "../types/base";

// ============================================================================
// MODELOS DISPONIBLES
// ============================================================================

export const AVAILABLE_MODELS = [
  "Claude Opus",
  "Claude Sonnet",
  "Claude Haiku",
  "GPT-4o",
  "GPT-4o Mini",
  "Gemini Pro",
  "DALL-E 3",
  "Runway",
  "ElevenLabs",
];

// ============================================================================
// INTERFACES
// ============================================================================

export interface SubAgent {
  id: string;
  name: string;
  model: string;
  status: "active" | "busy" | "idle" | "offline" | "error";
  description: string;
}

export interface Agent {
  id: string;
  name: string;
  icon: string;
  description: string;
  model: string;
  role: "general" | "assistant" | "development" | "security" | "financial";
  status: "active" | "busy" | "idle" | "offline" | "error";
  activeTasks: number;
  usageHistory: number[];
  subAgents?: SubAgent[];
}

// ============================================================================
// MOCK DATA DE MODULOS (para vistas legacy)
// ============================================================================

const defaultMockAgents: Agent[] = [
  {
    id: "pascual",
    name: "Pascual",
    icon: "🧠",
    description: "Orquestador principal del sistema. Experto en finanzas y administracion de recursos informaticos. Eje central del ecosistema.",
    model: "Claude Opus",
    role: "general",
    status: "active",
    activeTasks: 12,
    usageHistory: [85, 88, 92, 90, 95, 98, 96, 99, 97, 100],
  },
  {
    id: "asistente",
    name: "Asistente",
    icon: "👤",
    description: "Gestor Personal Inteligente - Orquestacion de sistemas para gestion personal, tareas, calendario y hogar",
    model: "Claude Sonnet",
    role: "assistant",
    status: "active",
    activeTasks: 3,
    usageHistory: [45, 52, 48, 61, 55, 67, 72, 68, 75, 71],
    subAgents: [
      { id: "chronos", name: "Chronos", model: "Claude Sonnet", status: "active", description: "Gestion de Tiempo y Tareas" },
      { id: "proactive", name: "Proactive", model: "Claude Haiku", status: "active", description: "Anticipacion Proactiva" },
      { id: "domus", name: "Domus", model: "Claude Haiku", status: "active", description: "Gestion Domestica" },
    ],
  },
  {
    id: "nexus",
    name: "Nexus",
    icon: "🔧",
    description: "Director de Desarrollo de Software - Direccion estrategica del desarrollo tecnico, code review y deployment",
    model: "Claude Opus",
    role: "development",
    status: "active",
    activeTasks: 5,
    usageHistory: [60, 65, 70, 68, 75, 80, 78, 82, 85, 88],
    subAgents: [
      { id: "explorer", name: "Explorer", model: "Claude Sonnet", status: "active", description: "Analista de Codigo" },
      { id: "proposer", name: "Proposer", model: "Claude Opus", status: "active", description: "Estratega Tecnico" },
      { id: "spec-writer", name: "Spec Writer", model: "Claude Sonnet", status: "active", description: "Especificador de Requerimientos" },
      { id: "designer", name: "Designer", model: "Claude Opus", status: "busy", description: "Arquitecto de Software" },
      { id: "task-planner", name: "Task Planner", model: "Claude Sonnet", status: "active", description: "Planificador de Tareas" },
      { id: "implementador", name: "Implementador", model: "Claude Sonnet", status: "active", description: "Desarrollador" },
      { id: "verificador", name: "Verificador QA", model: "Claude Haiku", status: "active", description: "Control de Calidad" },
      { id: "auditor", name: "Auditor", model: "Claude Sonnet", status: "active", description: "Evaluador Tecnico" },
    ],
  },
  {
    id: "sentinel",
    name: "Sentinel",
    icon: "🛡️",
    description: "Guardian de Seguridad - Proteccion integral del ecosistema, monitoreo y respuesta a amenazas",
    model: "Claude Opus",
    role: "security",
    status: "active",
    activeTasks: 2,
    usageHistory: [30, 35, 42, 38, 45, 52, 48, 55, 50, 47],
    subAgents: [
      { id: "cipher", name: "Cipher", model: "Claude Opus", status: "active", description: "Director de Seguridad Digital" },
      { id: "monitor", name: "Monitor", model: "Claude Haiku", status: "active", description: "Supervisor de Rendimiento" },
      { id: "guardian", name: "Guardian", model: "Claude Sonnet", status: "active", description: "Responsable de Resiliencia" },
      { id: "warden", name: "Warden", model: "Claude Sonnet", status: "active", description: "Gestor de Acceso" },
      { id: "custodian", name: "Custodian", model: "Claude Haiku", status: "busy", description: "Administrador de Recursos" },
    ],
  },
  {
    id: "scout",
    name: "Scout",
    icon: "🔍",
    description: "Maestro en Busqueda e Ingesta de Datos - Recopilacion, sintesis y monitoreo de informacion",
    model: "Claude Sonnet",
    role: "assistant",
    status: "busy",
    activeTasks: 4,
    usageHistory: [55, 62, 58, 70, 65, 75, 72, 78, 80, 85],
    subAgents: [
      { id: "hunter", name: "Hunter", model: "Claude Sonnet", status: "busy", description: "Busqueda de informacion y extraccion de datos" },
      { id: "harvester", name: "Harvester", model: "Claude Haiku", status: "active", description: "Experto en Extraccion" },
      { id: "curator", name: "Curator", model: "Claude Haiku", status: "active", description: "Gestor de Calidad de Datos" },
      { id: "synthesizer", name: "Synthesizer", model: "Claude Sonnet", status: "busy", description: "Procesador de Informacion" },
      { id: "satelite", name: "Satelite", model: "Claude Haiku", status: "active", description: "Vigilante de Tendencias" },
    ],
  },
  {
    id: "audiovisual",
    name: "Audiovisual",
    icon: "🎬",
    description: "Orquestador Multimedia Integral - Generacion de imagenes, video, audio y contenido textual",
    model: "Claude Opus",
    role: "development",
    status: "active",
    activeTasks: 2,
    usageHistory: [40, 45, 50, 48, 55, 60, 58, 65, 62, 70],
    subAgents: [
      { id: "imagen", name: "Imagen", model: "DALL-E 3", status: "busy", description: "Especialista Visual" },
      { id: "video", name: "Video", model: "Runway", status: "active", description: "Productor Videografico" },
      { id: "audio", name: "Audio", model: "ElevenLabs", status: "active", description: "Especialista Sonoro" },
      { id: "texto", name: "Texto", model: "Claude Opus", status: "active", description: "Experto en Narrativa" },
      { id: "bibliotecario", name: "Bibliotecario", model: "Claude Haiku", status: "active", description: "Gestor de Recursos Multimedia" },
    ],
  },
  {
    id: "consultor",
    name: "Consultor",
    icon: "📚",
    description: "Orquestador Multidisciplinario de Conocimiento - Asesoria en finanzas, crianza, emprendimiento, carrera y bienestar",
    model: "Claude Opus",
    role: "assistant",
    status: "active",
    activeTasks: 2,
    usageHistory: [35, 40, 38, 45, 50, 48, 55, 52, 60, 58],
    subAgents: [
      { id: "financiero", name: "Financiero", model: "Claude Opus", status: "active", description: "Asesor Economico Personal" },
      { id: "crianza", name: "Crianza", model: "Claude Sonnet", status: "active", description: "Experto en Desarrollo Infantil" },
      { id: "emprendimiento", name: "Emprendimiento", model: "Claude Opus", status: "active", description: "Especialista en Negocios" },
      { id: "carrera", name: "Carrera", model: "Claude Sonnet", status: "active", description: "Experto en Desarrollo Profesional" },
      { id: "bienestar", name: "Bienestar", model: "Claude Sonnet", status: "active", description: "Especialista en Salud Integral" },
    ],
  },
  {
    id: "gambito",
    name: "Gambito",
    icon: "🎯",
    description: "Estratega de Prediccion Deportiva - Analisis estadistico, modelado y gestion de bankroll",
    model: "Claude Opus",
    role: "financial",
    status: "active",
    activeTasks: 3,
    usageHistory: [50, 55, 60, 58, 65, 70, 68, 75, 72, 80],
    subAgents: [
      { id: "analyst", name: "Analyst", model: "Claude Opus", status: "active", description: "Modelador Estadistico" },
      { id: "evaluator", name: "Evaluator", model: "Claude Sonnet", status: "active", description: "Validador de Modelos" },
      { id: "optimizer", name: "Optimizer", model: "Claude Sonnet", status: "busy", description: "Ajustador de Modelos" },
      { id: "manager", name: "Manager", model: "Claude Opus", status: "active", description: "Gestor de Capital" },
      { id: "monitor-g", name: "Monitor", model: "Claude Haiku", status: "active", description: "Seguimiento de Resultados" },
    ],
  },
  {
    id: "condor360",
    name: "Condor360",
    icon: "📈",
    description: "Sistema de Inteligencia Financiera - Analisis de mercados, gestion de portafolios y senales de inversion",
    model: "Claude Opus",
    role: "financial",
    status: "active",
    activeTasks: 2,
    usageHistory: [45, 50, 48, 55, 60, 58, 65, 62, 70, 68],
    subAgents: [
      { id: "cuantificador", name: "Cuantificador", model: "Claude Opus", status: "active", description: "Analista Numerico" },
      { id: "fundamental", name: "Fundamental", model: "Claude Opus", status: "active", description: "Evaluador Empresarial" },
      { id: "estratega", name: "Estratega", model: "Claude Opus", status: "busy", description: "Optimizador de Portafolios" },
      { id: "newswire", name: "Newswire", model: "Claude Sonnet", status: "active", description: "Analista de Noticias Financieras" },
      { id: "simulador", name: "Simulador", model: "Claude Sonnet", status: "active", description: "Validador de Estrategias" },
    ],
  },
  {
    id: "picasso",
    name: "Dashboard",
    icon: "🎨",
    description: "Sistema de Interfaces y Experiencia de Usuario - Diseno UX/UI, accesibilidad y rendimiento web",
    model: "Claude Opus",
    role: "development",
    status: "active",
    activeTasks: 1,
    usageHistory: [30, 35, 40, 38, 45, 50, 48, 55, 52, 58],
    subAgents: [
      { id: "designer-o", name: "Designer", model: "Claude Opus", status: "active", description: "Especialista UX/UI" },
      { id: "integrator", name: "Integrator", model: "Claude Sonnet", status: "active", description: "Experto en APIs" },
      { id: "innovator", name: "Innovator", model: "Claude Sonnet", status: "active", description: "Prototipador" },
      { id: "communicator", name: "Communicator", model: "Claude Sonnet", status: "active", description: "Visualizador de Datos" },
      { id: "conservator", name: "Conservator", model: "Claude Haiku", status: "active", description: "Gestor de Componentes" },
    ],
  },
];

// ============================================================================
// CAPACIDADES DE AGENTES
// ============================================================================

const defaultAgentCapabilities: Record<string, string[]> = {
  pascual: ["Agent Orchestration", "Strategic Decision Making", "Cross-Agent Coordination", "System Intelligence"],
  asistente: ["Task Management", "Calendar Integration", "Proactive Suggestions", "Home Automation"],
  nexus: ["Code Analysis", "Architecture Design", "Code Review", "CI/CD Automation"],
  sentinel: ["Threat Detection", "Access Control", "Vulnerability Scanning", "Backup Management"],
  scout: ["Web Scraping", "Data Synthesis", "Trend Monitoring", "API Integration"],
  audiovisual: ["Image Generation", "Video Production", "Audio Synthesis", "Content Writing"],
  consultor: ["Financial Planning", "Career Advice", "Parenting Tips", "Wellness Coaching"],
  gambito: ["Statistical Modeling", "Odds Analysis", "Bankroll Management", "Performance Tracking"],
  condor360: ["Technical Analysis", "Fundamental Analysis", "Portfolio Optimization", "Market Signals"],
  picasso: ["UI/UX Design", "Accessibility Audit", "Performance Optimization", "Component Library"],
};

// ============================================================================
// GETTERS CON MERGE
// ============================================================================

export function getMockAgents(
  partial?: Agent[]
): Agent[] {
  return partial || defaultMockAgents;
}

export function getAgentCapabilities(
  partial?: Record<string, string[]>
): Record<string, string[]> {
  return partial ? { ...defaultAgentCapabilities, ...partial } : defaultAgentCapabilities;
}

// ============================================================================
// EXPORTS
// ============================================================================

export const mockAgents = defaultMockAgents;
export const agentCapabilities = defaultAgentCapabilities;
