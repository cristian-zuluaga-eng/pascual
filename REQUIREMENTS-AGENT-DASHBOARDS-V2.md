# PASCUAL Dashboard V2 - Requerimientos de Dashboards por Agente

## Versión: 2.0.0
## Fecha: 2025-03-06

---

## 1. Visión General

### 1.1 Objetivo

Crear dashboards especializados e independientes para cada uno de los 9 agentes del ecosistema PASCUAL, diseñados para:

- **Visualizar métricas específicas** según la experticia de cada agente
- **Facilitar la toma de decisiones** presentando información accionable
- **Permitir retroalimentación directa** con Pascual desde cada dashboard
- **Optimizar la UX** con interfaces adaptadas a cada dominio de conocimiento

### 1.2 Principio de Diseño

> "Cada experto debe tener su mesa de trabajo optimizada para su especialidad, pero todos reportan al mismo centro de comando."

### 1.3 Arquitectura de Navegación

```
PASCUAL DASHBOARD
│
├── Mando de Control (existente)
│   ├── Overview
│   ├── Task Queue
│   ├── Exec Logs
│   ├── Agent Details
│   └── Orchestration
│
└── Agentes Especializados (NUEVO)
    ├── 👤 Asistente     → Gestión Personal
    ├── 🔧 Nexus         → Desarrollo Software
    ├── 🛡️ Sentinel      → Seguridad
    ├── 🔍 Scout         → Búsqueda de Datos
    ├── 🎬 Audiovisual   → Multimedia
    ├── 📚 Consultor     → Conocimiento Experto
    ├── 🎯 Gambito       → Predicción Deportiva
    ├── 📈 Cóndor360     → Inteligencia Financiera
    └── 🎨 Optimus       → Interfaces UX
```

---

## 2. Patrones de UX Comunes

### 2.1 Estructura Base de Dashboard de Agente

Todos los dashboards de agente seguirán una estructura consistente:

```
┌─────────────────────────────────────────────────────────────────────────┐
│ HEADER: Nombre Agente + Status + Lema                    [⟳] [⚙] [💬] │
├─────────────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ PASCUAL FEEDBACK BAR - Canal de comunicación bidireccional         │ │
│ │ [Input: Solicitar a Pascual...]        [Enviar] [Historial ▼]      │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────┤
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐        │
│ │ KPI 1       │ │ KPI 2       │ │ KPI 3       │ │ KPI 4       │        │
│ │  Principal  │ │  Principal  │ │  Principal  │ │  Principal  │        │
│ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘        │
├─────────────────────────────────────────────────────────────────────────┤
│ ┌────────────────────────────────┐ ┌──────────────────────────────────┐│
│ │                                │ │                                  ││
│ │   ÁREA PRINCIPAL               │ │   PANEL SECUNDARIO               ││
│ │   (Específica del agente)      │ │   (Contexto/Acciones)            ││
│ │                                │ │                                  ││
│ └────────────────────────────────┘ └──────────────────────────────────┘│
├─────────────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ SUB-AGENTS STATUS BAR                                               │ │
│ │ [Sub1 ●] [Sub2 ●] [Sub3 ○] [Sub4 ●] [Sub5 ●]                       │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Componente: Pascual Feedback Bar

**Propósito:** Canal de comunicación bidireccional entre el usuario y Pascual, contextualizado al agente actual.

```typescript
interface PascualFeedbackBar {
  agentId: string;
  agentName: string;

  // Input
  placeholder: string;           // Contextual: "Solicitar análisis a Gambito..."
  quickActions: QuickAction[];   // Acciones frecuentes del agente

  // Output
  lastResponse?: PascualResponse;
  responseHistory: PascualResponse[];

  // Estado
  isProcessing: boolean;
  connectionStatus: "connected" | "processing" | "error";
}

interface QuickAction {
  id: string;
  label: string;
  icon: string;
  prompt: string;               // Prompt predefinido a enviar
}

interface PascualResponse {
  id: string;
  timestamp: string;
  agentId: string;
  query: string;
  response: string;
  confidence?: number;
  suggestedActions?: string[];
}
```

### 2.3 Componente: Sub-Agents Status Bar

```typescript
interface SubAgentStatusBar {
  agentId: string;
  subAgents: SubAgentStatus[];
  onSubAgentClick: (subAgentId: string) => void;
}

interface SubAgentStatus {
  id: string;
  name: string;
  status: "active" | "busy" | "idle" | "error";
  activeTasks: number;
  lastActivity: string;
}
```

### 2.4 Acciones Comunes por Dashboard

| Acción | Icono | Descripción |
|--------|-------|-------------|
| Refresh | ⟳ | Actualizar datos del dashboard |
| Settings | ⚙ | Configuración específica del agente |
| Chat | 💬 | Abrir chat directo con Pascual |
| Export | ↓ | Exportar datos/reportes |
| Expand | ⤢ | Modo pantalla completa |

---

## 3. Dashboard: ASISTENTE (👤)

### 3.1 Información del Agente

| Atributo | Valor |
|----------|-------|
| **Nombre** | Asistente |
| **Lema** | "Organización proactiva, vida simplificada" |
| **Rol** | Gestor Personal Inteligente |
| **Sub-agentes** | Chronos, Proactive, Domus |
| **Actualización** | Tiempo real |

### 3.2 Layout del Dashboard

```
┌─────────────────────────────────────────────────────────────────────────┐
│ 👤 ASISTENTE - Gestor Personal          ● Active    [⟳] [⚙] [💬]      │
│    "Organización proactiva, vida simplificada"                          │
├─────────────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ 💬 Pascual: "¿Qué necesitas organizar hoy?"                         │ │
│ │ [Planificar mi día] [Recordatorio] [Lista de compras] [___________] │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────┤
│ ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐  │
│ │ Tareas    │ │ Completado│ │ Precisión │ │ Próximo   │ │ Satisfac. │  │
│ │ Hoy       │ │ Esta Sem  │ │ Proactiva │ │ Recordat. │ │ Usuario   │  │
│ │    12     │ │   85%     │ │   82%     │ │  15 min   │ │   4.5/5   │  │
│ └───────────┘ └───────────┘ └───────────┘ └───────────┘ └───────────┘  │
├─────────────────────────────────────────────────────────────────────────┤
│ ┌──────────────────────────────────┐ ┌────────────────────────────────┐ │
│ │ AGENDA DEL DÍA                   │ │ SUGERENCIAS PROACTIVAS         │ │
│ │ ┌────────────────────────────┐   │ │                                │ │
│ │ │ 09:00 ○ Reunión equipo     │   │ │ 💡 Basado en tu rutina:        │ │
│ │ │ 10:30 ● Call con cliente   │   │ │                                │ │
│ │ │ 12:00 ○ Almuerzo           │   │ │ • Revisar emails pendientes    │ │
│ │ │ 14:00 ○ Revisión proyecto  │   │ │ • Preparar informe semanal     │ │
│ │ │ 16:00 ○ Ejercicio          │   │ │ • Comprar leche (se agotó)     │ │
│ │ │ 18:00 ○ Tiempo familia     │   │ │                                │ │
│ │ └────────────────────────────┘   │ │ [Aceptar todas] [Personalizar] │ │
│ │                                  │ │                                │ │
│ │ [+ Agregar evento]               │ └────────────────────────────────┘ │
│ ├──────────────────────────────────┤ ┌────────────────────────────────┐ │
│ │ LISTA DE TAREAS                  │ │ GESTIÓN DOMÉSTICA              │ │
│ │                                  │ │                                │ │
│ │ ☑ Enviar propuesta       ✓ Listo│ │ 🏠 Inventario Hogar            │ │
│ │ ☐ Llamar al médico       Pend.  │ │ ├─ Despensa: 78% ████████░░   │ │
│ │ ☐ Revisar presupuesto    Pend.  │ │ ├─ Limpieza: 45% █████░░░░░   │ │
│ │ ☐ Comprar regalo         Pend.  │ │ └─ Mantenim: OK ✓              │ │
│ │                                  │ │                                │ │
│ │ [+ Nueva tarea]                  │ │ Próx. restock: Leche, Pan     │ │
│ └──────────────────────────────────┘ └────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────┤
│ [Chronos ●] [Proactive ●] [Domus ●]              Última sync: hace 2s  │
└─────────────────────────────────────────────────────────────────────────┘
```

### 3.3 KPIs Principales

| KPI | Descripción | Fuente |
|-----|-------------|--------|
| Tareas Hoy | Tareas programadas para hoy | Chronos |
| Completado Semana | % de tareas completadas esta semana | Chronos |
| Precisión Proactiva | % de sugerencias aceptadas | Proactive |
| Próximo Recordatorio | Tiempo hasta siguiente alerta | Chronos |
| Satisfacción Usuario | Rating de utilidad percibida | Feedback |

### 3.4 Quick Actions para Pascual

```typescript
const asistenteQuickActions: QuickAction[] = [
  { id: "plan-day", label: "Planificar mi día", icon: "📅", prompt: "Pascual, ayúdame a organizar mi día de hoy" },
  { id: "reminder", label: "Crear recordatorio", icon: "⏰", prompt: "Pascual, necesito un recordatorio para..." },
  { id: "shopping", label: "Lista de compras", icon: "🛒", prompt: "Pascual, genera una lista de compras basada en mi inventario" },
  { id: "routine", label: "Optimizar rutina", icon: "🔄", prompt: "Pascual, analiza mi rutina y sugiere mejoras" },
];
```

### 3.5 Métricas Específicas

```typescript
interface AsistenteMetrics {
  // Chronos
  tasksToday: number;
  tasksCompleted: number;
  tasksPending: number;
  weeklyCompletionRate: number;
  averageTaskDuration: number;

