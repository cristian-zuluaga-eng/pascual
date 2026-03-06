// PASCUAL Ecosystem - Agent Dashboard Mock Data
// Based on REQUIREMENTS-AGENT-DASHBOARDS-V2.md

export type AgentStatus = "active" | "busy" | "idle" | "offline" | "error";
export type Priority = "critical" | "high" | "medium" | "low";
export type ConvictionLevel = "high" | "medium" | "low";

// ============================================================================
// SHARED INTERFACES
// ============================================================================

export interface SubAgentStatus {
  id: string;
  name: string;
  description: string;
  model: string;
  status: AgentStatus;
  activeTasks: number;
  lastActivity: string;
}

export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  prompt: string;
}

export interface PascualMessage {
  id: string;
  timestamp: string;
  agentId: string;
  query: string;
  response: string;
  confidence?: number;
  suggestedActions?: string[];
}

export interface AgentBase {
  id: string;
  name: string;
  icon: string;
  lema: string;
  description: string;
  status: AgentStatus;
  lastSync: string;
  subAgents: SubAgentStatus[];
  quickActions: QuickAction[];
  recentMessages: PascualMessage[];
}

// ============================================================================
// 1. ASISTENTE - Gestor Personal
// ============================================================================

export interface AsistenteMetrics {
  tasksToday: number;
  tasksCompleted: number;
  tasksPending: number;
  weeklyCompletionRate: number;
  suggestionsGenerated: number;
  suggestionsAccepted: number;
  proactiveAccuracy: number;
  pantryLevel: number;
  cleaningSuppliesLevel: number;
  maintenanceStatus: "ok" | "attention" | "urgent";
  userSatisfaction: number;
  nextReminder: string;
}

export interface ScheduleEvent {
  id: string;
  time: string;
  title: string;
  completed: boolean;
  type: "work" | "personal" | "health" | "family";
}

export interface Task {
  id: string;
  title: string;
  status: "completed" | "pending" | "in_progress";
  priority: Priority;
  dueDate?: string;
}

export interface ProactiveSuggestion {
  id: string;
  text: string;
  source: "chronos" | "proactive" | "domus";
  confidence: number;
}

export interface AsistenteData extends AgentBase {
  metrics: AsistenteMetrics;
  todaySchedule: ScheduleEvent[];
  tasks: Task[];
  suggestions: ProactiveSuggestion[];
  upcomingPurchases: string[];
}

export const asistenteData: AsistenteData = {
  id: "asistente",
  name: "Asistente",
  icon: "👤",
  lema: "Organización proactiva, vida simplificada",
  description: "Gestor Personal Inteligente - Orquestación de sistemas para gestión personal",
  status: "active",
  lastSync: "hace 2s",
  subAgents: [
    { id: "chronos", name: "Chronos", description: "Gestión de Tiempo y Tareas", model: "Claude Sonnet", status: "active", activeTasks: 2, lastActivity: "hace 1m" },
    { id: "proactive", name: "Proactive", description: "Anticipación Proactiva", model: "Claude Haiku", status: "active", activeTasks: 1, lastActivity: "hace 5m" },
    { id: "domus", name: "Domus", description: "Gestión Doméstica", model: "Claude Haiku", status: "idle", activeTasks: 0, lastActivity: "hace 15m" },
  ],
  quickActions: [
    { id: "plan-day", label: "Planificar mi día", icon: "📅", prompt: "Pascual, ayúdame a organizar mi día de hoy" },
    { id: "reminder", label: "Recordatorio", icon: "⏰", prompt: "Pascual, necesito un recordatorio para..." },
    { id: "shopping", label: "Lista de compras", icon: "🛒", prompt: "Pascual, genera una lista de compras basada en mi inventario" },
    { id: "routine", label: "Optimizar rutina", icon: "🔄", prompt: "Pascual, analiza mi rutina y sugiere mejoras" },
  ],
  recentMessages: [
    { id: "1", timestamp: "hace 5m", agentId: "asistente", query: "¿Qué tengo pendiente hoy?", response: "Tienes 3 reuniones y 5 tareas pendientes. La primera reunión es a las 09:00.", confidence: 0.95 },
  ],
  metrics: {
    tasksToday: 12,
    tasksCompleted: 7,
    tasksPending: 5,
    weeklyCompletionRate: 85,
    suggestionsGenerated: 15,
    suggestionsAccepted: 12,
    proactiveAccuracy: 82,
    pantryLevel: 78,
    cleaningSuppliesLevel: 45,
    maintenanceStatus: "ok",
    userSatisfaction: 4.5,
    nextReminder: "15 min",
  },
  todaySchedule: [
    { id: "1", time: "09:00", title: "Reunión de equipo", completed: false, type: "work" },
    { id: "2", time: "10:30", title: "Call con cliente", completed: false, type: "work" },
    { id: "3", time: "12:00", title: "Almuerzo", completed: false, type: "personal" },
    { id: "4", time: "14:00", title: "Revisión de proyecto", completed: false, type: "work" },
    { id: "5", time: "16:00", title: "Ejercicio", completed: false, type: "health" },
    { id: "6", time: "18:00", title: "Tiempo en familia", completed: false, type: "family" },
  ],
  tasks: [
    { id: "1", title: "Enviar propuesta", status: "completed", priority: "high" },
    { id: "2", title: "Llamar al médico", status: "pending", priority: "medium" },
    { id: "3", title: "Revisar presupuesto", status: "pending", priority: "high" },
    { id: "4", title: "Comprar regalo cumpleaños", status: "pending", priority: "low" },
    { id: "5", title: "Actualizar documentación", status: "in_progress", priority: "medium" },
  ],
  suggestions: [
    { id: "1", text: "Revisar emails pendientes (5 sin leer)", source: "proactive", confidence: 0.92 },
    { id: "2", text: "Preparar informe semanal (vence mañana)", source: "chronos", confidence: 0.88 },
    { id: "3", text: "Comprar leche (inventario bajo)", source: "domus", confidence: 0.95 },
  ],
  upcomingPurchases: ["Leche", "Pan", "Detergente"],
};

