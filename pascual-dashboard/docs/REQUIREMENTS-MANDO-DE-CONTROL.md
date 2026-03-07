# Dashboard Mando de Control - Documento de Requerimientos

## Resumen Ejecutivo

### Vision
El **Mando de Control** es un dashboard centralizado que proporciona visibilidad completa y control operativo sobre los 9 agentes especializados del ecosistema PASCUAL. Sirve como centro neuralgico para monitorear actividades, gestionar tareas, revisar logs de ejecucion y orquestar comunicacion entre agentes.

### Alcance
- Monitoreo en tiempo real de todos los agentes y sub-agentes
- Gestion centralizada de cola de tareas con vista Kanban
- Registro de auditoria y logs de ejecucion
- Metricas y KPIs por agente
- Controles de orquestacion y comunicacion inter-agentes
- Sistema de alertas y notificaciones

### Objetivos
1. Proporcionar visibilidad 360° del ecosistema de agentes
2. Facilitar la gestion y priorizacion de tareas
3. Permitir auditoria completa de operaciones
4. Habilitar comunicacion directa con cualquier agente
5. Detectar y responder proactivamente a incidentes

### Contexto Operativo Critico

> **IMPORTANTE:** Esta aplicacion sera administrada por un bot autonomo (PASCUAL).
> La data puede variar significativamente dia a dia, por lo tanto la **flexibilidad**
> es un factor vital en el desarrollo y arquitectura de esta aplicacion.

**Implicaciones Arquitectonicas:**
- Los componentes deben renderizar correctamente con datos vacios, parciales o completos
- Las estructuras de datos deben soportar campos opcionales y extensibles
- La UI debe adaptarse dinamicamente a la cantidad y tipo de datos disponibles
- No debe haber dependencias hard-coded en valores especificos
- El sistema debe ser resiliente a cambios en el esquema de datos

---

## Arquitectura para Administracion por Bot

### Principios de Flexibilidad

#### 1. Data-Driven Everything
Toda la UI debe ser impulsada por datos, no por configuracion estatica:

```typescript
// MAL - Configuracion estatica
const AGENTS = ['sentinel', 'nexus', 'scout']; // Hard-coded

// BIEN - Configuracion dinamica
interface AgentRegistry {
  agents: AgentDefinition[];
  getAgent: (id: string) => AgentDefinition | undefined;
  getActiveAgents: () => AgentDefinition[];
}
```

#### 2. Schema Flexible
Todas las entidades deben soportar campos dinamicos:

```typescript
// Todas las interfaces incluyen metadata extensible
interface BaseEntity {
  id: string;
  createdAt: number;
  updatedAt: number;
  metadata?: Record<string, unknown>; // Campos adicionales dinamicos
  _version?: number; // Para manejo de conflictos
}
```

#### 3. Graceful Degradation
Los componentes deben manejar ausencia de datos elegantemente:

```typescript
// Componente resiliente
interface ResilientComponentProps<T> {
  data: T | null | undefined;
  loading?: boolean;
  error?: Error | null;
  fallback?: React.ReactNode;
  emptyState?: React.ReactNode;
}
```

### API para Bot Administration

#### Endpoints Requeridos

| Endpoint | Metodo | Descripcion |
|----------|--------|-------------|
| `/api/agents` | GET | Lista todos los agentes registrados |
| `/api/agents/:id` | GET/PUT | Obtener/actualizar agente |
| `/api/agents/:id/metrics` | POST | Enviar metricas del agente |
| `/api/tasks` | GET/POST | CRUD de tareas |
| `/api/tasks/bulk` | POST | Operaciones masivas |
| `/api/logs` | POST | Ingesta de logs |
| `/api/logs/bulk` | POST | Ingesta masiva de logs |
| `/api/alerts` | GET/POST | CRUD de alertas |
| `/api/config` | GET/PUT | Configuracion dinamica |
| `/api/schema` | GET | Schema actual de datos |

#### Formato de Payload Estandarizado

```typescript
// Request del bot
interface BotRequest<T> {
  source: string; // ID del agente que envia
  timestamp: number;
  action: 'create' | 'update' | 'delete' | 'bulk';
  data: T | T[];
  options?: {
    upsert?: boolean;
    merge?: boolean;
    validate?: boolean;
  };
}

// Response al bot
interface BotResponse<T> {
  success: boolean;
  data?: T;
  errors?: Array<{
    code: string;
    message: string;
    field?: string;
  }>;
  meta: {
    processedAt: number;
    itemsAffected: number;
  };
}
```

### Configuracion Dinamica

El bot puede modificar la configuracion del dashboard en runtime:

```typescript
interface DashboardConfig {
  // Agentes activos (puede cambiar diariamente)
  agents: {
    enabled: string[];
    order: string[];
    visibility: Record<string, boolean>;
  };

  // KPIs a mostrar (configurables por el bot)
  kpis: {
    overview: KPIDefinition[];
    byAgent: Record<string, KPIDefinition[]>;
  };

  // Columnas del Kanban (configurables)
  taskBoard: {
    columns: TaskColumnDefinition[];
    defaultFilters: TaskFilters;
  };

  // Umbrales de alertas (ajustables)
  alerts: {
    thresholds: Record<string, AlertThreshold>;
    enabled: boolean;
  };

  // Refresh rates
  polling: {
    overview: number; // ms
    tasks: number;
    logs: number;
    alerts: number;
  };

  // Feature flags
  features: Record<string, boolean>;
}
```

### Manejo de Datos Variables

