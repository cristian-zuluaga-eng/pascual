# Pascual Dashboard - Documentacion para Bot

## Resumen del Proyecto

Pascual Dashboard es una aplicacion Next.js que sirve como interfaz de monitoreo y control para el sistema de agentes IA "Pascual". El dashboard muestra metricas, estados y permite interactuar con 9 modulos especializados.

## Stack Tecnologico

- **Framework**: Next.js 16.1.6 (App Router)
- **React**: 19.2.3
- **Styling**: Tailwind CSS 4 + DaisyUI 5.5.19
- **Charts**: Recharts 3.7.0
- **State**: React Query 5.90.21
- **Language**: TypeScript 5

---

## Estructura de Carpetas

```
src/
├── app/                          # Rutas Next.js (App Router)
│   └── dashboard/
│       ├── agents/              # Paginas de cada modulo
│       │   ├── asistente/
│       │   ├── nexus/
│       │   ├── sentinel/
│       │   ├── scout/
│       │   ├── audiovisual/
│       │   ├── consultor/
│       │   ├── gambito/
│       │   ├── condor360/
│       │   └── picasso/
│       ├── administracion/
│       └── tasks/
├── components/                   # Componentes React
│   ├── agents/                  # AgentTemplate, AgentDashboardLayout
│   ├── charts/                  # BarChart, LineChart, HeatMap, etc.
│   ├── layout/                  # Header, Sidebar
│   └── ui/                      # Button, Card, Modal, Badge, etc.
├── hooks/                        # Custom Hooks
└── lib/
    └── api/
        ├── mock/                # Mock Data (estructura modular)
        │   ├── types/           # Tipos base compartidos
        │   ├── system/          # Datos del sistema
        │   └── modules/         # Datos por modulo
        ├── services/            # Servicios de API
        └── types/               # Tipos globales
```

---

## Sistema de Mock Data

### Ubicacion Principal
`src/lib/api/mock/`

### Estructura por Modulo

Cada modulo tiene 3 archivos:
```
modules/[moduleName]/
├── types.ts    # Interfaces TypeScript
├── data.ts     # Datos mock y funcion getter
└── index.ts    # Re-exports
```

### Importar Datos

```typescript
// Importar datos de un modulo especifico
import { sentinelData, getSentinelData, SentinelData } from "@/lib/api/mock";

// Importar todos los modulos
import { allModulesData } from "@/lib/api/mock";
```

---

## Tipos Base Compartidos

### Ubicacion
`src/lib/api/mock/types/base.ts`

### DeepPartial - Para Datos Parciales

```typescript
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends Array<infer U>
    ? Array<DeepPartial<U>>
    : T[P] extends object
    ? DeepPartial<T[P]>
    : T[P];
};
```

### mergeWithDefaults - Fusion de Datos

```typescript
function mergeWithDefaults<T extends object>(
  partial: DeepPartial<T> | undefined,
  defaults: T
): T
```

**Uso:**
```typescript
// Bot envia datos parciales
const botData: DeepPartial<SentinelData> = {
  metrics: { securityScore: 98 }
};

// Fusionar con defaults
const fullData = getSentinelData(botData);
```

### Tipos Comunes

```typescript
type ModuleStatus = "active" | "busy" | "idle" | "offline" | "error";
type Priority = "critical" | "high" | "medium" | "low";
type ConvictionLevel = "high" | "medium" | "low";
```

### Interface Base de Modulo

```typescript
interface ModuleBase {
  id: string;
  name: string;
  icon: string;           // Emoji
  lema: string;           // Tagline del modulo
  description: string;
  status: ModuleStatus;
  lastSync: string;
  quickActions: QuickAction[];
  recentMessages: PascualMessage[];
}

interface QuickAction {
  id: string;
  label: string;
  icon: string;
  prompt: string;
}

interface PascualMessage {
  id: string;
  timestamp: string;
  moduleId: string;
  query: string;
  response: string;
  confidence?: number;
  suggestedActions?: string[];
}
```

---

## Los 9 Modulos

### 1. ASISTENTE
**ID:** `asistente`
**Descripcion:** Gestor Personal Inteligente
**Archivo:** `modules/asistente/`