// ============================================================================
// 2. NEXUS - Director de Desarrollo
// ============================================================================

export interface NexusMetrics {
  testCoverage: number;
  codeComplexity: number;
  maintainabilityIndex: number;
  documentationCoverage: number;
  technicalDebt: "low" | "medium" | "high";
  architectureCoherence: number;
  deploysThisWeek: number;
  deploySuccessRate: number;
  prsOpen: number;
  prsMerged: number;
  bugsOpen: number;
  avgResponseTime: number;
  tokenUsageDaily: number;
}

export interface PipelineItem {
  id: string;
  title: string;
  stage: "analysis" | "design" | "implement" | "testing" | "review" | "deploy";
  priority: Priority;
}

export interface Commit {
  hash: string;
  message: string;
  author: string;
  time: string;
}

export interface ModelPerformance {
  model: string;
  accuracy: number;
  avgResponseTime: number;
}

export interface NexusData extends AgentBase {
  metrics: NexusMetrics;
  pipeline: PipelineItem[];
  recentCommits: Commit[];
  modelPerformance: ModelPerformance[];
}

export const nexusData: NexusData = {
  id: "nexus",
  name: "Nexus",
  icon: "🔧",
  lema: "Excelencia técnica, evolución constante",
  description: "Director de Desarrollo de Software - Dirección estratégica del desarrollo técnico",
  status: "active",
  lastSync: "hace 5m",
  subAgents: [
    { id: "explorer", name: "Explorer", description: "Analista de Código", model: "Claude Sonnet", status: "active", activeTasks: 1, lastActivity: "hace 2m" },
    { id: "proposer", name: "Proposer", description: "Estratega Técnico", model: "Claude Opus", status: "active", activeTasks: 0, lastActivity: "hace 10m" },
    { id: "spec-writer", name: "Spec Writer", description: "Especificador", model: "Claude Sonnet", status: "active", activeTasks: 1, lastActivity: "hace 5m" },
    { id: "designer", name: "Designer", description: "Arquitecto", model: "Claude Opus", status: "busy", activeTasks: 2, lastActivity: "hace 1m" },
    { id: "task-planner", name: "Task Planner", description: "Planificador", model: "Claude Sonnet", status: "idle", activeTasks: 0, lastActivity: "hace 30m" },
    { id: "implementador", name: "Implementador", description: "Desarrollador", model: "Claude Sonnet", status: "active", activeTasks: 1, lastActivity: "hace 3m" },
    { id: "verificador", name: "Verificador QA", description: "Control de Calidad", model: "Claude Haiku", status: "active", activeTasks: 0, lastActivity: "hace 15m" },
    { id: "auditor", name: "Auditor", description: "Evaluador Técnico", model: "Claude Sonnet", status: "idle", activeTasks: 0, lastActivity: "hace 1h" },
  ],
  quickActions: [
    { id: "analyze", label: "Analizar código", icon: "🔍", prompt: "Pascual, analiza el código de [componente] y sugiere mejoras" },
    { id: "feature", label: "Nueva feature", icon: "✨", prompt: "Pascual, planifica la implementación de [feature]" },
    { id: "review", label: "Code review", icon: "👁", prompt: "Pascual, realiza code review del PR [número]" },
    { id: "deploy", label: "Deploy", icon: "🚀", prompt: "Pascual, prepara el deploy de [versión]" },
  ],
  recentMessages: [],
  metrics: {
    testCoverage: 87,
    codeComplexity: 78,
    maintainabilityIndex: 92,
    documentationCoverage: 68,
    technicalDebt: "low",
    architectureCoherence: 85,
    deploysThisWeek: 12,
    deploySuccessRate: 98,
    prsOpen: 5,
    prsMerged: 23,
    bugsOpen: 3,
    avgResponseTime: 2300,
    tokenUsageDaily: 45000,
  },
  pipeline: [
    { id: "PR-1", title: "Auth module refactor", stage: "analysis", priority: "high" },
    { id: "PR-2", title: "API optimization", stage: "analysis", priority: "medium" },
    { id: "PR-3", title: "Dashboard components", stage: "design", priority: "high" },
    { id: "PR-4", title: "Database migration", stage: "design", priority: "medium" },
    { id: "PR-5", title: "User settings page", stage: "implement", priority: "low" },
    { id: "PR-6", title: "Notification system", stage: "implement", priority: "high" },
    { id: "PR-7", title: "Search functionality", stage: "testing", priority: "medium" },
    { id: "PR-8", title: "Security patches", stage: "review", priority: "critical" },
    { id: "v2.4", title: "Release v2.4.0", stage: "deploy", priority: "high" },
  ],
  recentCommits: [
    { hash: "a3f2b1", message: "feat: Add auth module", author: "Nexus", time: "hace 2h" },
    { hash: "b4c3d2", message: "fix: Login redirect issue", author: "Nexus", time: "hace 4h" },
    { hash: "c5d4e3", message: "refactor: API layer optimization", author: "Nexus", time: "hace 6h" },
    { hash: "d6e5f4", message: "test: Add unit tests for auth", author: "Nexus", time: "hace 8h" },
  ],
  modelPerformance: [
    { model: "Claude Opus", accuracy: 89, avgResponseTime: 3200 },
    { model: "Claude Sonnet", accuracy: 94, avgResponseTime: 1800 },
    { model: "Claude Haiku", accuracy: 67, avgResponseTime: 450 },
  ],
};