#### Estrategia de Sincronizacion

```typescript
interface SyncStrategy {
  // Full sync diario
  fullSync: {
    schedule: string; // cron expression
    entities: string[];
  };

  // Incremental sync
  incrementalSync: {
    interval: number; // ms
    entities: string[];
    watermark: Record<string, number>; // ultimo timestamp por entidad
  };

  // Real-time updates
  realtime: {
    enabled: boolean;
    entities: string[];
    transport: 'websocket' | 'sse' | 'polling';
  };
}
```

#### Versionado de Datos

```typescript
interface VersionedData<T> {
  current: T;
  version: number;
  history?: Array<{
    version: number;
    timestamp: number;
    changes: Partial<T>;
  }>;
  lastSyncedAt: number;
  source: 'bot' | 'user' | 'system';
}
```

### Componentes Auto-Adaptables

#### Grid Dinamico

```typescript
interface DynamicGridProps<T> {
  // Data puede ser cualquier array
  data: T[];

  // Schema descubierto automaticamente o provisto
  schema?: GridSchema;

  // Columnas se generan del schema si no se proveen
  columns?: ColumnDefinition[];

  // Renderizado personalizado por tipo de dato
  typeRenderers?: Record<string, React.ComponentType<{ value: unknown }>>;

  // Manejo de datos faltantes
  emptyCell?: React.ReactNode;

  // Auto-resize basado en contenido
  autoSize?: boolean;
}
```

#### KPI Card Flexible

```typescript
interface FlexibleKPIProps {
  // Definicion dinamica
  definition: {
    id: string;
    label: string;
    dataPath: string; // Path al valor en los datos
    format?: 'number' | 'percentage' | 'currency' | 'duration' | string;
    thresholds?: {
      good?: number;
      warning?: number;
      critical?: number;
    };
  };

  // Datos (estructura variable)
  data: Record<string, unknown>;

  // Fallback si el dato no existe
  fallbackValue?: string | number;
}
```

### Validacion y Sanitizacion

```typescript
// El bot puede enviar datos con estructura variable
// El sistema debe validar y sanitizar

interface DataValidator {
  // Validar contra schema dinamico
  validate: (data: unknown, schema: JSONSchema) => ValidationResult;

  // Sanitizar datos entrantes
  sanitize: (data: unknown, rules: SanitizationRules) => unknown;

  // Coercion de tipos
  coerce: (value: unknown, targetType: string) => unknown;

  // Valores por defecto
  applyDefaults: (data: unknown, defaults: Record<string, unknown>) => unknown;
}

interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  coercedData?: unknown; // Datos despues de coercion
}
```

### Registro de Agentes Dinamico

```typescript
// Los agentes pueden registrarse/desregistrarse en runtime
interface AgentRegistry {
  // Registrar nuevo agente
  register: (agent: AgentDefinition) => Promise<void>;

  // Desregistrar agente
  unregister: (agentId: string) => Promise<void>;

  // Actualizar definicion
  update: (agentId: string, updates: Partial<AgentDefinition>) => Promise<void>;

  // Obtener agentes activos
  getActive: () => AgentDefinition[];

  // Suscribirse a cambios
  subscribe: (callback: (agents: AgentDefinition[]) => void) => () => void;
}

interface AgentDefinition {
  id: string;
  name: string;
  icon: string;
  lema: string;
  status: AgentStatus;

  // Sub-agentes (cantidad variable)
  subAgents: SubAgentDefinition[];

  // Metricas que este agente reporta (dinamicas)
  metrics: MetricDefinition[];

  // Capacidades del agente
  capabilities: string[];

  // Configuracion especifica
  config: Record<string, unknown>;

  // Metadata extensible
  metadata?: Record<string, unknown>;
}
```

---

## Arquitectura del Ecosistema PASCUAL

### Jerarquia de Agentes

```
                    ┌─────────────────┐
                    │    PASCUAL      │
                    │  Orquestador    │
                    │   (Nivel 0)     │
                    └────────┬────────┘
                             │
    ┌────────────────────────┼────────────────────────┐
    │                        │                        │
┌───┴───┐ ┌───────┐ ┌───────┴───────┐ ┌───────┐ ┌───┴───┐
│Asist. │ │ Nexus │ │   Sentinel    │ │ Scout │ │Audio- │
│(1.1)  │ │(1.2)  │ │    (1.3)      │ │(1.4)  │ │visual │
└───┬───┘ └───┬───┘ └───────┬───────┘ └───┬───┘ │(1.5)  │
    │         │             │             │     └───┬───┘
    │         │             │             │         │
┌───┴───┐ ┌───┴───┐ ┌───────┴───────┐ ┌───┴───┐ ┌───┴───┐
│Consul-│ │Gambito│ │   Condor360   │ │Optimus│ │       │
│tor    │ │(1.7)  │ │    (1.8)      │ │(1.9)  │ │       │
│(1.6)  │ │       │ │               │ │       │ │       │
└───────┘ └───────┘ └───────────────┘ └───────┘ └───────┘
```

### Flujos de Comunicacion Inter-Agentes

| Origen | Destino | Tipo de Comunicacion |
|--------|---------|---------------------|
| Pascual | Todos | Direccionamiento de solicitudes |
| Scout | Todos | Provision de datos e informacion |
| Sentinel | Todos | Capa de seguridad y monitoreo |
| Optimus | Todos | Visualizacion de datos |
| Nexus | Todos | Implementacion tecnica |

---

## Definicion de Agentes