  // Proactive
  suggestionsGenerated: number;
  suggestionsAccepted: number;
  proactiveAccuracy: number;
  anticipatedNeeds: string[];

  // Domus
  pantryLevel: number;
  cleaningSuppliesLevel: number;
  maintenanceStatus: "ok" | "attention" | "urgent";
  upcomingPurchases: string[];

  // General
  userSatisfaction: number;
  personalizationScore: number;
}
```

---

## 4. Dashboard: NEXUS (🔧)

### 4.1 Información del Agente

| Atributo | Valor |
|----------|-------|
| **Nombre** | Nexus |
| **Lema** | "Excelencia técnica, evolución constante" |
| **Rol** | Director de Desarrollo de Software |
| **Sub-agentes** | Explorer, Proposer, Spec Writer, Designer, Task Planner, Implementador, Verificador QA, Auditor |
| **Actualización** | Cada 5 minutos |

### 4.2 Layout del Dashboard

```
┌─────────────────────────────────────────────────────────────────────────┐
│ 🔧 NEXUS - Director de Desarrollo       ● Active    [⟳] [⚙] [💬]      │
│    "Excelencia técnica, evolución constante"                            │
├─────────────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ 💬 Pascual: "¿Qué necesitas desarrollar?"                           │ │
│ │ [Analizar código] [Nueva feature] [Code review] [Deploy] [________] │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────┤
│ ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐  │
│ │ Cobertura │ │ Deuda     │ │ Deploys   │ │ PRs       │ │ Bugs      │  │
│ │ Tests     │ │ Técnica   │ │ Semana    │ │ Abiertos  │ │ Abiertos  │  │
│ │   87%     │ │   LOW     │ │    12     │ │    5      │ │    3      │  │
│ │   ▲ 2%    │ │   ✓       │ │   ▲ 20%   │ │           │ │   ▼ 40%   │  │
│ └───────────┘ └───────────┘ └───────────┘ └───────────┘ └───────────┘  │
├─────────────────────────────────────────────────────────────────────────┤
│ ┌──────────────────────────────────┐ ┌────────────────────────────────┐ │
│ │ PIPELINE DE DESARROLLO           │ │ CODE QUALITY                   │ │
│ │                                  │ │                                │ │
│ │ ANALYSIS    DESIGN    IMPLEMENT  │ │ Complexity    ████████░░  78  │ │
│ │ ┌──────┐   ┌──────┐   ┌──────┐  │ │ Maintainab.   █████████░  92  │ │
│ │ │ PR-1 │──▶│ PR-3 │──▶│ PR-5 │  │ │ Documentation ███████░░░  68  │ │
│ │ │ PR-2 │   │ PR-4 │   │ PR-6 │  │ │ Test Coverage ████████░░  87  │ │
│ │ └──────┘   └──────┘   └──────┘  │ │                                │ │
│ │                                  │ │ ARCHITECTURE COHERENCE         │ │
│ │ TESTING     REVIEW    DEPLOY     │ │ ████████████████████░░░  85%  │ │
│ │ ┌──────┐   ┌──────┐   ┌──────┐  │ │                                │ │
│ │ │ PR-7 │──▶│ PR-8 │──▶│ v2.4 │  │ │ Technical Debt Trajectory      │ │
│ │ └──────┘   └──────┘   └──────┘  │ │ ──────────────────────────     │ │
│ │                                  │ │ [Chart: Debt over time]        │ │
│ └──────────────────────────────────┘ └────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────┤
│ ┌──────────────────────────────────┐ ┌────────────────────────────────┐ │
│ │ RECENT COMMITS                   │ │ MODEL PERFORMANCE              │ │
│ │                                  │ │                                │ │
│ │ a3f2b1 feat: Add auth module     │ │ Claude Opus    ████████░░ 89% │ │
│ │ b4c3d2 fix: Login redirect       │ │ Claude Sonnet  █████████░ 94% │ │
│ │ c5d4e3 refactor: API layer       │ │ Claude Haiku   ██████░░░░ 67% │ │
│ │ d6e5f4 test: Unit tests auth     │ │                                │ │
│ │                                  │ │ Avg Response: 2.3s             │ │
│ │ [View all commits]               │ │ Token Usage: 45K/day           │ │
│ └──────────────────────────────────┘ └────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────┤
│ [Explorer ●] [Proposer ●] [Spec ●] [Designer ●] [Planner ○]            │
│ [Implementador ●] [QA ●] [Auditor ○]                 Sync: hace 5m     │
└─────────────────────────────────────────────────────────────────────────┘
```

### 4.3 KPIs Principales

| KPI | Descripción | Target | Crítico |
|-----|-------------|--------|---------|
| Test Coverage | % de código cubierto por tests | >80% | <60% |
| Technical Debt | Nivel de deuda técnica | Low | High |
| Deploy Frequency | Deploys por semana | >10 | <3 |
| PRs Open | Pull requests pendientes | <10 | >20 |
| Bug Escape Rate | Bugs que llegan a producción | <5% | >15% |

### 4.4 Quick Actions para Pascual

```typescript
const nexusQuickActions: QuickAction[] = [
  { id: "analyze", label: "Analizar código", icon: "🔍", prompt: "Pascual, analiza el código de [componente] y sugiere mejoras" },
  { id: "feature", label: "Nueva feature", icon: "✨", prompt: "Pascual, planifica la implementación de [feature]" },
  { id: "review", label: "Code review", icon: "👁", prompt: "Pascual, realiza code review del PR [número]" },
  { id: "deploy", label: "Deploy", icon: "🚀", prompt: "Pascual, prepara el deploy de [versión]" },
  { id: "debt", label: "Reducir deuda", icon: "🧹", prompt: "Pascual, identifica oportunidades para reducir deuda técnica" },
];
```

### 4.5 Métricas Específicas

```typescript
interface NexusMetrics {
  // Code Quality
  testCoverage: number;
  codeComplexity: number;
  maintainabilityIndex: number;
  documentationCoverage: number;