```typescript
interface AsistenteMetrics {
  tasksToday: number;
  tasksCompleted: number;
  tasksPending: number;
  weeklyCompletionRate: number;      // Porcentaje
  suggestionsGenerated: number;
  suggestionsAccepted: number;
  proactiveAccuracy: number;         // Porcentaje
  pantryLevel: number;               // Porcentaje
  cleaningSuppliesLevel: number;     // Porcentaje
  maintenanceStatus: "ok" | "attention" | "urgent";
  userSatisfaction: number;          // 0-5
  nextReminder: string;
}

interface AsistenteData extends ModuleBase {
  metrics: AsistenteMetrics;
  todaySchedule: ScheduleEvent[];    // Eventos del dia
  tasks: Task[];                     // Tareas pendientes
  suggestions: ProactiveSuggestion[]; // Sugerencias activas
  upcomingPurchases: string[];       // Lista de compras
}
```

---

### 2. NEXUS
**ID:** `nexus`
**Descripcion:** Director de Desarrollo de Software
**Archivo:** `modules/nexus/`

```typescript
interface NexusMetrics {
  testCoverage: number;              // Porcentaje
  codeComplexity: number;            // Score
  maintainabilityIndex: number;      // Score
  documentationCoverage: number;     // Porcentaje
  technicalDebt: "low" | "medium" | "high";
  architectureCoherence: number;     // Porcentaje
  deploysThisWeek: number;
  deploySuccessRate: number;         // Porcentaje
  prsOpen: number;
  prsMerged: number;
  bugsOpen: number;
  avgResponseTime: number;           // ms
  tokenUsageDaily: number;
}

interface NexusData extends ModuleBase {
  metrics: NexusMetrics;
  pipeline: PipelineItem[];          // Items en desarrollo
  openProjects: OpenProject[];       // Proyectos activos
  recentCommits: Commit[];
  modelPerformance: ModelPerformance[];
  scriptImprovements: ScriptImprovement[];
  codeReviews: CodeReview[];
}
```

---

### 3. SENTINEL
**ID:** `sentinel`
**Descripcion:** Guardian de Seguridad
**Archivo:** `modules/sentinel/`

```typescript
interface SentinelMetrics {
  securityScore: number;             // 0-100
  uptime: number;                    // Porcentaje
  threatsDetected: number;
  threatsBlocked: number;
  mttd: number;                      // Mean Time To Detect (min)
  mttr: number;                      // Mean Time To Resolve (min)
  complianceScore: number;           // Porcentaje
  failedLogins24h: number;
  activeApiKeys: number;
  activeSessions: number;
  diskUsage: number;                 // Porcentaje
  diskTotal: string;
  diskUsed: string;
}

interface SentinelData extends ModuleBase {
  metrics: SentinelMetrics;
  threats: ThreatEvent[];            // Amenazas detectadas
  systemResources: SystemResource[]; // CPU, RAM, Disk, Network
  accessLogs: AccessLog[];           // Logs de acceso
  vulnerabilities: VulnerabilityScan;
  backup: BackupStatus;
  improvements: ImplementedImprovement[];
  activityHeatmap: ActivityHeatmapData;
}
```

---

### 4. SCOUT
**ID:** `scout`
**Descripcion:** Maestro en Busqueda e Ingesta de Datos
**Archivo:** `modules/scout/`

```typescript
interface ScoutMetrics {
  searchesToday: number;
  searchAccuracy: number;            // Porcentaje
  sourcesActive: number;
  dataProcessed: string;             // "4.2 GB"
  alertsPending: number;
  cacheHitRate: number;              // Porcentaje
  avgSearchLatency: number;          // ms
  dailyQuotaUsed: number;            // Porcentaje
}

interface ScoutData extends ModuleBase {
  metrics: ScoutMetrics;
  recentSearches: SearchResult[];
  monitoredTrends: MonitoredTrend[];
  dataSources: DataSource[];
  resourceUsage: { cpu: number; memory: number; api: number };
}
```

---

### 5. AUDIOVISUAL
**ID:** `audiovisual`
**Descripcion:** Orquestador Multimedia Integral
**Archivo:** `modules/audiovisual/`