// ============================================================================
// 3. SENTINEL - Guardián de Seguridad
// ============================================================================

export interface SentinelMetrics {
  securityScore: number;
  uptime: number;
  threatsDetected: number;
  threatsBlocked: number;
  mttd: number; // Mean Time To Detect (seconds)
  mttr: number; // Mean Time To Resolve (seconds)
  complianceScore: number;
  failedLogins24h: number;
  activeApiKeys: number;
  activeSessions: number;
}

export interface ThreatEvent {
  id: string;
  severity: "critical" | "warning" | "info";
  title: string;
  description: string;
  timestamp: string;
  status: "active" | "resolved" | "investigating";
}

export interface SystemResource {
  name: string;
  usage: number;
  status: "ok" | "warning" | "critical";
}

export interface AccessLog {
  id: string;
  user: string;
  action: "login" | "logout" | "api_call" | "failed_login";
  timestamp: string;
  success: boolean;
  ip?: string;
}

export interface VulnerabilityScan {
  lastScan: string;
  critical: number;
  high: number;
  medium: number;
  low: number;
}

export interface BackupStatus {
  lastBackup: string;
  nextBackup: string;
  recoveryTestStatus: "passed" | "failed" | "pending";
  size: string;
}

export interface SentinelData extends AgentBase {
  metrics: SentinelMetrics;
  threats: ThreatEvent[];
  systemResources: SystemResource[];
  accessLogs: AccessLog[];
  vulnerabilities: VulnerabilityScan;
  backup: BackupStatus;
}

export const sentinelData: SentinelData = {
  id: "sentinel",
  name: "Sentinel",
  icon: "🛡️",
  lema: "Vigilancia infalible, protección inquebrantable",
  description: "Guardián de Seguridad - Protección integral del ecosistema",
  status: "active",
  lastSync: "tiempo real",
  subAgents: [
    { id: "cipher", name: "Cipher", description: "Director de Seguridad Digital", model: "Claude Opus", status: "active", activeTasks: 1, lastActivity: "hace 30s" },
    { id: "monitor", name: "Monitor", description: "Supervisor de Rendimiento", model: "Claude Haiku", status: "active", activeTasks: 1, lastActivity: "hace 10s" },
    { id: "guardian", name: "Guardian", description: "Responsable de Resiliencia", model: "Claude Sonnet", status: "active", activeTasks: 0, lastActivity: "hace 2m" },
    { id: "warden", name: "Warden", description: "Gestor de Acceso", model: "Claude Sonnet", status: "active", activeTasks: 0, lastActivity: "hace 5m" },
    { id: "custodian", name: "Custodian", description: "Administrador de Recursos", model: "Claude Haiku", status: "busy", activeTasks: 1, lastActivity: "hace 1m" },
  ],
  quickActions: [
    { id: "scan", label: "Escaneo completo", icon: "🔍", prompt: "Pascual, ejecuta un escaneo de seguridad completo" },
    { id: "audit", label: "Auditar accesos", icon: "📋", prompt: "Pascual, genera un reporte de auditoría de accesos" },
    { id: "threats", label: "Ver amenazas", icon: "⚠️", prompt: "Pascual, muéstrame las amenazas detectadas hoy" },
    { id: "backup", label: "Backup ahora", icon: "💾", prompt: "Pascual, ejecuta un backup inmediato del sistema" },
  ],
  recentMessages: [],
  metrics: {
    securityScore: 94,
    uptime: 99.9,
    threatsDetected: 12,
    threatsBlocked: 12,
    mttd: 3.2,
    mttr: 45,
    complianceScore: 100,
    failedLogins24h: 7,
    activeApiKeys: 12,
    activeSessions: 3,
  },
  threats: [
    { id: "1", severity: "warning", title: "Unusual login pattern", description: "Multiple login attempts from new location", timestamp: "hace 2m", status: "investigating" },
    { id: "2", severity: "info", title: "Firewall rule updated", description: "New rule added for API protection", timestamp: "hace 15m", status: "resolved" },
    { id: "3", severity: "warning", title: "Rate limit triggered", description: "API rate limit exceeded for endpoint /api/search", timestamp: "hace 32m", status: "resolved" },
  ],
  systemResources: [
    { name: "CPU", usage: 78, status: "ok" },
    { name: "Memory", usage: 62, status: "ok" },
    { name: "Disk", usage: 71, status: "ok" },
    { name: "Network", usage: 45, status: "ok" },
  ],
  accessLogs: [
    { id: "1", user: "admin@pascual", action: "login", timestamp: "hace 10m", success: true },
    { id: "2", user: "api-nexus", action: "api_call", timestamp: "hace 25m", success: true },
    { id: "3", user: "unknown", action: "failed_login", timestamp: "hace 45m", success: false, ip: "203.0.113.45" },
  ],
  vulnerabilities: {
    lastScan: "hace 1h",
    critical: 0,
    high: 1,
    medium: 3,
    low: 8,
  },
  backup: {
    lastBackup: "hace 2h",
    nextBackup: "en 4h",
    recoveryTestStatus: "passed",
    size: "4.2GB",
  },
};

// ============================================================================
// 4. SCOUT - Búsqueda de Datos
// ============================================================================