  // Development Velocity
  commitsPerDay: number;
  prsOpenedPerWeek: number;
  prsMergedPerWeek: number;
  averagePRCycleTime: number;  // hours

  // Technical Health
  technicalDebt: "low" | "medium" | "high";
  architectureCoherence: number;
  dependencyHealth: number;
  securityVulnerabilities: number;

  // AI Model Usage
  modelPerformance: Record<string, number>;
  tokenUsageDaily: number;
  averageResponseTime: number;

  // Pipeline
  deploysThisWeek: number;
  deploySuccessRate: number;
  rollbackCount: number;
}
```

---

## 5. Dashboard: SENTINEL (🛡️)

### 5.1 Información del Agente

| Atributo | Valor |
|----------|-------|
| **Nombre** | Sentinel |
| **Lema** | "Vigilancia infalible, protección inquebrantable" |
| **Rol** | Guardián de Seguridad y Estabilidad |
| **Sub-agentes** | Cipher, Monitor, Guardian, Warden, Custodian |
| **Actualización** | Tiempo real (crítico) |

### 5.2 Layout del Dashboard

```
┌─────────────────────────────────────────────────────────────────────────┐
│ 🛡️ SENTINEL - Guardián de Seguridad    ● Active    [⟳] [⚙] [💬]       │
│    "Vigilancia infalible, protección inquebrantable"                    │
├─────────────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ 💬 Pascual: "Sistema seguro. ¿Qué deseas verificar?"                │ │
│ │ [Escaneo completo] [Auditar accesos] [Ver amenazas] [Backup] [____] │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────┤
│ ┌───────────────────────────────────────────────────────────────────┐   │
│ │ SECURITY STATUS: ████████████████████████████░░░░ SECURE (94/100) │   │
│ └───────────────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────────────┤
│ ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐  │
│ │ Uptime    │ │ Amenazas  │ │ MTTD      │ │ MTTR      │ │ Compliance│  │
│ │           │ │ Bloqueadas│ │           │ │           │ │           │  │
│ │  99.9%    │ │    12     │ │   3.2s    │ │   45s     │ │   100%    │  │
│ │  ✓ OK     │ │  hoy      │ │   ✓       │ │   ✓       │ │   ✓       │  │
│ └───────────┘ └───────────┘ └───────────┘ └───────────┘ └───────────┘  │
├─────────────────────────────────────────────────────────────────────────┤
│ ┌──────────────────────────────────┐ ┌────────────────────────────────┐ │
│ │ THREAT MONITOR                   │ │ SYSTEM HEALTH                  │ │
│ │                                  │ │                                │ │
│ │ 🔴 Critical: 0                   │ │ CPU     ████████░░  78%        │ │
│ │ 🟠 Warning:  2                   │ │ Memory  ██████░░░░  62%        │ │
│ │ 🟢 Info:     5                   │ │ Disk    ███████░░░  71%        │ │
│ │                                  │ │ Network ████░░░░░░  45%        │ │
│ │ Recent Events:                   │ │                                │ │
│ │ ⚠ Unusual login pattern  2m ago │ │ BACKUP STATUS                  │ │
│ │ ● Firewall rule updated  15m ago│ │ Last: 2h ago ✓                 │ │
│ │ ⚠ Rate limit triggered   32m ago│ │ Next: 4h                       │ │
│ │                                  │ │ Recovery Test: PASSED          │ │
│ │ [View all events]                │ └────────────────────────────────┘ │
│ └──────────────────────────────────┘                                    │
├─────────────────────────────────────────────────────────────────────────┤
│ ┌──────────────────────────────────┐ ┌────────────────────────────────┐ │
│ │ ACCESS CONTROL                   │ │ VULNERABILITY SCAN             │ │
│ │                                  │ │                                │ │
│ │ Active Sessions: 3               │ │ Last Scan: 1h ago              │ │
│ │ Failed Logins (24h): 7           │ │ Critical: 0                    │ │
│ │ API Keys Active: 12              │ │ High: 1 (patched)              │ │
│ │                                  │ │ Medium: 3                      │ │
│ │ Recent Access:                   │ │ Low: 8                         │ │
│ │ ✓ admin@pascual  10m ago        │ │                                │ │
│ │ ✓ api-nexus      25m ago        │ │ [Run New Scan]                 │ │
│ │ ✗ unknown        45m ago        │ │                                │ │
│ └──────────────────────────────────┘ └────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────┤
│ [Cipher ●] [Monitor ●] [Guardian ●] [Warden ●] [Custodian ●]           │
│                                                      Sync: tiempo real  │
└─────────────────────────────────────────────────────────────────────────┘
```

### 5.3 KPIs Principales

| KPI | Descripción | Target | Crítico |
|-----|-------------|--------|---------|
| Security Score | Índice de seguridad general | >90 | <70 |
| Uptime | Disponibilidad del sistema | >99.9% | <99% |
| MTTD | Mean Time To Detect | <5s | >30s |
| MTTR | Mean Time To Resolve | <60s | >300s |
| Compliance | Cumplimiento de políticas | 100% | <95% |

### 5.4 Quick Actions para Pascual

```typescript
const sentinelQuickActions: QuickAction[] = [
  { id: "scan", label: "Escaneo completo", icon: "🔍", prompt: "Pascual, ejecuta un escaneo de seguridad completo" },
  { id: "audit", label: "Auditar accesos", icon: "📋", prompt: "Pascual, genera un reporte de auditoría de accesos" },
  { id: "threats", label: "Ver amenazas", icon: "⚠️", prompt: "Pascual, muéstrame las amenazas detectadas hoy" },
  { id: "backup", label: "Backup ahora", icon: "💾", prompt: "Pascual, ejecuta un backup inmediato del sistema" },
  { id: "lockdown", label: "Modo seguro", icon: "🔒", prompt: "Pascual, activa el modo de seguridad reforzada" },
];
```

---

## 6. Dashboard: SCOUT (🔍)

### 6.1 Información del Agente

| Atributo | Valor |
|----------|-------|
| **Nombre** | Scout |
| **Lema** | "Toda la información, donde la necesites, cuando la necesites" |
| **Rol** | Maestro en Búsqueda e Ingesta de Datos |
| **Sub-agentes** | Hunter, Harvester, Curator, Synthesizer, Satelite |
| **Actualización** | Continua |

### 6.2 Layout del Dashboard

```
┌─────────────────────────────────────────────────────────────────────────┐
│ 🔍 SCOUT - Búsqueda de Datos            ● Active    [⟳] [⚙] [💬]      │
│    "Toda la información, donde la necesites, cuando la necesites"       │
├─────────────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ 💬 Pascual: "¿Qué información necesitas encontrar?"                 │ │
│ │ [Buscar datos] [Monitorear tema] [Extraer de URL] [Sintetizar] [__] │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────┤
│ ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐  │
│ │ Búsquedas │ │ Precisión │ │ Fuentes   │ │ Datos     │ │ Alertas   │  │
│ │ Hoy       │ │ Resultados│ │ Activas   │ │ Procesados│ │ Pendientes│  │
│ │   245     │ │   96%     │ │    34     │ │  4.2 GB   │ │    3      │  │
│ └───────────┘ └───────────┘ └───────────┘ └───────────┘ └───────────┘  │
├─────────────────────────────────────────────────────────────────────────┤
│ ┌──────────────────────────────────┐ ┌────────────────────────────────┐ │
│ │ BÚSQUEDAS RECIENTES              │ │ TENDENCIAS MONITOREADAS        │ │
│ │                                  │ │                                │ │
│ │ 🔍 "AI market trends 2025"       │ │ 📈 Bitcoin price         +2.3%│ │
│ │    156 results • 2m ago • ✓     │ │ 📰 Tech news             12 new│ │
│ │                                  │ │ 🏈 LaLiga standings      Upd. │ │
│ │ 🔍 "React 19 features"           │ │ 📊 S&P 500               -0.5%│ │
│ │    89 results • 15m ago • ✓     │ │ 🌐 Competitor activity   3 new│ │
│ │                                  │ │                                │ │
│ │ 🔍 "Colombian economy 2025"      │ │ [+ Agregar monitoreo]          │ │
│ │    234 results • 1h ago • ✓     │ │                                │ │
│ │                                  │ └────────────────────────────────┘ │
│ │ [Ver historial completo]         │                                    │
│ └──────────────────────────────────┘                                    │
├─────────────────────────────────────────────────────────────────────────┤
│ ┌──────────────────────────────────┐ ┌────────────────────────────────┐ │
│ │ FUENTES DE DATOS                 │ │ RESOURCE USAGE                 │ │
│ │                                  │ │                                │ │
│ │ ● NewsAPI         Active  98%   │ │ CPU    ████░░░░░░  28%         │ │
│ │ ● Twitter/X       Active  95%   │ │ Memory ██████░░░░  45%         │ │
│ │ ● Financial APIs  Active  99%   │ │ API    ███████░░░  62%         │ │
│ │ ○ Reddit          Rate Ltd 45%  │ │                                │ │
│ │ ● Google Scholar  Active  92%   │ │ Daily Quota: 62% used          │ │
│ │                                  │ │ Cache Hit Rate: 78%            │ │
│ │ Total: 34 sources                │ │                                │ │
│ └──────────────────────────────────┘ └────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────┤
│ [Hunter ●] [Harvester ●] [Curator ●] [Synthesizer ●] [Satelite ●]      │
│                                                      Sync: continua     │
└─────────────────────────────────────────────────────────────────────────┘
```

### 6.3 Quick Actions para Pascual

```typescript
const scoutQuickActions: QuickAction[] = [
  { id: "search", label: "Buscar datos", icon: "🔍", prompt: "Pascual, busca información sobre [tema]" },
  { id: "monitor", label: "Monitorear tema", icon: "📡", prompt: "Pascual, monitorea actualizaciones sobre [tema]" },
  { id: "extract", label: "Extraer de URL", icon: "📥", prompt: "Pascual, extrae datos de [URL]" },
  { id: "synthesize", label: "Sintetizar", icon: "📊", prompt: "Pascual, sintetiza la información recopilada sobre [tema]" },
];
```

---

## 7. Dashboard: AUDIOVISUAL (🎬)

### 7.1 Información del Agente

| Atributo | Valor |
|----------|-------|
| **Nombre** | Audiovisual |
| **Lema** | "La forma perfecta para cada mensaje" |
| **Rol** | Orquestador Multimedia Integral |
| **Sub-agentes** | Imagen, Video, Audio, Texto, Bibliotecario |
| **Actualización** | Por demanda |

### 7.2 Layout del Dashboard

```
┌─────────────────────────────────────────────────────────────────────────┐
│ 🎬 AUDIOVISUAL - Multimedia             ● Active    [⟳] [⚙] [💬]      │
│    "La forma perfecta para cada mensaje"                                │
├─────────────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ 💬 Pascual: "¿Qué contenido necesitas crear?"                       │ │
│ │ [Crear imagen] [Generar video] [Audio/Voz] [Texto] [Biblioteca] [_] │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────┤
│ ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐  │
│ │ Assets    │ │ En Cola   │ │ Calidad   │ │ Storage   │ │ Reuso     │  │
│ │ Generados │ │ Render    │ │ Promedio  │ │ Usado     │ │ Assets    │  │
│ │   156     │ │    3      │ │   87%     │ │  2.3 GB   │ │   34%     │  │
│ └───────────┘ └───────────┘ └───────────┘ └───────────┘ └───────────┘  │
├─────────────────────────────────────────────────────────────────────────┤
│ ┌──────────────────────────────────┐ ┌────────────────────────────────┐ │
│ │ PRODUCTION QUEUE                 │ │ RECENT ASSETS                  │ │
│ │                                  │ │                                │ │
│ │ 🎨 Banner promocional            │ │ ┌────┐ ┌────┐ ┌────┐ ┌────┐   │ │
│ │    Processing... 67%             │ │ │ 🖼️ │ │ 🖼️ │ │ 🎵 │ │ 📄 │   │ │
│ │    Est: 2 min                    │ │ └────┘ └────┘ └────┘ └────┘   │ │
│ │                                  │ │ Logo   Banner Audio  Copy     │ │
│ │ 🎵 Narración explicativa         │ │                                │ │
│ │    Queued • Priority: High       │ │ ┌────┐ ┌────┐ ┌────┐ ┌────┐   │ │
│ │                                  │ │ │ 🎬 │ │ 🖼️ │ │ 🎵 │ │ 📄 │   │ │
│ │ 🎬 Video tutorial                │ │ └────┘ └────┘ └────┘ └────┘   │ │
│ │    Queued • Priority: Medium     │ │ Promo  Icon   Jingle Script   │ │
│ │                                  │ │                                │ │
│ │ [+ Nueva solicitud]              │ │ [Ver biblioteca completa]      │ │
│ └──────────────────────────────────┘ └────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────┤
│ ┌──────────────────────────────────┐ ┌────────────────────────────────┐ │
│ │ ASSET LIBRARY STATS              │ │ BRAND COHERENCE                │ │
│ │                                  │ │                                │ │
│ │ 🖼️ Images:    89  (1.2 GB)       │ │ Color Palette    ✓ Consistent │ │
│ │ 🎬 Videos:    23  (800 MB)       │ │ Typography       ✓ Consistent │ │
│ │ 🎵 Audio:     34  (200 MB)       │ │ Logo Usage       ✓ Correct    │ │
│ │ 📄 Text:      67  (50 MB)        │ │ Tone of Voice    ✓ Aligned    │ │
│ │                                  │ │                                │ │
│ │ Most Used: logo-main.svg (45x)   │ │ Coherence Score: 94/100       │ │
│ └──────────────────────────────────┘ └────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────┤
│ [Imagen ●] [Video ○] [Audio ●] [Texto ●] [Bibliotecario ●]             │
│                                                      Sync: por demanda  │
└─────────────────────────────────────────────────────────────────────────┘
```

### 7.3 Quick Actions para Pascual

```typescript
const audiovisualQuickActions: QuickAction[] = [
  { id: "image", label: "Crear imagen", icon: "🖼️", prompt: "Pascual, genera una imagen de [descripción]" },
  { id: "video", label: "Generar video", icon: "🎬", prompt: "Pascual, crea un video explicativo sobre [tema]" },
  { id: "audio", label: "Audio/Voz", icon: "🎵", prompt: "Pascual, genera audio narrado de [texto]" },
  { id: "text", label: "Texto creativo", icon: "📝", prompt: "Pascual, escribe [tipo de contenido] sobre [tema]" },
  { id: "library", label: "Buscar en biblioteca", icon: "📚", prompt: "Pascual, encuentra assets relacionados con [tema]" },
];
```

---

## 8. Dashboard: CONSULTOR (📚)

### 8.1 Información del Agente

| Atributo | Valor |
|----------|-------|
| **Nombre** | Consultor |
| **Lema** | "Conocimiento especializado, visión integral" |
| **Rol** | Orquestador Multidisciplinario de Conocimiento |
| **Sub-agentes** | Financiero, Crianza, Emprendimiento, Carrera, Bienestar |
| **Actualización** | Por consulta |

### 8.2 Layout del Dashboard

```
┌─────────────────────────────────────────────────────────────────────────┐
│ 📚 CONSULTOR - Conocimiento Experto     ● Active    [⟳] [⚙] [💬]      │
│    "Conocimiento especializado, visión integral"                        │
├─────────────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ 💬 Pascual: "¿En qué área necesitas asesoría?"                      │ │
│ │ [Finanzas] [Crianza] [Emprendimiento] [Carrera] [Bienestar] [_____] │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────┤
│ ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐  │
│ │ Consultas │ │ Satisfacc.│ │ Planes    │ │ Seguim.   │ │ Éxito     │  │
│ │ Este Mes  │ │ Usuario   │ │ Activos   │ │ Activo    │ │ Recomend. │  │
│ │    89     │ │  4.7/5    │ │    5      │ │   68%     │ │   82%     │  │
│ └───────────┘ └───────────┘ └───────────┘ └───────────┘ └───────────┘  │
├─────────────────────────────────────────────────────────────────────────┤
│ ┌──────────────────────────────────┐ ┌────────────────────────────────┐ │
│ │ ÁREAS DE EXPERTISE               │ │ PLANES EN SEGUIMIENTO          │ │
│ │                                  │ │                                │ │
│ │ 💰 FINANCIERO                    │ │ 📋 Plan Ahorro Emergencia      │ │
│ │    Consultas: 34 | Rating: 4.8  │ │    Progreso: ████████░░ 78%   │ │
│ │    Última: "Optimizar ahorro"    │ │    Próximo: Revisar presupuesto│ │
│ │                                  │ │                                │ │
│ │ 👶 CRIANZA                       │ │ 📋 Desarrollo Profesional      │ │
│ │    Consultas: 12 | Rating: 4.9  │ │    Progreso: █████░░░░░ 45%   │ │
│ │    Última: "Rutinas de sueño"    │ │    Próximo: Actualizar CV      │ │
│ │                                  │ │                                │ │
│ │ 🚀 EMPRENDIMIENTO                │ │ 📋 Bienestar Integral          │ │
│ │    Consultas: 23 | Rating: 4.6  │ │    Progreso: ██████████ 92%   │ │
│ │    Última: "Pitch deck"          │ │    Próximo: Checkup médico     │ │
│ │                                  │ │                                │ │
│ │ 💼 CARRERA                       │ │ [Ver todos los planes]         │ │
│ │    Consultas: 15 | Rating: 4.7  │ │                                │ │
│ │                                  │ └────────────────────────────────┘ │
│ │ 🧘 BIENESTAR                     │                                    │
│ │    Consultas: 5 | Rating: 4.8   │                                    │
│ └──────────────────────────────────┘                                    │
├─────────────────────────────────────────────────────────────────────────┤
│ ┌──────────────────────────────────────────────────────────────────────┐│
│ │ RECOMENDACIONES RECIENTES                                            ││
│ │                                                                      ││
│ │ 💡 "Considera diversificar tu portafolio de inversiones"    Financi.││
│ │    Implementado: ✓ | Resultado: Positivo                            ││
│ │                                                                      ││
│ │ 💡 "Establecer rutina de ejercicio 3x semana"               Bienest.││
│ │    Implementado: En progreso | Adherencia: 67%                      ││
│ │                                                                      ││
│ │ 💡 "Actualizar LinkedIn con nuevas certificaciones"         Carrera ││
│ │    Implementado: Pendiente                                          ││
│ └──────────────────────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────────────────┤
│ [Financiero ●] [Crianza ●] [Emprendimiento ●] [Carrera ●] [Bienestar ●]│
│                                                      Sync: por consulta │
└─────────────────────────────────────────────────────────────────────────┘
```

### 8.3 Quick Actions para Pascual

```typescript
const consultorQuickActions: QuickAction[] = [
  { id: "finance", label: "Finanzas", icon: "💰", prompt: "Pascual, necesito asesoría financiera sobre [tema]" },
  { id: "parenting", label: "Crianza", icon: "👶", prompt: "Pascual, consulta sobre crianza: [situación]" },
  { id: "business", label: "Emprendimiento", icon: "🚀", prompt: "Pascual, asesoría para mi emprendimiento: [tema]" },
  { id: "career", label: "Carrera", icon: "💼", prompt: "Pascual, orientación profesional sobre [tema]" },
  { id: "wellness", label: "Bienestar", icon: "🧘", prompt: "Pascual, consulta de bienestar: [área]" },
];
```

---

## 9. Dashboard: GAMBITO (🎯)

### 9.1 Información del Agente

| Atributo | Valor |
|----------|-------|
| **Nombre** | Gambito |
| **Lema** | "La ventaja está en los datos, la excelencia en la iteración" |
| **Rol** | Estratega de Predicción Deportiva |
| **Sub-agentes** | Analyst, Evaluator, Optimizer, Manager, Monitor |
| **Actualización** | Diaria + eventos en vivo |

### 9.2 Layout del Dashboard

```
┌─────────────────────────────────────────────────────────────────────────┐
│ 🎯 GAMBITO - Predicción Deportiva       ● Active    [⟳] [⚙] [💬]      │
│    "La ventaja está en los datos, la excelencia en la iteración"        │
├─────────────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ 💬 Pascual: "¿Qué evento quieres analizar?"                         │ │
│ │ [Analizar partido] [Ver modelos] [ROI report] [Backtest] [________] │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────┤
│ ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐  │
│ │ ROI       │ │ Win Rate  │ │ Precisión │ │ EV        │ │ Sharpe    │  │
│ │ Acumulado │ │           │ │ Modelos   │ │ Promedio  │ │ Ratio     │  │
│ │  +8.3%    │ │   57%     │ │   72%     │ │  +0.034   │ │   1.45    │  │
│ │  ▲ 2.1%   │ │           │ │   ▲ 3%    │ │           │ │           │  │
│ └───────────┘ └───────────┘ └───────────┘ └───────────┘ └───────────┘  │
├─────────────────────────────────────────────────────────────────────────┤
│ ┌──────────────────────────────────┐ ┌────────────────────────────────┐ │
│ │ PREDICCIONES ACTIVAS             │ │ PERFORMANCE POR MERCADO        │ │
│ │                                  │ │                                │ │
│ │ ⚽ Real Madrid vs Barcelona       │ │ ⚽ Fútbol     ████████░░ +12% │ │
│ │    1X2: 2.10 | 3.40 | 3.20      │ │ 🎾 Tenis     ██████░░░░  +6% │ │
│ │    Pred: 1 (45%) | Value: +0.08 │ │ 🏀 Basket    ███████░░░  +8% │ │
│ │    Confidence: HIGH              │ │ ⚾ Baseball  █████░░░░░  +4% │ │
│ │                                  │ │ 🥊 MMA       ████░░░░░░  +2% │ │
│ │ 🎾 Djokovic vs Alcaraz           │ │                                │ │
│ │    ML: 1.85 | 2.05              │ │ Best: Fútbol Over/Under        │ │
│ │    Pred: 2 (52%) | Value: +0.04 │ │ Worst: MMA Props               │ │
│ │    Confidence: MEDIUM            │ │                                │ │
│ │                                  │ └────────────────────────────────┘ │
│ │ 🏀 Lakers vs Celtics             │                                    │
│ │    Spread: -3.5 | Total: 224.5  │                                    │
│ │    Pred: Over | Value: +0.03    │                                    │
│ │    Confidence: MEDIUM            │                                    │
│ │                                  │                                    │
│ │ [Ver todas las predicciones]     │                                    │
│ └──────────────────────────────────┘                                    │
├─────────────────────────────────────────────────────────────────────────┤
│ ┌──────────────────────────────────┐ ┌────────────────────────────────┐ │
│ │ MODEL PERFORMANCE                │ │ BANKROLL MANAGEMENT            │ │
│ │                                  │ │                                │ │
│ │ Poisson Model    ████████░░ 78% │ │ Initial: $10,000               │ │
│ │ Dixon-Coles      █████████░ 82% │ │ Current: $10,830               │ │
│ │ ELO Dynamic      ███████░░░ 71% │ │ P/L: +$830 (+8.3%)             │ │
│ │ ML Ensemble      ████████░░ 79% │ │                                │ │
│ │                                  │ │ Max Drawdown: -4.2%            │ │
│ │ Last Calibration: 2h ago        │ │ Avg Stake: 2.3 units           │ │
│ │ Next Update: 4h                  │ │ Kelly Fraction: 35%            │ │
│ │                                  │ │                                │ │
│ │ [Run Backtest]                   │ │ [Ajustar estrategia]           │ │
│ └──────────────────────────────────┘ └────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────┤
│ [Analyst ●] [Evaluator ●] [Optimizer ●] [Manager ●] [Monitor ●]        │
│                                                      Sync: cada 1h      │
└─────────────────────────────────────────────────────────────────────────┘
```

### 9.3 Quick Actions para Pascual

```typescript
const gambitoQuickActions: QuickAction[] = [
  { id: "analyze", label: "Analizar partido", icon: "⚽", prompt: "Pascual, analiza el partido [equipo1] vs [equipo2]" },
  { id: "models", label: "Ver modelos", icon: "📊", prompt: "Pascual, muestra el rendimiento actual de los modelos" },
  { id: "roi", label: "ROI report", icon: "💰", prompt: "Pascual, genera reporte de ROI del último mes" },
  { id: "backtest", label: "Backtest", icon: "🔄", prompt: "Pascual, ejecuta backtest del modelo [nombre]" },
  { id: "value", label: "Value bets", icon: "🎯", prompt: "Pascual, identifica value bets disponibles ahora" },
];
```

### 9.4 Métricas Específicas

```typescript
interface GambitoMetrics {
  // Performance
  roi: number;                      // Return on Investment %
  winRate: number;                  // % de predicciones ganadoras
  expectedValue: number;            // EV promedio por apuesta
  sharpeRatio: number;              // Risk-adjusted return