```typescript
interface AudiovisualMetrics {
  assetsGenerated: number;
  inQueue: number;
  avgQuality: number;                // 0-100
  storageUsed: string;
  assetReuseRate: number;            // Porcentaje
  brandCoherenceScore: number;       // 0-100
}

interface AudiovisualData extends ModuleBase {
  metrics: AudiovisualMetrics;
  productionQueue: ProductionItem[]; // Cola de produccion
  recentAssets: Asset[];             // Assets recientes
  libraryStats: AssetLibraryStats;
  brandCoherence: {
    colorPalette: boolean;
    typography: boolean;
    logoUsage: boolean;
    toneOfVoice: boolean;
  };
}
```

---

### 6. CONSULTOR
**ID:** `consultor`
**Descripcion:** Orquestador Multidisciplinario de Conocimiento
**Archivo:** `modules/consultor/`

```typescript
interface ConsultorMetrics {
  consultationsThisMonth: number;
  userSatisfaction: number;          // 0-5
  activePlans: number;
  followUpRate: number;              // Porcentaje
  recommendationSuccessRate: number; // Porcentaje
}

interface ConsultorData extends ModuleBase {
  metrics: ConsultorMetrics;
  expertiseAreas: ExpertiseArea[];   // Areas: Financiero, Crianza, etc.
  activePlans: ActivePlan[];
  recentRecommendations: ConsultorRecommendation[];
}
```

---

### 7. GAMBITO
**ID:** `gambito`
**Descripcion:** Estratega de Prediccion Deportiva
**Archivo:** `modules/gambito/`

```typescript
interface GambitoMetrics {
  roi: number;                       // Porcentaje
  winRate: number;                   // Porcentaje
  modelAccuracy: number;             // Porcentaje
  expectedValue: number;             // EV decimal
  sharpeRatio: number;
  maxDrawdown: number;               // Porcentaje negativo
  predictionsToday: number;
  highConfidenceCount: number;
}

interface GambitoData extends ModuleBase {
  metrics: GambitoMetrics;
  activePredictions: Prediction[];   // Predicciones activas
  sportConfidence: SportConfidence[]; // Confianza por deporte
  modelStats: ModelStats[];          // Stats de modelos
  bankroll: BankrollInfo;            // Info de bankroll
}
```

---

### 8. CONDOR360
**ID:** `condor360`
**Descripcion:** Sistema de Inteligencia Financiera
**Archivo:** `modules/condor360/`

```typescript
interface Condor360Metrics {
  portfolioReturn: number;           // Porcentaje
  sharpeRatio: number;
  maxDrawdown: number;               // Porcentaje negativo
  alpha: number;
  signalsActive: number;
  predictionAccuracy: number;        // Porcentaje
}

interface Condor360Data extends ModuleBase {
  metrics: Condor360Metrics;
  portfolioAllocation: PortfolioAllocation[];
  topHoldings: Condor360Holding[];
  marketSignals: MarketSignal[];
  sectorPerformance: SectorPerformance[];
  modelConfidence: ModelConfidence[];
  news: FinancialNews[];
  recommendations: AIRecommendation[];
  marketSentiment: "bullish" | "neutral" | "bearish";
  vix: number;
}
```

---

### 9. PICASSO
**ID:** `picasso`
**Descripcion:** Sistema de Interfaces y Experiencia de Usuario
**Archivo:** `modules/picasso/`

```typescript
interface OptimusMetrics {
  uptime: number;                    // Porcentaje
  loadTime: number;                  // segundos
  accessibilityScore: number;        // 0-100
  componentsCount: number;
  uxScore: number;                   // 0-100
  errorRate: number;                 // Porcentaje
  activeSessions: number;
}

interface PicassoData extends ModuleBase {
  metrics: OptimusMetrics;
  uxNeeds: UxNeed[];                 // Necesidades UX pendientes
  componentsUsage: ComponentUsage[]; // Uso de componentes
  implementationLogs: ImplementationLog[];
  accessibilityReport: {
    wcagCompliance: number;
    checks: { name: string; passed: boolean }[];
    issues: AccessibilityIssue[];
  };
  lighthouseScore: number;
}
```

---

## Como Actualizar Datos

### Metodo 1: Funcion Getter con DeepPartial

