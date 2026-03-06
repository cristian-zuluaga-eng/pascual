import { Agent } from "@/components/dashboard/AgentCard";

export const AVAILABLE_MODELS = [
  "Claude Opus",
  "Claude Sonnet",
  "Claude Haiku",
  "GPT-4o",
  "GPT-4o Mini",
  "Gemini Pro",
];

export const mockAgents: Agent[] = [
  {
    id: "nexus",
    name: "Nexus",
    icon: "◈",
    description: "Agente central de coordinación que gestiona la comunicación entre todos los agentes del sistema PASCUAL",
    model: "Claude Opus",
    role: "general",
    status: "active",
    activeTasks: 3,
    usageHistory: [45, 52, 48, 61, 55, 67, 72, 68, 75, 71],
    subAgents: [
      { id: "nexus-1", name: "Parser", model: "Claude Haiku", status: "active", description: "Analiza y procesa texto estructurado y no estructurado" },
      { id: "nexus-2", name: "Validator", model: "Claude Haiku", status: "active", description: "Valida la integridad y formato de los datos" },
      { id: "nexus-3", name: "Orchestrator", model: "Claude Sonnet", status: "busy", description: "Coordina la comunicación entre agentes" },
    ],
  },
  {
    id: "sentinel",
    name: "Sentinel",
    icon: "⛊",
    description: "Agente de seguridad encargado de monitorear, detectar y responder a amenazas en el sistema",
    model: "Claude Sonnet",
    role: "security",
    status: "active",
    activeTasks: 2,
    usageHistory: [30, 35, 42, 38, 45, 52, 48, 55, 50, 47],
    subAgents: [
      { id: "sentinel-1", name: "Scanner", model: "Claude Haiku", status: "active", description: "Escanea vulnerabilidades en el sistema" },
      { id: "sentinel-2", name: "Monitor", model: "Claude Haiku", status: "active", description: "Monitorea actividad sospechosa en tiempo real" },
      { id: "sentinel-3", name: "Firewall", model: "Claude Sonnet", status: "offline", description: "Gestiona reglas de acceso y bloqueo" },
    ],
  },
  {
    id: "scout",
    name: "Scout",
    icon: "◎",
    description: "Agente de investigación que busca, recopila y sintetiza información de múltiples fuentes",
    model: "Claude Haiku",
    role: "assistant",
    status: "busy",
    activeTasks: 5,
    usageHistory: [60, 65, 70, 68, 75, 80, 78, 82, 85, 88],
    subAgents: [
      { id: "scout-1", name: "Hunter", model: "Claude Haiku", status: "busy", description: "Busca y localiza información relevante" },
      { id: "scout-2", name: "Harvester", model: "Claude Haiku", status: "active", description: "Recolecta y extrae datos de múltiples fuentes" },
      { id: "scout-3", name: "Curator", model: "Claude Haiku", status: "busy", description: "Organiza y clasifica la información recopilada" },
      { id: "scout-4", name: "Synthesizer", model: "Claude Sonnet", status: "active", description: "Sintetiza y resume información compleja" },
    ],
  },
  {
    id: "oracle",
    name: "Condor360",
    icon: "⟁",
    description: "Agente financiero especializado en análisis de mercados, estrategias de inversión y gestión de portafolios",
    model: "Claude Sonnet",
    role: "financial",
    status: "active",
    activeTasks: 1,
    usageHistory: [25, 28, 32, 30, 35, 38, 42, 40, 45, 48],
    subAgents: [
      { id: "oracle-1", name: "Cuantificador", model: "Claude Sonnet", status: "active", description: "Análisis cuantitativo de mercados financieros" },
      { id: "oracle-2", name: "Fundamental", model: "Claude Sonnet", status: "active", description: "Análisis fundamental de activos y empresas" },
      { id: "oracle-3", name: "Estratega", model: "Claude Opus", status: "offline", description: "Diseña estrategias de inversión optimizadas" },
    ],
  },
  {
    id: "forge",
    name: "Dashboard",
    icon: "⌘",
    description: "Agente de desarrollo encargado de crear, mantener y mejorar las interfaces y sistemas del ecosistema",
    model: "Claude Opus",
    role: "development",
    status: "offline",
    activeTasks: 0,
    usageHistory: [80, 75, 70, 65, 60, 55, 50, 45, 40, 35],
    subAgents: [
      { id: "forge-1", name: "Diseñador", model: "Claude Sonnet", status: "offline", description: "Crea interfaces y experiencias de usuario" },
      { id: "forge-2", name: "Integrador", model: "Claude Haiku", status: "offline", description: "Conecta sistemas y APIs externas" },
      { id: "forge-3", name: "Innovador", model: "Claude Opus", status: "offline", description: "Propone mejoras y nuevas funcionalidades" },
    ],
  },
];

// Agent capabilities (used in agent detail modal)
export const agentCapabilities = [
  "Natural Language",
  "Code Analysis",
  "Data Processing",
  "Active Learning",
];