### 1.1 Asistente - Gestor Personal Inteligente
**Lema:** "Organizacion proactiva, vida simplificada"

| Sub-Agente | ID | Funcion |
|------------|-----|---------|
| Chronos | 1.1.1 | Gestion de tiempo y tareas |
| Proactive | 1.1.2 | Anticipacion proactiva |
| Domus | 1.1.3 | Gestion domestica |

**Metricas Clave:**
- Tareas completadas por dia
- Recordatorios activos
- Tasa de cumplimiento de rutinas
- Tiempo promedio de respuesta

---

### 1.2 Nexus - Director de Desarrollo de Software
**Lema:** "Excelencia tecnica, evolucion constante"

| Sub-Agente | ID | Funcion |
|------------|-----|---------|
| Explorer | 1.2.1 | Analista de codigo |
| Proposer | 1.2.2 | Estratega tecnico |
| Spec Writer | 1.2.3 | Especificador |
| Designer | 1.2.4 | Arquitecto |
| Task Planner | 1.2.5 | Planificador |
| Implementador | 1.2.6 | Desarrollador |
| Verificador QA | 1.2.7 | Control de calidad |
| Auditor | 1.2.8 | Evaluador tecnico |

**Metricas Clave:**
- Commits por periodo
- Code coverage (%)
- Issues abiertos/cerrados
- Tiempo de build promedio
- Deuda tecnica (score)

---

### 1.3 Sentinel - Guardian de Seguridad y Estabilidad
**Lema:** "Vigilancia infalible, proteccion inquebrantable"

| Sub-Agente | ID | Funcion |
|------------|-----|---------|
| Cipher | 1.3.1 | Director de seguridad digital |
| Monitor | 1.3.2 | Supervisor de rendimiento |
| Guardian | 1.3.3 | Resiliencia y recuperacion |
| Warden | 1.3.4 | Gestor de acceso y cumplimiento |
| Custodian | 1.3.5 | Administrador de recursos |

**Metricas Clave:**
- Amenazas detectadas
- Vulnerabilidades activas
- Uptime del sistema (%)
- Tiempo de respuesta a incidentes
- Score de seguridad

---

### 1.4 Scout - Maestro en Busqueda e Ingesta de Datos
**Lema:** "Toda la informacion, donde la necesites, cuando la necesites"

| Sub-Agente | ID | Funcion |
|------------|-----|---------|
| Hunter | 1.4.1 | Especialista en busqueda avanzada |
| Harvester | 1.4.2 | Experto en ingesta y extraccion |
| Curator | 1.4.3 | Gestor de calidad y verificacion |
| Synthesizer | 1.4.4 | Procesador y sintetizador |
| Satelite | 1.4.5 | Vigilante de actualizaciones |

**Metricas Clave:**
- Busquedas ejecutadas
- Datos procesados (GB)
- Fuentes monitoreadas
- Precision de datos (%)
- Alertas generadas

---

### 1.5 Audiovisual - Orquestador Multimedia Integral
**Lema:** "La forma perfecta para cada mensaje"

| Sub-Agente | ID | Funcion |
|------------|-----|---------|
| Imagen | 1.5.1 | Creacion y edicion visual |
| Video | 1.5.2 | Produccion videografica |
| Audio | 1.5.3 | Produccion sonora y voz |
| Texto | 1.5.4 | Contenido textual y narrativa |
| Bibliotecario | 1.5.5 | Gestor de recursos multimedia |

**Metricas Clave:**
- Recursos generados
- Almacenamiento usado (GB)
- Formatos soportados
- Tiempo de procesamiento promedio
- Recursos en biblioteca

---

### 1.6 Consultor - Orquestador Multidisciplinario de Conocimiento
**Lema:** "Conocimiento especializado, vision integral"

| Sub-Agente | ID | Funcion |
|------------|-----|---------|
| Financiero | 1.6.1 | Asesoramiento economico |
| Crianza | 1.6.2 | Desarrollo infantil y familiar |
| Emprendimiento | 1.6.3 | Creacion de negocios |
| Carrera | 1.6.4 | Desarrollo profesional |
| Bienestar | 1.6.5 | Salud integral |

**Metricas Clave:**
- Consultas atendidas
- Planes generados
- Seguimientos activos
- Satisfaccion del usuario
- Recomendaciones implementadas

---

### 1.7 Gambito - Estratega de Prediccion Deportiva
**Lema:** "La ventaja esta en los datos, la excelencia en la iteracion"

| Sub-Agente | ID | Funcion |
|------------|-----|---------|
| Analista | 1.7.1 | Modelado estadistico |
| Evaluador | 1.7.2 | Pruebas y validacion |
| Optimizador | 1.7.3 | Ajuste de modelos |
| Gestor | 1.7.4 | Administracion de capital |
| Monitor | 1.7.5 | Seguimiento de resultados |

**Metricas Clave:**
- Precision de predicciones (%)
- ROI simulado (%)
- Modelos activos
- Eventos analizados
- Valor esperado promedio

---

### 1.8 Condor360 - Sistema de Inteligencia Financiera
**Lema:** "Vision panoramica - Precision microscopica"

| Sub-Agente | ID | Funcion |
|------------|-----|---------|
| Cuantificador | 1.8.1 | Analisis numerico de mercados |
| Fundamental | 1.8.2 | Evaluacion empresarial |
| Estratega | 1.8.3 | Optimizacion de portafolios |
| Newswire | 1.8.4 | Analisis de noticias financieras |
| Simulador | 1.8.5 | Validacion de estrategias |