```typescript
import { getSentinelData, DeepPartial, SentinelData } from "@/lib/api/mock";

// Bot provee datos parciales
const botUpdate: DeepPartial<SentinelData> = {
  metrics: {
    securityScore: 98,
    threatsDetected: 15
  },
  threats: [
    {
      id: "new-threat",
      severity: "warning",
      title: "New threat detected",
      description: "...",
      timestamp: "ahora",
      status: "investigating"
    }
  ]
};

// Obtener datos completos fusionados con defaults
const fullData = getSentinelData(botUpdate);
```

### Metodo 2: Acceso Directo a Defaults

```typescript
import { sentinelData } from "@/lib/api/mock";

// Acceso read-only a datos default
console.log(sentinelData.metrics.securityScore);
```

---

## Archivos del Sistema

### Header - Recursos del Sistema
**Ubicacion:** `src/lib/api/mock/system/header.ts`

```typescript
interface SystemResources {
  ram: { used: number; total: number };
  vram: { used: number; total: number };
}

const mockSystemResources: SystemResources = {
  ram: { used: 12.4, total: 32 },
  vram: { used: 8.2, total: 24 }
};
```

### Dashboard Stats
**Ubicacion:** `src/lib/api/mock/system/dashboard.ts`

Contiene stats generales, actividades y mensajes del dashboard principal.

### Agentes del Sistema
**Ubicacion:** `src/lib/api/mock/system/agents.ts`

Lista de modelos disponibles y capacidades de agentes.

---

## Patrones de Nomenclatura

- **Modulo**: Secciones del dashboard (Asistente, Sentinel, Scout, etc.)
- **Agente**: Los 4 agentes IA reales del sistema
- **ModuleId**: `"asistente" | "nexus" | "sentinel" | ...`
- **Status**: `"active" | "busy" | "idle" | "offline" | "error"`
- **Priority**: `"critical" | "high" | "medium" | "low"`
- **ConvictionLevel**: `"high" | "medium" | "low"`

---

## Los 4 Agentes Reales del Sistema

Los agentes son los workers IA que ejecutan las tareas. No confundir con los modulos del dashboard.

| Agente | Descripcion | Responsabilidades |
|--------|-------------|-------------------|
| **Pascual** | Orquestador principal | Finanzas, administracion, coordinacion central del ecosistema |
| **Hunter** | Especialista en datos | Busqueda de informacion y extraccion de datos |
| **Warden** | Guardian de seguridad | Seguridad, accesos y actualizacion del dashboard |
| **Nexus** | Operador avanzado | Operaciones complejas de programacion y analisis financiero orientado a prediccion |

**Ubicacion de configuracion:** `src/lib/api/mock/system/agents.ts`

---

## Colores del Tema (Neo-punk)

```typescript
// Acentos principales
cyan: "#00d9ff"    // Info, links, primary
pink: "#ff006e"    // Danger, alerts, critical
green: "#39ff14"   // Success, active
yellow: "#ffaa00"  // Warning

// Backgrounds
"bg-primary": "#0a0a0a"
"bg-secondary": "#171717"
"bg-tertiary": "#262626"
```

---

## Comandos de Desarrollo

```bash
# Desarrollo
npm run dev

# Build produccion
npm run build

# Lint
npm run lint

# Type check
npx tsc --noEmit
```

---

## Estructura de Exports

### Export Central
```typescript
// Desde src/lib/api/mock/index.ts
export * from "./types";      // DeepPartial, mergeWithDefaults, tipos base
export * from "./system";     // Header, dashboard, agents
export * from "./modules";    // Todos los modulos
```

### Acceso por Modulo
```typescript
// Cada modulo exporta:
export * from "./types";      // Interfaces del modulo
export * from "./data";       // Data + getter function
// Re-export en index.ts

// Ejemplo de uso:
import {
  SentinelData,           // Tipo
  SentinelMetrics,        // Tipo de metricas
  sentinelData,           // Datos default
  getSentinelData         // Funcion getter
} from "@/lib/api/mock/modules/sentinel";
```

---

## Validacion de Datos

El sistema usa `DeepPartial` para permitir actualizaciones parciales:

1. Bot envia solo los campos que cambiaron
2. `mergeWithDefaults()` fusiona con valores default
3. Resultado: objeto completo con datos actualizados

**Beneficios:**
- No es necesario enviar todos los campos
- Validacion automatica de tipos
- Valores default para campos faltantes
- Type-safe en TypeScript