export interface ScoutMetrics {
  searchesToday: number;
  searchAccuracy: number;
  sourcesActive: number;
  dataProcessed: string;
  alertsPending: number;
  cacheHitRate: number;
  avgSearchLatency: number;
  dailyQuotaUsed: number;
}

export interface SearchResult {
  id: string;
  query: string;
  resultCount: number;
  timestamp: string;
  status: "completed" | "processing" | "failed";
}

export interface MonitoredTrend {
  id: string;
  name: string;
  icon: string;
  change: string;
  direction: "up" | "down" | "neutral";
  newItems?: number;
}

export interface DataSource {
  id: string;
  name: string;
  status: "active" | "rate_limited" | "offline" | "error";
  reliability: number;
}

export interface ScoutData extends AgentBase {
  metrics: ScoutMetrics;
  recentSearches: SearchResult[];
  monitoredTrends: MonitoredTrend[];
  dataSources: DataSource[];
  resourceUsage: { cpu: number; memory: number; api: number };
}

export const scoutData: ScoutData = {
  id: "scout",
  name: "Scout",
  icon: "🔍",
  lema: "Toda la información, donde la necesites, cuando la necesites",
  description: "Maestro en Búsqueda e Ingesta de Datos",
  status: "active",
  lastSync: "continua",
  subAgents: [
    { id: "hunter", name: "Hunter", description: "Especialista en Búsqueda", model: "Claude Sonnet", status: "busy", activeTasks: 2, lastActivity: "hace 30s" },
    { id: "harvester", name: "Harvester", description: "Experto en Extracción", model: "Claude Haiku", status: "active", activeTasks: 1, lastActivity: "hace 1m" },
    { id: "curator", name: "Curator", description: "Gestor de Calidad", model: "Claude Haiku", status: "active", activeTasks: 0, lastActivity: "hace 5m" },
    { id: "synthesizer", name: "Synthesizer", description: "Procesador de Información", model: "Claude Sonnet", status: "busy", activeTasks: 1, lastActivity: "hace 2m" },
    { id: "satelite", name: "Satelite", description: "Vigilante de Tendencias", model: "Claude Haiku", status: "active", activeTasks: 0, lastActivity: "hace 10m" },
  ],
  quickActions: [
    { id: "search", label: "Buscar datos", icon: "🔍", prompt: "Pascual, busca información sobre [tema]" },
    { id: "monitor", label: "Monitorear tema", icon: "📡", prompt: "Pascual, monitorea actualizaciones sobre [tema]" },
    { id: "extract", label: "Extraer de URL", icon: "📥", prompt: "Pascual, extrae datos de [URL]" },
    { id: "synthesize", label: "Sintetizar", icon: "📊", prompt: "Pascual, sintetiza la información recopilada sobre [tema]" },
  ],
  recentMessages: [],
  metrics: {
    searchesToday: 245,
    searchAccuracy: 96,
    sourcesActive: 34,
    dataProcessed: "4.2 GB",
    alertsPending: 3,
    cacheHitRate: 78,
    avgSearchLatency: 1200,
    dailyQuotaUsed: 62,
  },
  recentSearches: [
    { id: "1", query: "AI market trends 2025", resultCount: 156, timestamp: "hace 2m", status: "completed" },
    { id: "2", query: "React 19 features", resultCount: 89, timestamp: "hace 15m", status: "completed" },
    { id: "3", query: "Colombian economy 2025", resultCount: 234, timestamp: "hace 1h", status: "completed" },
  ],
  monitoredTrends: [
    { id: "1", name: "Bitcoin price", icon: "📈", change: "+2.3%", direction: "up" },
    { id: "2", name: "Tech news", icon: "📰", change: "12 new", direction: "up", newItems: 12 },
    { id: "3", name: "LaLiga standings", icon: "⚽", change: "Updated", direction: "neutral" },
    { id: "4", name: "S&P 500", icon: "📊", change: "-0.5%", direction: "down" },
    { id: "5", name: "Competitor activity", icon: "🌐", change: "3 new", direction: "up", newItems: 3 },
  ],
  dataSources: [
    { id: "1", name: "NewsAPI", status: "active", reliability: 98 },
    { id: "2", name: "Twitter/X", status: "active", reliability: 95 },
    { id: "3", name: "Financial APIs", status: "active", reliability: 99 },
    { id: "4", name: "Reddit", status: "rate_limited", reliability: 45 },
    { id: "5", name: "Google Scholar", status: "active", reliability: 92 },
  ],
  resourceUsage: { cpu: 28, memory: 45, api: 62 },
};

// ============================================================================
// 5. AUDIOVISUAL - Multimedia
// ============================================================================

export interface AudiovisualMetrics {
  assetsGenerated: number;
  inQueue: number;
  avgQuality: number;
  storageUsed: string;
  assetReuseRate: number;
  brandCoherenceScore: number;
}

export interface ProductionItem {
  id: string;
  title: string;
  type: "image" | "video" | "audio" | "text";
  status: "processing" | "queued" | "completed" | "failed";
  progress?: number;
  priority: Priority;
  estimatedTime?: string;
}

export interface Asset {
  id: string;
  name: string;
  type: "image" | "video" | "audio" | "text";
  thumbnail?: string;
  usageCount: number;
  createdAt: string;
}

export interface AssetLibraryStats {
  images: { count: number; size: string };
  videos: { count: number; size: string };
  audio: { count: number; size: string };
  text: { count: number; size: string };
  mostUsed: string;
}