**Metricas Clave:**
- Rendimiento del portafolio (%)
- Activos monitoreados
- Alertas de mercado
- Recomendaciones activas
- Score de riesgo

---

### 1.9 Optimus - Sistema de Interfaces y UX
**Lema:** "Informacion valiosa, perfectamente presentada"

| Sub-Agente | ID | Funcion |
|------------|-----|---------|
| Disenador | 1.9.1 | UX/UI y arquitectura visual |
| Integrador | 1.9.2 | Conexion de datos y APIs |
| Innovador | 1.9.3 | Prototipos y mejoras |
| Comunicador | 1.9.4 | Visualizacion de datos |
| Conservador | 1.9.5 | Gestion de componentes |

**Metricas Clave:**
- Componentes activos
- Tiempo de carga (ms)
- Errores de UI
- Satisfaccion de UX
- Mejoras implementadas

---

## Estructura de Pestanas (5 Tabs)

### Tab 1: Overview
**Proposito:** Vision general del ecosistema y KPIs criticos del sistema.

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│                    SYSTEM HEALTH BAR                         │
│  [CPU: 45%] [Memory: 62%] [Uptime: 99.9%] [Active: 9/9]     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐         │
│  │   KPI Card   │ │   KPI Card   │ │   KPI Card   │         │
│  │ Tasks Today  │ │   Alerts     │ │   Messages   │         │
│  │     127      │ │      3       │ │     1,245    │         │
│  └──────────────┘ └──────────────┘ └──────────────┘         │
│                                                              │
│  ┌────────────────────────┐ ┌────────────────────────┐      │
│  │                        │ │                        │      │
│  │    Agent Status Grid   │ │    Activity Timeline   │      │
│  │    (9 agent cards)     │ │    (Recent events)     │      │
│  │                        │ │                        │      │
│  └────────────────────────┘ └────────────────────────┘      │
│                                                              │
│  ┌──────────────────────────────────────────────────┐       │
│  │              System Performance Chart             │       │
│  │         (24h activity across all agents)          │       │
│  └──────────────────────────────────────────────────┘       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Componentes:**
- `SystemHealthBar` - Barra de estado del sistema
- `KPIGrid` - Grid de 4-6 KPIs principales
- `AgentStatusGrid` - Grid de 9 tarjetas de estado de agentes
- `ActivityTimeline` - Feed de actividad reciente
- `SystemPerformanceChart` - Grafico de rendimiento 24h

---

### Tab 2: Task Queue
**Proposito:** Gestion centralizada de tareas con vista Kanban.

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  [+ New Task]  [Filters ▼]  [Agent ▼]  [Priority ▼] [Search]│
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐   │
│  │  PENDING  │ │IN PROGRESS│ │  BLOCKED  │ │ COMPLETED │   │
│  │    (24)   │ │    (8)    │ │    (2)    │ │   (156)   │   │
│  ├───────────┤ ├───────────┤ ├───────────┤ ├───────────┤   │
│  │           │ │           │ │           │ │           │   │
│  │ Task Card │ │ Task Card │ │ Task Card │ │ Task Card │   │
│  │ ────────  │ │ ────────  │ │ ────────  │ │ ────────  │   │
│  │ Task Card │ │ Task Card │ │           │ │ Task Card │   │
│  │ ────────  │ │ ────────  │ │           │ │ ────────  │   │
│  │ Task Card │ │           │ │           │ │ Task Card │   │
│  │           │ │           │ │           │ │           │   │
│  └───────────┘ └───────────┘ └───────────┘ └───────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Componentes:**
- `TaskBoard` - Tablero Kanban con drag & drop
- `TaskCard` - Tarjeta de tarea individual
- `TaskFilters` - Panel de filtros avanzados
- `TaskModal` - Modal para crear/editar tareas
- `TaskPriorityBadge` - Indicador de prioridad

**Columnas del Kanban:**
1. **Pending** - Tareas en espera
2. **In Progress** - Tareas en ejecucion
3. **Blocked** - Tareas bloqueadas
4. **Completed** - Tareas completadas (ultimas 24h)

---

### Tab 3: Execution Logs
**Proposito:** Registros de auditoria y logs de ejecucion del sistema.

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  [Time Range ▼]  [Agent ▼]  [Level ▼]  [Export]   [Search]  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ TIMESTAMP      │ AGENT    │ LEVEL │ MESSAGE          │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │ 2024-03-07     │ Sentinel │ WARN  │ High CPU usage   │   │
│  │ 14:32:15       │          │       │ detected on...   │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │ 2024-03-07     │ Scout    │ INFO  │ Search completed │   │
│  │ 14:31:42       │          │       │ 1,245 results... │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │ 2024-03-07     │ Nexus    │ ERROR │ Build failed     │   │
│  │ 14:30:18       │          │       │ on module...     │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌─────────────────────────┐ ┌─────────────────────────┐    │
│  │    Log Level Summary    │ │   Logs by Agent Chart   │    │
│  │  INFO: 1,234  WARN: 45  │ │                         │    │
│  │  ERROR: 12   DEBUG: 567 │ │   [Bar chart by agent]  │    │
│  └─────────────────────────┘ └─────────────────────────┘    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Componentes:**
- `LogTable` - Tabla virtualizada de logs
- `LogFilters` - Filtros por tiempo, agente, nivel
- `LogDetail` - Modal de detalle de log
- `LogSummary` - Resumen de logs por nivel
- `LogExport` - Exportacion de logs