  // Models
  modelAccuracy: Record<string, number>;  // Precisión por modelo
  lastCalibration: string;
  calibrationDue: boolean;

  // Bankroll
  initialBankroll: number;
  currentBankroll: number;
  maxDrawdown: number;
  kellyFraction: number;
  averageStake: number;

  // Markets
  performanceByMarket: Record<string, number>;
  bestMarket: string;
  worstMarket: string;

  // Predictions
  activePredictions: number;
  highConfidenceCount: number;
  pendingResults: number;
}
```

---

## 10. Dashboard: CÓNDOR360 (📈)

### 10.1 Información del Agente

| Atributo | Valor |
|----------|-------|
| **Nombre** | Cóndor360 |
| **Lema** | "Visión panorámica • Precisión microscópica" |
| **Rol** | Sistema de Inteligencia Financiera |
| **Sub-agentes** | Cuantificador, Fundamental, Estratega, Newswire, Simulador |
| **Actualización** | Tiempo real (mercados) |

### 10.2 Layout del Dashboard

```
┌─────────────────────────────────────────────────────────────────────────┐
│ 📈 CÓNDOR360 - Inteligencia Financiera  ● Active    [⟳] [⚙] [💬]      │
│    "Visión panorámica • Precisión microscópica"                         │
├─────────────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ 💬 Pascual: "¿Qué análisis financiero necesitas?"                   │ │
│ │ [Analizar activo] [Mi portafolio] [Oportunidades] [Noticias] [____] │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────┤
│ ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐  │
│ │ Portfolio │ │ Sharpe    │ │ Max       │ │ Señales   │ │ Precisión │  │
│ │ Return    │ │ Ratio     │ │ Drawdown  │ │ Activas   │ │ Predicc.  │  │
│ │  +12.4%   │ │   1.8     │ │  -8.2%    │ │    7      │ │   68%     │  │
│ │  ▲ YTD    │ │   ✓ Good  │ │   ✓ OK    │ │           │ │           │  │
│ └───────────┘ └───────────┘ └───────────┘ └───────────┘ └───────────┘  │
├─────────────────────────────────────────────────────────────────────────┤
│ ┌──────────────────────────────────┐ ┌────────────────────────────────┐ │
│ │ PORTFOLIO OVERVIEW               │ │ MARKET SIGNALS                 │ │
│ │                                  │ │                                │ │
│ │ Asset Allocation:                │ │ 🟢 HIGH CONVICTION             │ │
│ │ ┌─────────────────────────────┐ │ │ NVDA - Strong momentum         │ │
│ │ │ Stocks  ██████████░░ 65%   │ │ │ Target: $950 | Current: $875   │ │
│ │ │ Bonds   ████░░░░░░░░ 20%   │ │ │ Upside: +8.5%                  │ │
│ │ │ Crypto  ██░░░░░░░░░░ 10%   │ │ │                                │ │
│ │ │ Cash    █░░░░░░░░░░░  5%   │ │ │ 🟡 MEDIUM CONVICTION           │ │
│ │ └─────────────────────────────┘ │ │ AMZN - Earnings catalyst       │ │
│ │                                  │ │ Target: $195 | Current: $182   │ │
│ │ Top Holdings:                    │ │ Upside: +7.1%                  │ │
│ │ 1. AAPL   15.2%  +2.3% today   │ │                                │ │
│ │ 2. MSFT   12.8%  +1.1% today   │ │ 🔴 SELL SIGNAL                 │ │
│ │ 3. NVDA   10.5%  +4.2% today   │ │ XYZ Corp - Deteriorating fundam│ │
│ │ 4. GOOGL   8.3%  -0.5% today   │ │ Action: Reduce position 50%    │ │
│ │                                  │ │                                │ │
│ │ [Ver portafolio completo]        │ │ [Ver todas las señales]        │ │
│ └──────────────────────────────────┘ └────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────┤
│ ┌──────────────────────────────────┐ ┌────────────────────────────────┐ │
│ │ SECTOR HEAT MAP                  │ │ NEWS & CATALYSTS               │ │
│ │                                  │ │                                │ │
│ │ Technology    ████ +2.1%        │ │ 📰 Fed signals rate pause      │ │
│ │ Healthcare    ███  +1.2%        │ │    Impact: Positive for growth │ │
│ │ Finance       ██   +0.8%        │ │    2h ago                      │ │
│ │ Energy        █    +0.3%        │ │                                │ │
│ │ Consumer      ░    -0.2%        │ │ 📰 NVDA beats estimates        │ │
│ │ Utilities     ░░   -0.5%        │ │    Impact: Strong buy signal   │ │
│ │                                  │ │    5h ago                      │ │
│ │ Market Sentiment: BULLISH       │ │                                │ │
│ │ VIX: 14.2 (Low volatility)      │ │ 📰 Oil prices rising           │ │
│ │                                  │ │    Impact: Energy sector boost │ │
│ │                                  │ │    8h ago                      │ │
│ └──────────────────────────────────┘ └────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────┤
│ [Cuantificador ●] [Fundamental ●] [Estratega ●] [Newswire ●] [Simul. ●]│
│                                               Sync: real-time (markets) │
└─────────────────────────────────────────────────────────────────────────┘
```

### 10.3 Quick Actions para Pascual

```typescript
const condor360QuickActions: QuickAction[] = [
  { id: "analyze", label: "Analizar activo", icon: "📊", prompt: "Pascual, analiza [ticker] con análisis técnico y fundamental" },
  { id: "portfolio", label: "Mi portafolio", icon: "💼", prompt: "Pascual, genera un reporte de mi portafolio actual" },
  { id: "opportunities", label: "Oportunidades", icon: "🎯", prompt: "Pascual, identifica oportunidades de inversión según mi perfil" },
  { id: "news", label: "Noticias", icon: "📰", prompt: "Pascual, resumen de noticias financieras relevantes" },
  { id: "rebalance", label: "Rebalancear", icon: "⚖️", prompt: "Pascual, sugiere rebalanceo óptimo de mi portafolio" },
];
```

### 10.4 Métricas Específicas

```typescript
interface Condor360Metrics {
  // Portfolio Performance
  portfolioReturn: number;          // YTD return %
  sharpeRatio: number;
  maxDrawdown: number;
  alpha: number;                    // vs benchmark
  beta: number;