export interface AudiovisualData extends AgentBase {
  metrics: AudiovisualMetrics;
  productionQueue: ProductionItem[];
  recentAssets: Asset[];
  libraryStats: AssetLibraryStats;
  brandCoherence: { colorPalette: boolean; typography: boolean; logoUsage: boolean; toneOfVoice: boolean };
}

export const audiovisualData: AudiovisualData = {
  id: "audiovisual",
  name: "Audiovisual",
  icon: "🎬",
  lema: "La forma perfecta para cada mensaje",
  description: "Orquestador Multimedia Integral",
  status: "active",
  lastSync: "por demanda",
  subAgents: [
    { id: "imagen", name: "Imagen", description: "Especialista Visual", model: "DALL-E 3", status: "busy", activeTasks: 1, lastActivity: "hace 1m" },
    { id: "video", name: "Video", description: "Productor Videográfico", model: "Runway", status: "idle", activeTasks: 0, lastActivity: "hace 2h" },
    { id: "audio", name: "Audio", description: "Especialista Sonoro", model: "ElevenLabs", status: "active", activeTasks: 0, lastActivity: "hace 30m" },
    { id: "texto", name: "Texto", description: "Experto en Narrativa", model: "Claude Opus", status: "active", activeTasks: 0, lastActivity: "hace 15m" },
    { id: "bibliotecario", name: "Bibliotecario", description: "Gestor de Recursos", model: "Claude Haiku", status: "active", activeTasks: 0, lastActivity: "hace 5m" },
  ],
  quickActions: [
    { id: "image", label: "Crear imagen", icon: "🖼️", prompt: "Pascual, genera una imagen de [descripción]" },
    { id: "video", label: "Generar video", icon: "🎬", prompt: "Pascual, crea un video explicativo sobre [tema]" },
    { id: "audio", label: "Audio/Voz", icon: "🎵", prompt: "Pascual, genera audio narrado de [texto]" },
    { id: "text", label: "Texto creativo", icon: "📝", prompt: "Pascual, escribe [tipo de contenido] sobre [tema]" },
  ],
  recentMessages: [],
  metrics: {
    assetsGenerated: 156,
    inQueue: 3,
    avgQuality: 87,
    storageUsed: "2.3 GB",
    assetReuseRate: 34,
    brandCoherenceScore: 94,
  },
  productionQueue: [
    { id: "1", title: "Banner promocional", type: "image", status: "processing", progress: 67, priority: "high", estimatedTime: "2 min" },
    { id: "2", title: "Narración explicativa", type: "audio", status: "queued", priority: "high" },
    { id: "3", title: "Video tutorial", type: "video", status: "queued", priority: "medium" },
  ],
  recentAssets: [
    { id: "1", name: "Logo principal", type: "image", usageCount: 45, createdAt: "hace 2d" },
    { id: "2", name: "Banner hero", type: "image", usageCount: 23, createdAt: "hace 3d" },
    { id: "3", name: "Jingle intro", type: "audio", usageCount: 12, createdAt: "hace 1w" },
    { id: "4", name: "Script promo", type: "text", usageCount: 8, createdAt: "hace 1w" },
  ],
  libraryStats: {
    images: { count: 89, size: "1.2 GB" },
    videos: { count: 23, size: "800 MB" },
    audio: { count: 34, size: "200 MB" },
    text: { count: 67, size: "50 MB" },
    mostUsed: "logo-main.svg (45x)",
  },
  brandCoherence: {
    colorPalette: true,
    typography: true,
    logoUsage: true,
    toneOfVoice: true,
  },
};

// ============================================================================
// 6. CONSULTOR - Conocimiento Experto
// ============================================================================

export interface ConsultorMetrics {
  consultationsThisMonth: number;
  userSatisfaction: number;
  activePlans: number;
  followUpRate: number;
  recommendationSuccessRate: number;
}

export interface ExpertiseArea {
  id: string;
  name: string;
  icon: string;
  consultations: number;
  rating: number;
  lastConsultation: string;
}

export interface ActivePlan {
  id: string;
  name: string;
  progress: number;
  nextAction: string;
  area: string;
}

export interface Recommendation {
  id: string;
  text: string;
  area: string;
  implemented: "yes" | "in_progress" | "pending";
  result?: "positive" | "neutral" | "negative";
  adherence?: number;
}

export interface ConsultorData extends AgentBase {
  metrics: ConsultorMetrics;
  expertiseAreas: ExpertiseArea[];
  activePlans: ActivePlan[];
  recentRecommendations: Recommendation[];
}