**Niveles de Log:**
- `DEBUG` - Informacion de depuracion
- `INFO` - Eventos informativos
- `WARN` - Advertencias
- `ERROR` - Errores
- `CRITICAL` - Errores criticos

---

### Tab 4: Agent Details
**Proposito:** Metricas detalladas y configuracion por agente.

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  [Select Agent ▼]  [Time Range ▼]  [Configure] [Refresh]    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  AGENT: SENTINEL                                        │ │
│  │  Status: Active | Model: Claude Opus | Uptime: 99.9%   │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│  │  Threats     │ │  Response    │ │  Security    │        │
│  │  Detected    │ │  Time        │ │  Score       │        │
│  │     247      │ │    45ms      │ │    98/100    │        │
│  └──────────────┘ └──────────────┘ └──────────────┘        │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              SUB-AGENTS STATUS                        │   │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐    │   │
│  │  │ Cipher  │ │ Monitor │ │Guardian │ │ Warden  │    │   │
│  │  │ Active  │ │ Active  │ │ Active  │ │  Idle   │    │   │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘    │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │           PERFORMANCE CHART (24h)                     │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Componentes:**
- `AgentSelector` - Dropdown de seleccion de agente
- `AgentHeader` - Cabecera con info del agente
- `AgentKPIs` - KPIs especificos del agente
- `SubAgentGrid` - Grid de sub-agentes
- `AgentPerformanceChart` - Grafico de rendimiento
- `AgentConfigModal` - Modal de configuracion

---

### Tab 5: Orchestration
**Proposito:** Controles de orquestacion y comunicacion entre agentes.

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  ORCHESTRATION CONTROLS                                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                AGENT COMMUNICATION MAP                │   │
│  │                                                       │   │
│  │         [Interactive node graph showing               │   │
│  │          agent connections and message flow]          │   │
│  │                                                       │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌─────────────────────────┐ ┌─────────────────────────┐    │
│  │   QUICK ACTIONS         │ │   AGENT MESSENGER       │    │
│  │                         │ │                         │    │
│  │  [Start All Agents]     │ │  To: [Select Agent ▼]   │    │
│  │  [Stop All Agents]      │ │  ┌─────────────────┐   │    │
│  │  [Restart System]       │ │  │                 │   │    │
│  │  [Run Health Check]     │ │  │  Message Input  │   │    │
│  │  [Generate Report]      │ │  │                 │   │    │
│  │                         │ │  └─────────────────┘   │    │
│  └─────────────────────────┘ │  [Send Message]        │    │
│                              └─────────────────────────┘    │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              RECENT INTER-AGENT MESSAGES              │   │
│  │  Scout → Condor360: "Financial data updated"         │   │
│  │  Sentinel → All: "Security scan complete"            │   │
│  │  Pascual → Nexus: "New development task assigned"    │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Componentes:**
- `AgentGraph` - Grafo interactivo de conexiones
- `QuickActions` - Panel de acciones rapidas
- `AgentMessenger` - Formulario de mensajes
- `MessageFeed` - Feed de mensajes entre agentes
- `OrchestrationControls` - Controles del sistema

---

## Componentes UI

### Componentes Existentes a Reutilizar

| Componente | Ubicacion | Uso en Mando de Control |
|------------|-----------|-------------------------|
| `Card` | `components/ui/Card.tsx` | Contenedores de KPIs y secciones |
| `StatCard` | `components/ui/Card.tsx` | Tarjetas de estadisticas |
| `Badge` | `components/ui/Badge.tsx` | Estados y etiquetas |
| `Button` | `components/ui/Button.tsx` | Acciones y controles |
| `Modal` | `components/ui/Modal.tsx` | Dialogos y formularios |
| `Input` | `components/ui/Input.tsx` | Campos de entrada |
| `Toggle` | `components/ui/Toggle.tsx` | Switches de configuracion |
| `LineChart` | `components/charts/LineChart.tsx` | Graficos de tendencia |
| `BarChart` | `components/charts/BarChart.tsx` | Graficos comparativos |
| `CircularProgress` | `components/charts/CircularProgress.tsx` | Indicadores de progreso |
| `HeatMap` | `components/charts/HeatMap.tsx` | Mapas de calor |
| `ActivityFeed` | `components/dashboard/ActivityFeed.tsx` | Feed de actividad |
| `AgentCard` | `components/dashboard/AgentCard.tsx` | Tarjetas de agente |

### Nuevos Componentes Requeridos

#### 1. SystemHealthBar
```typescript
interface SystemHealthBarProps {
  cpuUsage: number;
  memoryUsage: number;
  uptime: number;
  activeAgents: number;
  totalAgents: number;
  alerts: number;
}
```

#### 2. TaskBoard (Kanban)
```typescript
interface TaskBoardProps {
  tasks: Task[];
  columns: TaskColumn[];
  onTaskMove: (taskId: string, newStatus: TaskStatus) => void;
  onTaskClick: (task: Task) => void;
}

interface TaskColumn {
  id: TaskStatus;
  title: string;
  color: string;
}
```

#### 3. LogTable
```typescript
interface LogTableProps {
  logs: LogEntry[];
  onLogClick: (log: LogEntry) => void;
  filters: LogFilters;
  onFilterChange: (filters: LogFilters) => void;
  virtualized?: boolean;
}
```

#### 4. AgentGraph
```typescript
interface AgentGraphProps {
  agents: AgentNode[];
  connections: AgentConnection[];
  messages: AgentMessage[];
  onAgentClick: (agentId: string) => void;
  showMessageFlow?: boolean;
}
```