  // Analysis
  signalsGenerated: number;
  highConvictionSignals: number;
  predictionAccuracy: number;

  // Risk
  sectorConcentration: Record<string, number>;
  volatility: number;
  valueAtRisk: number;

  // Market
  marketSentiment: "bullish" | "neutral" | "bearish";
  vixLevel: number;
  sectorPerformance: Record<string, number>;

  // News
  relevantNewsCount: number;
  impactfulCatalysts: string[];
}
```

---

## 11. Dashboard: OPTIMUS (🎨)

### 11.1 Información del Agente

| Atributo | Valor |
|----------|-------|
| **Nombre** | Optimus |
| **Lema** | "Información valiosa, perfectamente presentada" |
| **Rol** | Sistema de Interfaces y Experiencia de Usuario |
| **Sub-agentes** | Designer, Integrator, Innovator, Communicator, Conservator |
| **Actualización** | Tiempo real |

### 11.2 Layout del Dashboard

```
┌─────────────────────────────────────────────────────────────────────────┐
│ 🎨 OPTIMUS - Interfaces UX              ● Active    [⟳] [⚙] [💬]      │
│    "Información valiosa, perfectamente presentada"                      │
├─────────────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ 💬 Pascual: "¿Cómo puedo mejorar la experiencia del usuario?"       │ │
│ │ [Nuevo componente] [UX audit] [Performance] [Accesibilidad] [_____] │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────┤
│ ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐  │
│ │ Uptime    │ │ Load Time │ │ Accesibil.│ │ Componen. │ │ UX Score  │  │
│ │           │ │           │ │           │ │           │ │           │  │
│ │  99.8%    │ │  1.8s     │ │   98%     │ │    47     │ │   92/100  │  │
│ │  ✓        │ │  ✓ Good   │ │  WCAG AA  │ │  library  │ │           │  │
│ └───────────┘ └───────────┘ └───────────┘ └───────────┘ └───────────┘  │
├─────────────────────────────────────────────────────────────────────────┤
│ ┌──────────────────────────────────┐ ┌────────────────────────────────┐ │
│ │ SYSTEM HEALTH                    │ │ COMPONENT LIBRARY              │ │
│ │                                  │ │                                │ │
│ │ Dashboard Status: ✓ Operational │ │ Most Used:                     │ │
│ │                                  │ │ • Card (234 instances)         │ │
│ │ Web Vitals:                      │ │ • Button (189 instances)       │ │
│ │ LCP  ████████░░ 1.8s   Good     │ │ • Badge (156 instances)        │ │
│ │ FID  ██████████ 45ms   Good     │ │ • LineChart (89 instances)     │ │
│ │ CLS  █████████░ 0.08   Good     │ │                                │ │
│ │                                  │ │ Recently Added:                │ │
│ │ Lighthouse Score: 92/100        │ │ • PascualFeedbackBar (new)     │ │
│ │                                  │ │ • AgentStatusGrid (new)        │ │
│ │ Error Rate: 0.2%                │ │ • KanbanColumn (new)           │ │
│ │ Active Sessions: 12              │ │                                │ │
│ │                                  │ │ [Ver biblioteca completa]      │ │
│ └──────────────────────────────────┘ └────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────┤
│ ┌──────────────────────────────────┐ ┌────────────────────────────────┐ │
│ │ INNOVATION LAB                   │ │ ACCESSIBILITY REPORT           │ │
│ │                                  │ │                                │ │
│ │ 💡 Proposed Improvements:        │ │ WCAG 2.1 AA Compliance: 98%   │ │
│ │                                  │ │                                │ │
│ │ • Dark mode toggle (Approved)   │ │ ✓ Color contrast     Pass     │ │
│ │   Status: In Development        │ │ ✓ Keyboard nav       Pass     │ │
│ │                                  │ │ ✓ Screen reader     Pass     │ │
│ │ • Voice commands (Review)       │ │ ⚠ Focus indicators  Partial  │ │
│ │   Status: Prototype Ready       │ │ ✓ ARIA labels       Pass     │ │
│ │                                  │ │                                │ │
│ │ • Gesture navigation (Concept)  │ │ Issues Found: 3                │ │
│ │   Status: Research              │ │ • Missing alt text (2)         │ │
│ │                                  │ │ • Low contrast link (1)        │ │
│ │ [Submit new idea]                │ │                                │ │
│ └──────────────────────────────────┘ └────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────┤
│ [Designer ●] [Integrator ●] [Innovator ●] [Communicator ●] [Conserv. ●]│
│                                                      Sync: tiempo real  │
└─────────────────────────────────────────────────────────────────────────┘
```

### 11.3 Quick Actions para Pascual

```typescript
const optimusQuickActions: QuickAction[] = [
  { id: "component", label: "Nuevo componente", icon: "🧩", prompt: "Pascual, diseña un componente para [propósito]" },
  { id: "audit", label: "UX audit", icon: "🔍", prompt: "Pascual, realiza una auditoría UX de [página/componente]" },
  { id: "performance", label: "Performance", icon: "⚡", prompt: "Pascual, analiza el rendimiento de la aplicación" },
  { id: "accessibility", label: "Accesibilidad", icon: "♿", prompt: "Pascual, verifica accesibilidad WCAG de [componente]" },
  { id: "prototype", label: "Prototipar", icon: "✏️", prompt: "Pascual, crea un prototipo para [funcionalidad]" },
];
```

---

## 12. Componentes Compartidos

### 12.1 PascualFeedbackBar (Componente Crítico)

```typescript
// src/components/agents/PascualFeedbackBar.tsx