export const consultorData: ConsultorData = {
  id: "consultor",
  name: "Consultor",
  icon: "📚",
  lema: "Conocimiento especializado, visión integral",
  description: "Orquestador Multidisciplinario de Conocimiento",
  status: "active",
  lastSync: "por consulta",
  subAgents: [
    { id: "financiero", name: "Financiero", description: "Asesor Económico", model: "Claude Opus", status: "active", activeTasks: 1, lastActivity: "hace 10m" },
    { id: "crianza", name: "Crianza", description: "Experto en Desarrollo Infantil", model: "Claude Sonnet", status: "active", activeTasks: 0, lastActivity: "hace 2h" },
    { id: "emprendimiento", name: "Emprendimiento", description: "Especialista en Negocios", model: "Claude Opus", status: "active", activeTasks: 1, lastActivity: "hace 30m" },
    { id: "carrera", name: "Carrera", description: "Experto en Desarrollo Profesional", model: "Claude Sonnet", status: "active", activeTasks: 0, lastActivity: "hace 1h" },
    { id: "bienestar", name: "Bienestar", description: "Especialista en Salud Integral", model: "Claude Sonnet", status: "idle", activeTasks: 0, lastActivity: "hace 3h" },
  ],
  quickActions: [
    { id: "finance", label: "Finanzas", icon: "💰", prompt: "Pascual, necesito asesoría financiera sobre [tema]" },
    { id: "parenting", label: "Crianza", icon: "👶", prompt: "Pascual, consulta sobre crianza: [situación]" },
    { id: "business", label: "Emprendimiento", icon: "🚀", prompt: "Pascual, asesoría para mi emprendimiento: [tema]" },
    { id: "career", label: "Carrera", icon: "💼", prompt: "Pascual, orientación profesional sobre [tema]" },
  ],
  recentMessages: [],
  metrics: {
    consultationsThisMonth: 89,
    userSatisfaction: 4.7,
    activePlans: 5,
    followUpRate: 68,
    recommendationSuccessRate: 82,
  },
  expertiseAreas: [
    { id: "1", name: "Financiero", icon: "💰", consultations: 34, rating: 4.8, lastConsultation: "Optimizar ahorro" },
    { id: "2", name: "Crianza", icon: "👶", consultations: 12, rating: 4.9, lastConsultation: "Rutinas de sueño" },
    { id: "3", name: "Emprendimiento", icon: "🚀", consultations: 23, rating: 4.6, lastConsultation: "Pitch deck" },
    { id: "4", name: "Carrera", icon: "💼", consultations: 15, rating: 4.7, lastConsultation: "Negociación salarial" },
    { id: "5", name: "Bienestar", icon: "🧘", consultations: 5, rating: 4.8, lastConsultation: "Plan de ejercicios" },
  ],
  activePlans: [
    { id: "1", name: "Plan Ahorro Emergencia", progress: 78, nextAction: "Revisar presupuesto", area: "Financiero" },
    { id: "2", name: "Desarrollo Profesional", progress: 45, nextAction: "Actualizar CV", area: "Carrera" },
    { id: "3", name: "Bienestar Integral", progress: 92, nextAction: "Checkup médico", area: "Bienestar" },
  ],
  recentRecommendations: [
    { id: "1", text: "Considera diversificar tu portafolio de inversiones", area: "Financiero", implemented: "yes", result: "positive" },
    { id: "2", text: "Establecer rutina de ejercicio 3x semana", area: "Bienestar", implemented: "in_progress", adherence: 67 },
    { id: "3", text: "Actualizar LinkedIn con nuevas certificaciones", area: "Carrera", implemented: "pending" },
  ],
};

// ============================================================================
// 7. GAMBITO - Predicción Deportiva
// ============================================================================

export interface GambitoMetrics {
  roi: number;
  winRate: number;
  modelAccuracy: number;
  expectedValue: number;
  sharpeRatio: number;
  maxDrawdown: number;
  predictionsToday: number;
  highConfidenceCount: number;
}

export interface Prediction {
  id: string;
  sport: string;
  sportIcon: string;
  match: string;
  odds: string;
  prediction: string;
  value: number;
  confidence: ConvictionLevel;
  timestamp: string;
}

export interface MarketPerformance {
  market: string;
  icon: string;
  roi: number;
}

export interface ModelStats {
  name: string;
  accuracy: number;
  lastCalibration: string;
}

export interface BankrollInfo {
  initial: number;
  current: number;
  pnl: number;
  pnlPercent: number;
  avgStake: number;
  kellyFraction: number;
}

export interface GambitoData extends AgentBase {
  metrics: GambitoMetrics;
  activePredictions: Prediction[];
  marketPerformance: MarketPerformance[];
  modelStats: ModelStats[];
  bankroll: BankrollInfo;
}

export const gambitoData: GambitoData = {
  id: "gambito",
  name: "Gambito",
  icon: "🎯",
  lema: "La ventaja está en los datos, la excelencia en la iteración",
  description: "Estratega de Predicción Deportiva",
  status: "active",
  lastSync: "cada 1h",
  subAgents: [
    { id: "analyst", name: "Analyst", description: "Modelador Estadístico", model: "Claude Opus", status: "active", activeTasks: 1, lastActivity: "hace 15m" },
    { id: "evaluator", name: "Evaluator", description: "Validador de Modelos", model: "Claude Sonnet", status: "active", activeTasks: 1, lastActivity: "hace 30m" },
    { id: "optimizer", name: "Optimizer", description: "Ajustador de Modelos", model: "Claude Sonnet", status: "busy", activeTasks: 1, lastActivity: "hace 5m" },
    { id: "manager", name: "Manager", description: "Gestor de Capital", model: "Claude Opus", status: "active", activeTasks: 0, lastActivity: "hace 1h" },
    { id: "monitor-g", name: "Monitor", description: "Seguimiento de Resultados", model: "Claude Haiku", status: "active", activeTasks: 0, lastActivity: "hace 10m" },
  ],
  quickActions: [
    { id: "analyze", label: "Analizar partido", icon: "⚽", prompt: "Pascual, analiza el partido [equipo1] vs [equipo2]" },
    { id: "models", label: "Ver modelos", icon: "📊", prompt: "Pascual, muestra el rendimiento actual de los modelos" },
    { id: "roi", label: "ROI report", icon: "💰", prompt: "Pascual, genera reporte de ROI del último mes" },
    { id: "value", label: "Value bets", icon: "🎯", prompt: "Pascual, identifica value bets disponibles ahora" },
  ],
  recentMessages: [],
  metrics: {
    roi: 8.3,
    winRate: 57,
    modelAccuracy: 72,
    expectedValue: 0.034,
    sharpeRatio: 1.45,
    maxDrawdown: -4.2,
    predictionsToday: 12,
    highConfidenceCount: 3,
  },
  activePredictions: [
    { id: "1", sport: "Fútbol", sportIcon: "⚽", match: "Real Madrid vs Barcelona", odds: "1: 2.10 | X: 3.40 | 2: 3.20", prediction: "1 (45%)", value: 0.08, confidence: "high", timestamp: "En 3h" },
    { id: "2", sport: "Tenis", sportIcon: "🎾", match: "Djokovic vs Alcaraz", odds: "1: 1.85 | 2: 2.05", prediction: "2 (52%)", value: 0.04, confidence: "medium", timestamp: "Mañana" },
    { id: "3", sport: "Basket", sportIcon: "🏀", match: "Lakers vs Celtics", odds: "Spread: -3.5 | Total: 224.5", prediction: "Over", value: 0.03, confidence: "medium", timestamp: "En 6h" },
  ],
  marketPerformance: [
    { market: "Fútbol", icon: "⚽", roi: 12 },
    { market: "Tenis", icon: "🎾", roi: 6 },
    { market: "Basket", icon: "🏀", roi: 8 },
    { market: "Baseball", icon: "⚾", roi: 4 },
    { market: "MMA", icon: "🥊", roi: 2 },
  ],
  modelStats: [
    { name: "Poisson Model", accuracy: 78, lastCalibration: "hace 2h" },
    { name: "Dixon-Coles", accuracy: 82, lastCalibration: "hace 4h" },
    { name: "ELO Dynamic", accuracy: 71, lastCalibration: "hace 6h" },
    { name: "ML Ensemble", accuracy: 79, lastCalibration: "hace 3h" },
  ],
  bankroll: {
    initial: 10000,
    current: 10830,
    pnl: 830,
    pnlPercent: 8.3,
    avgStake: 2.3,
    kellyFraction: 35,
  },
};