#### 5. AlertPanel
```typescript
interface AlertPanelProps {
  alerts: Alert[];
  onAlertDismiss: (alertId: string) => void;
  onAlertAction: (alertId: string, action: string) => void;
  maxVisible?: number;
}
```

#### 6. ReportGenerator
```typescript
interface ReportGeneratorProps {
  agents: string[];
  timeRange: TimeRange;
  metrics: string[];
  onGenerate: (config: ReportConfig) => void;
  formats: ('pdf' | 'csv' | 'json')[];
}
```

---

## Estructuras de Datos (TypeScript)

### Task
```typescript
interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo: string; // agentId
  createdAt: number;
  updatedAt: number;
  dueDate?: number;
  completedAt?: number;
  tags?: string[];
  blockedBy?: string[]; // taskIds
  subtasks?: SubTask[];
  metadata?: Record<string, unknown>;
}

type TaskStatus = 'pending' | 'in_progress' | 'blocked' | 'completed' | 'failed';
type TaskPriority = 'critical' | 'high' | 'medium' | 'low';

interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}
```

### LogEntry
```typescript
interface LogEntry {
  id: string;
  timestamp: number;
  agentId: string;
  subAgentId?: string;
  level: LogLevel;
  category: LogCategory;
  message: string;
  details?: Record<string, unknown>;
  stackTrace?: string;
  correlationId?: string;
}

type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'critical';
type LogCategory = 'system' | 'security' | 'performance' | 'task' | 'communication';
```

### Alert
```typescript
interface Alert {
  id: string;
  timestamp: number;
  agentId: string;
  severity: AlertSeverity;
  type: AlertType;
  title: string;
  description: string;
  resolved: boolean;
  resolvedAt?: number;
  resolvedBy?: string;
  actions?: AlertAction[];
  metadata?: Record<string, unknown>;
}

type AlertSeverity = 'critical' | 'warning' | 'info';
type AlertType = 'security' | 'performance' | 'error' | 'threshold' | 'availability';

interface AlertAction {
  id: string;
  label: string;
  action: string;
  destructive?: boolean;
}
```

### AgentMessage
```typescript
interface AgentMessage {
  id: string;
  timestamp: number;
  fromAgent: string;
  toAgent: string | 'all';
  type: MessageType;
  content: string;
  priority: MessagePriority;
  acknowledged: boolean;
  metadata?: Record<string, unknown>;
}

type MessageType = 'request' | 'response' | 'notification' | 'command' | 'data';
type MessagePriority = 'urgent' | 'normal' | 'low';
```

### SystemHealth
```typescript
interface SystemHealth {
  timestamp: number;
  overall: HealthStatus;
  cpu: ResourceMetric;
  memory: ResourceMetric;
  network: ResourceMetric;
  storage: ResourceMetric;
  uptime: number;
  agents: AgentHealth[];
}

interface ResourceMetric {
  current: number;
  average: number;
  peak: number;
  status: HealthStatus;
}

interface AgentHealth {
  agentId: string;
  status: AgentStatus;
  uptime: number;
  responseTime: number;
  errorRate: number;
  lastActivity: number;
}

type HealthStatus = 'healthy' | 'degraded' | 'critical' | 'unknown';
```

---

## Sistema de Alertas

### Tipos de Alertas

| Tipo | Descripcion | Severidad Default |
|------|-------------|-------------------|
| `security` | Amenazas de seguridad detectadas | critical |
| `performance` | Degradacion de rendimiento | warning |
| `error` | Errores de sistema o agente | critical |
| `threshold` | Umbrales excedidos | warning |
| `availability` | Problemas de disponibilidad | critical |

### Umbrales de Alerta

```typescript
const ALERT_THRESHOLDS = {
  cpu: { warning: 70, critical: 90 },
  memory: { warning: 75, critical: 90 },
  responseTime: { warning: 500, critical: 1000 }, // ms
  errorRate: { warning: 1, critical: 5 }, // %
  diskSpace: { warning: 80, critical: 95 }, // %
};
```

### Acciones de Alerta

| Accion | Descripcion |
|--------|-------------|
| `acknowledge` | Reconocer alerta |
| `dismiss` | Descartar alerta |
| `escalate` | Escalar a nivel superior |
| `resolve` | Marcar como resuelta |
| `investigate` | Abrir investigacion |

---

## Consideraciones Tecnicas

### Patrones Existentes a Seguir

1. **Arquitectura de Componentes**
   - Componentes funcionales con TypeScript
   - Props tipadas con interfaces
   - Exportacion de hooks personalizados

2. **Gestion de Estado**
   - `useState` para estado local
   - `useAgentDashboard` hook para dashboards
   - Context API para estado global (Growl)

3. **Estilos**
   - Tailwind CSS para utilidades
   - CSS Variables para temas
   - Clases semanticas del design system

4. **Datos**
   - Service layer (`agentService.ts`)
   - Mock data estructurada
   - Tipos compartidos en `lib/api/types`

### Tokens de Diseno

```css
/* Colores de Estado */
--status-active: #39ff14;
--status-busy: #ffaa00;
--status-idle: #a1a1a1;
--status-offline: #52525b;
--status-error: #ff006e;

/* Colores de Severidad */
--severity-critical: #ff006e;
--severity-high: #ff4444;
--severity-medium: #ffaa00;
--severity-low: #00d4ff;

/* Colores de Score */
--score-excellent: #39ff14;
--score-good: #00ff88;
--score-average: #ffaa00;
--score-poor: #ff4444;
--score-critical: #ff006e;
```