interface PascualFeedbackBarProps {
  agentId: string;
  agentName: string;
  agentIcon: string;
  quickActions: QuickAction[];
  placeholder?: string;
  onSendMessage: (message: string) => Promise<PascualResponse>;
}

// Features:
// - Input de texto con autocompletado contextual
// - Quick actions específicas del agente
// - Historial de conversación colapsable
// - Indicador de estado de conexión
// - Sugerencias basadas en contexto actual
// - Soporte para comandos de voz (futuro)
```

### 12.2 AgentHeader

```typescript
// src/components/agents/AgentHeader.tsx

interface AgentHeaderProps {
  agentId: string;
  name: string;
  icon: string;
  lema: string;
  status: AgentStatus;
  lastSync: string;
  onRefresh: () => void;
  onSettings: () => void;
  onChat: () => void;
}
```

### 12.3 SubAgentStatusBar

```typescript
// src/components/agents/SubAgentStatusBar.tsx

interface SubAgentStatusBarProps {
  subAgents: SubAgentStatus[];
  lastSync: string;
  onSubAgentClick?: (subAgentId: string) => void;
}
```

### 12.4 AgentKPIGrid

```typescript
// src/components/agents/AgentKPIGrid.tsx

interface AgentKPIGridProps {
  kpis: KPI[];
  columns?: 4 | 5 | 6;
}