// ============================================================================
// 8. CÓNDOR360 - Inteligencia Financiera
// ============================================================================

export interface Condor360Metrics {
  portfolioReturn: number;
  sharpeRatio: number;
  maxDrawdown: number;
  alpha: number;
  signalsActive: number;
  predictionAccuracy: number;
}

export interface PortfolioAllocation {
  asset: string;
  percentage: number;
  color: string;
}

export interface Holding {
  symbol: string;
  percentage: number;
  todayChange: number;
}

export interface MarketSignal {
  id: string;
  conviction: ConvictionLevel;
  symbol: string;
  title: string;
  target: number;
  current: number;
  upside: number;
  action?: string;
}

export interface SectorPerformance {
  sector: string;
  change: number;
}

export interface FinancialNews {
  id: string;
  title: string;
  impact: "positive" | "negative" | "neutral";
  timestamp: string;
}

export interface Condor360Data extends AgentBase {
  metrics: Condor360Metrics;
  portfolioAllocation: PortfolioAllocation[];
  topHoldings: Holding[];
  marketSignals: MarketSignal[];
  sectorPerformance: SectorPerformance[];
  news: FinancialNews[];
  marketSentiment: "bullish" | "neutral" | "bearish";
  vix: number;
}

export const condor360Data: Condor360Data = {
  id: "condor360",
  name: "Cóndor360",
  icon: "📈",
  lema: "Visión panorámica • Precisión microscópica",
  description: "Sistema de Inteligencia Financiera",
  status: "active",
  lastSync: "real-time (markets)",
  subAgents: [
    { id: "cuantificador", name: "Cuantificador", description: "Analista Numérico", model: "Claude Opus", status: "active", activeTasks: 1, lastActivity: "hace 5m" },
    { id: "fundamental", name: "Fundamental", description: "Evaluador Empresarial", model: "Claude Opus", status: "active", activeTasks: 0, lastActivity: "hace 15m" },
    { id: "estratega", name: "Estratega", description: "Optimizador de Portafolios", model: "Claude Opus", status: "busy", activeTasks: 1, lastActivity: "hace 2m" },
    { id: "newswire", name: "Newswire", description: "Analista de Noticias", model: "Claude Sonnet", status: "active", activeTasks: 0, lastActivity: "hace 10m" },
    { id: "simulador", name: "Simulador", description: "Validador de Estrategias", model: "Claude Sonnet", status: "active", activeTasks: 0, lastActivity: "hace 30m" },
  ],
  quickActions: [
    { id: "analyze", label: "Analizar activo", icon: "📊", prompt: "Pascual, analiza [ticker] con análisis técnico y fundamental" },
    { id: "portfolio", label: "Mi portafolio", icon: "💼", prompt: "Pascual, genera un reporte de mi portafolio actual" },
    { id: "opportunities", label: "Oportunidades", icon: "🎯", prompt: "Pascual, identifica oportunidades de inversión según mi perfil" },
    { id: "rebalance", label: "Rebalancear", icon: "⚖️", prompt: "Pascual, sugiere rebalanceo óptimo de mi portafolio" },
  ],
  recentMessages: [],
  metrics: {
    portfolioReturn: 12.4,
    sharpeRatio: 1.8,
    maxDrawdown: -8.2,
    alpha: 3.2,
    signalsActive: 7,
    predictionAccuracy: 68,
  },
  portfolioAllocation: [
    { asset: "Stocks", percentage: 65, color: "#00d9ff" },
    { asset: "Bonds", percentage: 20, color: "#39ff14" },
    { asset: "Crypto", percentage: 10, color: "#ff006e" },
    { asset: "Cash", percentage: 5, color: "#ffaa00" },
  ],
  topHoldings: [
    { symbol: "AAPL", percentage: 15.2, todayChange: 2.3 },
    { symbol: "MSFT", percentage: 12.8, todayChange: 1.1 },
    { symbol: "NVDA", percentage: 10.5, todayChange: 4.2 },
    { symbol: "GOOGL", percentage: 8.3, todayChange: -0.5 },
  ],
  marketSignals: [
    { id: "1", conviction: "high", symbol: "NVDA", title: "Strong momentum", target: 950, current: 875, upside: 8.5 },
    { id: "2", conviction: "medium", symbol: "AMZN", title: "Earnings catalyst", target: 195, current: 182, upside: 7.1 },
    { id: "3", conviction: "low", symbol: "XYZ", title: "Deteriorating fundamentals", target: 0, current: 45, upside: -50, action: "Reduce position 50%" },
  ],
  sectorPerformance: [
    { sector: "Technology", change: 2.1 },
    { sector: "Healthcare", change: 1.2 },
    { sector: "Finance", change: 0.8 },
    { sector: "Energy", change: 0.3 },
    { sector: "Consumer", change: -0.2 },
    { sector: "Utilities", change: -0.5 },
  ],
  news: [
    { id: "1", title: "Fed signals rate pause", impact: "positive", timestamp: "hace 2h" },
    { id: "2", title: "NVDA beats estimates", impact: "positive", timestamp: "hace 5h" },
    { id: "3", title: "Oil prices rising", impact: "neutral", timestamp: "hace 8h" },
  ],
  marketSentiment: "bullish",
  vix: 14.2,
};