### Accesibilidad

- WCAG 2.1 AA compliance
- Contraste minimo 4.5:1
- Navegacion por teclado
- Labels ARIA apropiados
- Focus visible en elementos interactivos

---

## Roadmap de Implementacion

### Fase 1: Fundamentos (Semana 1-2)
**Entregables:**
- [ ] Estructura de navegacion con 5 tabs
- [ ] Tipos TypeScript para todas las entidades
- [ ] Mock data para pruebas
- [ ] SystemHealthBar component
- [ ] Layout base del Overview

### Fase 2: Overview Tab (Semana 3-4)
**Entregables:**
- [ ] KPI Grid con metricas del sistema
- [ ] Agent Status Grid (9 agentes)
- [ ] Activity Timeline
- [ ] System Performance Chart
- [ ] Integracion con datos mock

### Fase 3: Task Queue (Semana 5-6)
**Entregables:**
- [ ] TaskBoard Kanban con drag & drop
- [ ] TaskCard component
- [ ] TaskModal para CRUD
- [ ] Filtros y busqueda
- [ ] Persistencia de estado

### Fase 4: Logs & Details (Semana 7-8)
**Entregables:**
- [ ] LogTable virtualizada
- [ ] Filtros de logs
- [ ] Agent Details page
- [ ] SubAgent Grid
- [ ] Performance charts por agente

### Fase 5: Orchestration (Semana 9-10)
**Entregables:**
- [ ] Agent Graph interactivo
- [ ] Quick Actions panel
- [ ] Agent Messenger
- [ ] Message Feed
- [ ] Report Generator

---

## Apendice: Mock Data Specifications

### Cantidad de Datos Mock

| Entidad | Cantidad | Rango Temporal |
|---------|----------|----------------|
| Tasks | 50-100 | Ultimos 7 dias |
| LogEntries | 1000+ | Ultimos 24h |
| Alerts | 10-20 | Ultimos 7 dias |
| AgentMessages | 100+ | Ultimos 24h |
| Metrics | Por agente | 24h, 7d, 30d |

### Distribucion de Estados

**Tasks:**
- Pending: 25%
- In Progress: 15%
- Blocked: 5%
- Completed: 50%
- Failed: 5%

**Alerts:**
- Critical: 10%
- Warning: 30%
- Info: 60%

**Agent Status:**
- Active: 70%
- Busy: 15%
- Idle: 10%
- Offline: 5%

---

## Arquitectura de Datos Flexible

### Principios de Diseno de Datos

#### 1. Schema-on-Read
El sistema no impone un schema rigido. Los datos se validan al leerlos:

```typescript
// Los datos pueden llegar con cualquier estructura
interface FlexibleDataStore {
  // Almacenar sin validacion estricta
  set: (key: string, data: unknown) => Promise<void>;

  // Leer con schema opcional
  get: <T>(key: string, schema?: JSONSchema) => Promise<T | null>;

  // Query flexible
  query: (filter: QueryFilter) => Promise<unknown[]>;
}
```

#### 2. Campos Opcionales por Defecto
Todas las interfaces asumen que cualquier campo puede estar ausente:

```typescript
// Tipo helper para campos opcionales profundos
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Usar en lugar de interfaces rigidas
type FlexibleAgent = DeepPartial<AgentDefinition> & { id: string };
```

#### 3. Extensibilidad via Metadata
Cualquier entidad puede tener campos adicionales:

```typescript
interface ExtensibleEntity {
  // Campos conocidos
  id: string;
  type: string;

  // Campos dinamicos del bot
  [key: string]: unknown;

  // Metadata estructurada
  _meta?: {
    source: string;
    version: number;
    tags: string[];
    custom: Record<string, unknown>;
  };
}
```

### Data Layer Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      UI Components                           │
│  (Consumen datos via hooks, manejan estados vacios)         │
├─────────────────────────────────────────────────────────────┤
│                      Data Hooks                              │
│  useAgents(), useTasks(), useLogs(), useMetrics()           │
│  (Normalizan y validan datos)                               │
├─────────────────────────────────────────────────────────────┤
│                    Data Service Layer                        │
│  agentService, taskService, logService, metricsService      │
│  (Abstrae origen de datos: API, WebSocket, Cache)           │
├─────────────────────────────────────────────────────────────┤
│                     Data Adapters                            │
│  (Transforman datos del bot a formato interno)              │
├─────────────────────────────────────────────────────────────┤
│                    External Sources                          │
│  Bot API | WebSocket | REST API | Local Storage             │
└─────────────────────────────────────────────────────────────┘
```

### Adaptadores de Datos

```typescript
// Adaptador que transforma datos del bot a formato UI
interface DataAdapter<TInput, TOutput> {
  // Transformar entrada a salida
  transform: (input: TInput) => TOutput;

  // Validar entrada
  validate: (input: unknown) => input is TInput;

  // Valores por defecto
  defaults: Partial<TOutput>;

  // Manejo de errores
  onError: (error: Error, input: unknown) => TOutput | null;
}