interface KPI {
  id: string;
  title: string;
  value: string | number;
  trend?: { value: number; positive: boolean };
  status?: "good" | "warning" | "critical";
  tooltip?: string;
}
```

---

## 13. Rutas y Navegación

### 13.1 Estructura de Rutas

```
/dashboard/agents/
├── asistente/          → Dashboard Asistente
├── nexus/              → Dashboard Nexus
├── sentinel/           → Dashboard Sentinel
├── scout/              → Dashboard Scout
├── audiovisual/        → Dashboard Audiovisual
├── consultor/          → Dashboard Consultor
├── gambito/            → Dashboard Gambito
├── condor360/          → Dashboard Cóndor360
└── optimus/            → Dashboard Optimus
```

### 13.2 Actualización del Sidebar

```typescript
// Agregar nueva sección en Sidebar.tsx

const agentDashboardItems = [
  { name: "Asistente", path: "/dashboard/agents/asistente", icon: "👤" },
  { name: "Nexus", path: "/dashboard/agents/nexus", icon: "🔧" },
  { name: "Sentinel", path: "/dashboard/agents/sentinel", icon: "🛡️" },
  { name: "Scout", path: "/dashboard/agents/scout", icon: "🔍" },
  { name: "Audiovisual", path: "/dashboard/agents/audiovisual", icon: "🎬" },
  { name: "Consultor", path: "/dashboard/agents/consultor", icon: "📚" },
  { name: "Gambito", path: "/dashboard/agents/gambito", icon: "🎯" },
  { name: "Cóndor360", path: "/dashboard/agents/condor360", icon: "📈" },
  { name: "Optimus", path: "/dashboard/agents/optimus", icon: "🎨" },
];
```

---

## 14. Roadmap de Implementación

### Fase 1: Infraestructura Base (Sprint 1)

**Entregables:**
- [ ] Componente `PascualFeedbackBar`
- [ ] Componente `AgentHeader`
- [ ] Componente `SubAgentStatusBar`
- [ ] Componente `AgentKPIGrid`
- [ ] Layout base de dashboard de agente
- [ ] Actualización del Sidebar con nuevas rutas

### Fase 2: Dashboards Críticos (Sprint 2)

**Entregables:**
- [ ] Dashboard Sentinel (seguridad - prioridad crítica)
- [ ] Dashboard Cóndor360 (finanzas - prioridad crítica)
- [ ] Dashboard Gambito (predicciones - prioridad alta)

### Fase 3: Dashboards de Productividad (Sprint 3)

**Entregables:**
- [ ] Dashboard Asistente
- [ ] Dashboard Nexus
- [ ] Dashboard Scout

### Fase 4: Dashboards de Contenido (Sprint 4)

**Entregables:**
- [ ] Dashboard Audiovisual
- [ ] Dashboard Consultor
- [ ] Dashboard Optimus

### Fase 5: Integración y Pulido (Sprint 5)

**Entregables:**
- [ ] Integración completa con Pascual (backend)
- [ ] Sistema de notificaciones cross-agent
- [ ] Personalización de dashboards por usuario
- [ ] Testing de usabilidad y refinamiento UX

---

## 15. Consideraciones de UX

### 15.1 Principios de Diseño

1. **Consistencia**: Todos los dashboards siguen la misma estructura base
2. **Contextualización**: Cada dashboard muestra información relevante al dominio
3. **Accionabilidad**: Toda métrica debe llevar a una acción posible
4. **Feedback inmediato**: El usuario siempre sabe el estado de sus solicitudes
5. **Comunicación bidireccional**: Pascual siempre accesible desde cualquier dashboard

### 15.2 Patrones de Interacción

| Patrón | Descripción | Uso |
|--------|-------------|-----|
| Quick Actions | Acciones frecuentes en un clic | Todas las páginas |
| Drill-down | Click para ver más detalle | KPIs, tablas |
| Inline editing | Edición sin salir de contexto | Configuraciones |
| Toast notifications | Feedback de acciones | Sistema global |
| Progressive disclosure | Mostrar info gradualmente | Paneles complejos |

### 15.3 Estados de UI

```typescript
type UIState =
  | "loading"      // Cargando datos
  | "ready"        // Datos disponibles
  | "empty"        // Sin datos
  | "error"        // Error de carga
  | "stale"        // Datos desactualizados
  | "syncing";     // Sincronizando