// ============================================================================
// 9. OPTIMUS - Interfaces UX
// ============================================================================

export interface OptimusMetrics {
  uptime: number;
  loadTime: number;
  accessibilityScore: number;
  componentsCount: number;
  uxScore: number;
  errorRate: number;
  activeSessions: number;
}

export interface WebVital {
  name: string;
  value: string;
  status: "good" | "needs_improvement" | "poor";
}

export interface ComponentUsage {
  name: string;
  instances: number;
  isNew?: boolean;
}

export interface InnovationProposal {
  id: string;
  title: string;
  status: "approved" | "review" | "concept" | "development";
  description: string;
}

export interface AccessibilityIssue {
  id: string;
  description: string;
  severity: "high" | "medium" | "low";
}

export interface OptimusData extends AgentBase {
  metrics: OptimusMetrics;
  webVitals: WebVital[];
  componentsUsage: ComponentUsage[];
  innovationProposals: InnovationProposal[];
  accessibilityReport: {
    wcagCompliance: number;
    checks: { name: string; passed: boolean }[];
    issues: AccessibilityIssue[];
  };
  lighthouseScore: number;
}

export const optimusData: OptimusData = {
  id: "optimus",
  name: "Optimus",
  icon: "🎨",
  lema: "Información valiosa, perfectamente presentada",
  description: "Sistema de Interfaces y Experiencia de Usuario",
  status: "active",
  lastSync: "tiempo real",
  subAgents: [
    { id: "designer-o", name: "Designer", description: "Especialista UX/UI", model: "Claude Opus", status: "active", activeTasks: 1, lastActivity: "hace 5m" },
    { id: "integrator", name: "Integrator", description: "Experto en APIs", model: "Claude Sonnet", status: "active", activeTasks: 0, lastActivity: "hace 15m" },
    { id: "innovator", name: "Innovator", description: "Prototipador", model: "Claude Sonnet", status: "active", activeTasks: 0, lastActivity: "hace 30m" },
    { id: "communicator", name: "Communicator", description: "Visualizador de Datos", model: "Claude Sonnet", status: "active", activeTasks: 0, lastActivity: "hace 20m" },
    { id: "conservator", name: "Conservator", description: "Gestor de Componentes", model: "Claude Haiku", status: "active", activeTasks: 0, lastActivity: "hace 10m" },
  ],
  quickActions: [
    { id: "component", label: "Nuevo componente", icon: "🧩", prompt: "Pascual, diseña un componente para [propósito]" },
    { id: "audit", label: "UX audit", icon: "🔍", prompt: "Pascual, realiza una auditoría UX de [página/componente]" },
    { id: "performance", label: "Performance", icon: "⚡", prompt: "Pascual, analiza el rendimiento de la aplicación" },
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
  webVitals: [
    { name: "LCP", value: "1.8s", status: "good" },
    { name: "FID", value: "45ms", status: "good" },
    { name: "CLS", value: "0.08", status: "good" },
  ],
  componentsUsage: [
    { name: "Card", instances: 234 },
    { name: "Button", instances: 189 },
    { name: "Badge", instances: 156 },
    { name: "LineChart", instances: 89 },
    { name: "PascualFeedbackBar", instances: 9, isNew: true },
    { name: "AgentStatusGrid", instances: 5, isNew: true },
  ],
  innovationProposals: [
    { id: "1", title: "Dark mode toggle", status: "development", description: "Add system-wide dark mode support" },
    { id: "2", title: "Voice commands", status: "review", description: "Prototype ready for voice interaction" },
    { id: "3", title: "Gesture navigation", status: "concept", description: "Research phase for mobile gestures" },
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

// ============================================================================
// EXPORT ALL DATA
// ============================================================================

export const allAgentsData = {
  asistente: asistenteData,
  nexus: nexusData,
  sentinel: sentinelData,
  scout: scoutData,
  audiovisual: audiovisualData,
  consultor: consultorData,
  gambito: gambitoData,
  condor360: condor360Data,
  optimus: optimusData,
};

export type AgentId = keyof typeof allAgentsData;