// Ejemplo: Adaptador de agentes
const agentAdapter: DataAdapter<BotAgentData, UIAgentData> = {
  transform: (input) => ({
    id: input.id,
    name: input.name ?? input.id,
    icon: input.icon ?? '🤖',
    status: normalizeStatus(input.status),
    subAgents: (input.subAgents ?? []).map(subAgentAdapter.transform),
    metrics: transformMetrics(input.metrics ?? {}),
    lastSeen: input.lastActivity ?? Date.now(),
  }),

  validate: (input): input is BotAgentData => {
    return typeof input === 'object' && input !== null && 'id' in input;
  },

  defaults: {
    status: 'unknown',
    subAgents: [],
    metrics: {},
  },

  onError: (error, input) => {
    console.warn('Agent adapter error:', error, input);
    return null;
  },
};
```

### Hooks Resilientes

```typescript
// Hook que maneja datos variables del bot
function useFlexibleData<T>(
  fetcher: () => Promise<T>,
  options: {
    defaultValue: T;
    validate?: (data: unknown) => data is T;
    transform?: (data: unknown) => T;
    refetchInterval?: number;
    onError?: (error: Error) => void;
  }
) {
  const [data, setData] = useState<T>(options.defaultValue);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Logica de fetching con validacion y transformacion
  // ...

  return {
    data,
    loading,
    error,
    isEmpty: isEmptyData(data),
    refetch: () => { /* ... */ },
  };
}

// Uso
const { data: agents, loading, isEmpty } = useFlexibleData(
  () => agentService.getAll(),
  {
    defaultValue: [],
    validate: Array.isArray,
    transform: (data) => (data as unknown[]).map(agentAdapter.transform),
  }
);
```

### Componentes con Empty States

```typescript
// Wrapper para manejo de estados
interface DataContainerProps<T> {
  data: T | null | undefined;
  loading?: boolean;
  error?: Error | null;
  children: (data: T) => React.ReactNode;
  loadingComponent?: React.ReactNode;
  errorComponent?: React.ReactNode;
  emptyComponent?: React.ReactNode;
  isEmpty?: (data: T) => boolean;
}

function DataContainer<T>({
  data,
  loading,
  error,
  children,
  loadingComponent = <LoadingSpinner />,
  errorComponent = <ErrorMessage />,
  emptyComponent = <EmptyState />,
  isEmpty = (d) => !d || (Array.isArray(d) && d.length === 0),
}: DataContainerProps<T>) {
  if (loading) return loadingComponent;
  if (error) return errorComponent;
  if (!data || isEmpty(data)) return emptyComponent;
  return children(data);
}

// Uso
<DataContainer
  data={agents}
  loading={loading}
  emptyComponent={<NoAgentsRegistered />}
>
  {(agents) => <AgentGrid agents={agents} />}
</DataContainer>
```

### Configuracion por Entorno

```typescript
// La configuracion puede venir del bot
interface RuntimeConfig {
  // Features habilitadas
  features: {
    taskBoard: boolean;
    logs: boolean;
    orchestration: boolean;
    reports: boolean;
  };

  // Agentes a mostrar
  visibleAgents: string[] | 'all';

  // Metricas a trackear
  trackedMetrics: string[];

  // UI customization
  ui: {
    theme: 'dark' | 'light' | 'auto';
    density: 'compact' | 'normal' | 'comfortable';
    language: string;
  };

  // Data refresh
  refresh: {
    enabled: boolean;
    intervals: Record<string, number>;
  };
}

// Hook para acceder a config
function useRuntimeConfig() {
  const [config, setConfig] = useState<RuntimeConfig>(defaultConfig);

  // Suscripcion a cambios de config desde el bot
  useEffect(() => {
    return configService.subscribe(setConfig);
  }, []);

  return config;
}
```

### Migracion de Datos

```typescript
// Para manejar cambios en el schema de datos del bot
interface DataMigration {
  version: number;
  up: (data: unknown) => unknown;
  down: (data: unknown) => unknown;
}

const migrations: DataMigration[] = [
  {
    version: 1,
    up: (data) => ({ ...data, _version: 1 }),
    down: (data) => { const { _version, ...rest } = data; return rest; },
  },
  {
    version: 2,
    up: (data) => ({
      ...data,
      agents: data.agents?.map(normalizeAgent),
      _version: 2,
    }),
    down: (data) => ({ ...data, _version: 1 }),
  },
];

function migrateData(data: unknown, targetVersion: number): unknown {
  const currentVersion = (data as any)?._version ?? 0;
  let result = data;

  for (let v = currentVersion; v < targetVersion; v++) {
    const migration = migrations.find(m => m.version === v + 1);
    if (migration) result = migration.up(result);
  }

  return result;
}
```

---

## Checklist de Flexibilidad

Antes de implementar cualquier componente, verificar:

- [ ] **Datos vacios**: ¿El componente renderiza correctamente sin datos?
- [ ] **Datos parciales**: ¿Funciona si faltan algunos campos?
- [ ] **Datos extra**: ¿Ignora campos desconocidos sin errores?
- [ ] **Tipos variables**: ¿Maneja diferentes tipos de datos para un campo?
- [ ] **Cantidad variable**: ¿Funciona con 0, 1, o N elementos?
- [ ] **Configuracion dinamica**: ¿Puede reconfigurarse en runtime?
- [ ] **Errores de API**: ¿Maneja errores de red gracefully?
- [ ] **Loading states**: ¿Muestra indicadores de carga apropiados?
- [ ] **Refresh**: ¿Se actualiza cuando cambian los datos?
- [ ] **Performance**: ¿Escala bien con grandes cantidades de datos?

---

*Documento generado: 2024-03-07*
*Version: 2.0*
*Autor: Equipo PASCUAL*
*Contexto: Aplicacion administrada por bot con datos dinamicos*