```

---

## 16. Anexos

### A. Iconografía de Agentes

| Agente | Icono | Color Principal |
|--------|-------|-----------------|
| Asistente | 👤 | #00d9ff (cyan) |
| Nexus | 🔧 | #39ff14 (lime) |
| Sentinel | 🛡️ | #ff006e (pink) |
| Scout | 🔍 | #00d9ff (cyan) |
| Audiovisual | 🎬 | #ffaa00 (orange) |
| Consultor | 📚 | #a855f7 (purple) |
| Gambito | 🎯 | #39ff14 (lime) |
| Cóndor360 | 📈 | #00d9ff (cyan) |
| Optimus | 🎨 | #ffaa00 (orange) |

### B. Frecuencias de Actualización

| Agente | Frecuencia | Trigger |
|--------|------------|---------|
| Asistente | Real-time | Eventos de usuario |
| Nexus | 5 min | Pipeline CI/CD |
| Sentinel | Real-time | Eventos de seguridad |
| Scout | Continua | Búsquedas y monitoreos |
| Audiovisual | Por demanda | Solicitudes de assets |
| Consultor | Por consulta | Solicitudes de asesoría |
| Gambito | 1h + live | Eventos deportivos |
| Cóndor360 | Real-time | Horario de mercado |
| Optimus | Real-time | Métricas de sistema |

### C. Historial de Cambios

| Versión | Fecha | Descripción |
|---------|-------|-------------|
| 2.0.0 | 2025-03-06 | Documento inicial V2 - Dashboards por agente |

---

*Documento de Requerimientos V2 - PASCUAL Dashboard*
*Dashboards Especializados por Agente con Retroalimentación Pascual*
