# Mando de Control - Documento de Requerimientos

## Versión: 1.0.0
## Fecha: 2025-03-06

---

## 1. Resumen Ejecutivo

### 1.1 Visión del Mando de Control

El **Mando de Control** es el centro de operaciones unificado del ecosistema PASCUAL. Proporciona visibilidad completa sobre los 9 agentes principales y sus 46 sub-agentes, permitiendo:

- **Monitoreo en tiempo real** del estado, rendimiento y actividad de todos los agentes
- **Gestión de tareas** mediante un sistema Kanban con cola de prioridades
- **Auditoría completa** de todas las ejecuciones y decisiones del sistema
- **Orquestación manual** cuando se requiera intervención humana
- **Reportes y métricas** para análisis de rendimiento y toma de decisiones

### 1.2 Alcance y Objetivos

| Objetivo | Descripción |
|----------|-------------|
| Centralización | Unificar la supervisión de todos los agentes en una sola interfaz |
| Transparencia | Hacer visible cada acción, decisión y resultado del sistema |
| Control | Permitir intervención manual cuando sea necesario |
| Análisis | Proporcionar métricas accionables para optimización continua |
| Escalabilidad | Soportar crecimiento futuro de agentes y funcionalidades |

---

## 2. Arquitectura del Ecosistema PASCUAL

### 2.1 Mapa de Agentes

```
                              ┌─────────────────┐
                              │    PASCUAL      │
                              │  Orquestador    │
                              │    Central      │
                              └────────┬────────┘
                                       │
        ┌──────────┬──────────┬───────┴───────┬──────────┬──────────┐
        │          │          │               │          │          │
   ┌────┴────┐ ┌───┴───┐ ┌────┴────┐    ┌────┴────┐ ┌───┴───┐ ┌────┴────┐
   │ASISTENTE│ │ NEXUS │ │SENTINEL │    │  SCOUT  │ │AUDIO- │ │CONSULTOR│
   │   (3)   │ │  (8)  │ │   (5)   │    │   (5)   │ │VISUAL │ │   (5)   │
   └─────────┘ └───────┘ └─────────┘    └─────────┘ │  (5)  │ └─────────┘
                                                    └───────┘
        ┌──────────────────────────┬───────────────────────────┐
        │                          │                           │
   ┌────┴────┐               ┌─────┴─────┐              ┌──────┴──────┐
   │ GAMBITO │               │ CÓNDOR360 │              │   OPTIMUS   │
   │   (5)   │               │    (5)    │              │     (5)     │
   └─────────┘               └───────────┘              └─────────────┘
```

### 2.2 Resumen de Agentes y Sub-Agentes

| # | Agente | Rol Principal | Sub-Agentes | Total |
|---|--------|---------------|-------------|-------|
| 1 | Asistente | Gestión Personal | 3 | 3 |
| 2 | Nexus | Desarrollo Software | 8 | 8 |
| 3 | Sentinel | Seguridad Sistema | 5 | 5 |
| 4 | Scout | Búsqueda de Datos | 5 | 5 |
| 5 | Audiovisual | Multimedia | 5 | 5 |
| 6 | Consultor | Conocimiento Experto | 5 | 5 |
| 7 | Gambito | Predicción Deportiva | 5 | 5 |
| 8 | Cóndor360 | Inteligencia Financiera | 5 | 5 |
| 9 | Optimus | Interfaces UX | 5 | 5 |
| **Total** | | | **46** | **46** |

### 2.3 Flujos de Comunicación Inter-Agentes

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      CANALES DE COMUNICACIÓN                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ASISTENTE ◄──────────► CONSULTOR (asesoramiento personal)              │
│      │                                                                  │
│      └────────────────► SCOUT (búsqueda de información)                 │
│                                                                         │
│  NEXUS ◄──────────────► SENTINEL (seguridad del código)                 │
│      │                                                                  │
│      └────────────────► OPTIMUS (interfaces de usuario)                 │
│                                                                         │
│  GAMBITO ◄────────────► CÓNDOR360 (análisis financiero cruzado)         │
│      │                                                                  │
│      └────────────────► SCOUT (datos deportivos)                        │
│                                                                         │
│  AUDIOVISUAL ◄────────► OPTIMUS (recursos visuales)                     │
│      │                                                                  │
│      └────────────────► SCOUT (fuentes multimedia)                      │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Definición de Agentes

### 3.1 ASISTENTE - Gestor Personal Inteligente

**Propósito:** Orquestación de sistemas para gestión personal inteligente.

#### Sub-Agentes

| ID | Nombre | Descripción | Modelo Recomendado |
|----|--------|-------------|-------------------|
| 1.1.1 | **Chronos** | Sistema de Gestión de Tiempo y Tareas. Maneja calendarios, recordatorios, priorización de tareas y seguimiento de objetivos. | Claude Sonnet |
| 1.1.2 | **Proactive** | Sistema de Anticipación Proactiva. Predice necesidades, sugiere acciones y automatiza rutinas basándose en patrones de comportamiento. | Claude Haiku |
| 1.1.3 | **Domus** | Sistema de Gestión Doméstica. Controla inventarios del hogar, mantenimiento, compras y gestión de servicios domésticos. | Claude Haiku |

#### Métricas Específicas
- Tareas completadas vs planificadas
- Precisión de predicciones proactivas
- Tiempo de respuesta promedio
- Satisfacción del usuario (feedback)

---

### 3.2 NEXUS - Director de Desarrollo de Software

**Propósito:** Dirección estratégica del desarrollo técnico, arquitectura de sistemas e integración de modelos de IA.

#### Sub-Agentes

| ID | Nombre | Descripción | Modelo Recomendado |
|----|--------|-------------|-------------------|
| 1.2.1 | **Explorer** | Analista de Código. Explora y analiza bases de código existentes, identifica patrones y dependencias. | Claude Sonnet |
| 1.2.2 | **Proposer** | Estratega Técnico. Propone soluciones arquitectónicas y estrategias de implementación. | Claude Opus |
| 1.2.3 | **Spec Writer** | Especificador. Genera especificaciones técnicas detalladas y documentación. | Claude Sonnet |
| 1.2.4 | **Designer** | Arquitecto. Diseña arquitecturas de sistemas y componentes. | Claude Opus |
| 1.2.5 | **Task Planner** | Planificador. Descompone proyectos en tareas manejables y crea roadmaps. | Claude Sonnet |
| 1.2.6 | **Implementador** | Desarrollador. Escribe código de producción siguiendo especificaciones. | Claude Sonnet |
| 1.2.7 | **Verificador QA** | Control de Calidad. Ejecuta pruebas, valida funcionalidad y reporta bugs. | Claude Haiku |
| 1.2.8 | **Auditor** | Evaluador Técnico. Revisa código, evalúa calidad y sugiere mejoras. | Claude Sonnet |

#### Métricas Específicas
- Líneas de código generadas/modificadas
- Cobertura de tests (%)
- Bugs detectados vs bugs en producción
- Tiempo de ciclo (commit to deploy)
- Deuda técnica acumulada

---

### 3.3 SENTINEL - Guardián de Seguridad y Estabilidad

**Propósito:** Protección integral de la seguridad, estabilidad y rendimiento del ecosistema.

#### Sub-Agentes

| ID | Nombre | Descripción | Modelo Recomendado |
|----|--------|-------------|-------------------|
| 1.3.1 | **Cipher** | Director de Seguridad Digital. Gestiona encriptación, autenticación y políticas de seguridad. | Claude Opus |
| 1.3.2 | **Monitor** | Supervisor de Rendimiento. Monitorea métricas del sistema, detecta anomalías y genera alertas. | Claude Haiku |
| 1.3.3 | **Guardian** | Responsable de Resiliencia. Gestiona backups, recuperación ante desastres y continuidad. | Claude Sonnet |
| 1.3.4 | **Warden** | Gestor de Acceso. Controla permisos, roles y cumplimiento de políticas. | Claude Sonnet |
| 1.3.5 | **Custodian** | Administrador de Recursos. Optimiza uso de recursos, gestiona costos y eficiencia. | Claude Haiku |

#### Métricas Específicas
- Amenazas detectadas/bloqueadas
- Tiempo de respuesta a incidentes
- Uptime del sistema (%)
- Score de seguridad (0-100)
- Intentos de acceso no autorizado

---

### 3.4 SCOUT - Maestro en Búsqueda e Ingesta de Datos

**Propósito:** Búsqueda, ingesta, extracción y síntesis de información de cualquier fuente.

#### Sub-Agentes

| ID | Nombre | Descripción | Modelo Recomendado |
|----|--------|-------------|-------------------|
| 1.4.1 | **Hunter** | Especialista en Búsqueda. Ejecuta búsquedas avanzadas en múltiples fuentes y APIs. | Claude Sonnet |
| 1.4.2 | **Harvester** | Experto en Extracción. Extrae y estructura datos de fuentes no estructuradas. | Claude Haiku |
| 1.4.3 | **Curator** | Gestor de Calidad. Verifica, valida y limpia datos recolectados. | Claude Haiku |
| 1.4.4 | **Synthesizer** | Procesador de Información. Sintetiza y resume grandes volúmenes de datos. | Claude Sonnet |
| 1.4.5 | **Satelite** | Vigilante de Tendencias. Monitorea actualizaciones y tendencias en tiempo real. | Claude Haiku |

#### Métricas Específicas
- Búsquedas realizadas (diarias)
- Fuentes activas monitoreadas
- Tasa de éxito de extracción (%)
- Volumen de datos procesados (GB)
- Latencia promedio de búsqueda

---

### 3.5 AUDIOVISUAL - Orquestador Multimedia Integral

**Propósito:** Creación y gestión centralizada de todos los recursos audiovisuales.

#### Sub-Agentes

| ID | Nombre | Descripción | Modelo Recomendado |
|----|--------|-------------|-------------------|
| 1.5.1 | **Imagen** | Especialista Visual. Crea, edita y optimiza imágenes y gráficos. | DALL-E 3 / Midjourney |
| 1.5.2 | **Video** | Productor Videográfico. Produce, edita y procesa contenido de video. | Runway / Sora |
| 1.5.3 | **Audio** | Especialista Sonoro. Genera audio, música, efectos y síntesis de voz. | ElevenLabs / Suno |
| 1.5.4 | **Texto** | Experto en Narrativa. Crea contenido textual, guiones y copywriting. | Claude Opus |
| 1.5.5 | **Bibliotecario** | Gestor de Recursos. Organiza, cataloga y versiona assets multimedia. | Claude Haiku |

#### Métricas Específicas
- Assets generados (por tipo)
- Almacenamiento utilizado (GB)
- Tiempo de generación promedio
- Tasa de reutilización de assets
- Calidad promedio (score interno)

---

### 3.6 CONSULTOR - Orquestador Multidisciplinario de Conocimiento

**Propósito:** Coordinación de equipos de expertos especializados para consultas multidisciplinarias.

#### Sub-Agentes

| ID | Nombre | Descripción | Modelo Recomendado |
|----|--------|-------------|-------------------|
| 1.6.1 | **Financiero** | Asesor Económico. Planificación financiera personal, inversiones y presupuestos. | Claude Opus |
| 1.6.2 | **Crianza** | Experto en Desarrollo Infantil. Orientación en crianza, educación y desarrollo familiar. | Claude Sonnet |
| 1.6.3 | **Emprendimiento** | Especialista en Negocios. Asesoría en startups, modelos de negocio y growth. | Claude Opus |
| 1.6.4 | **Carrera** | Experto en Desarrollo Profesional. Orientación de carrera, habilidades y networking. | Claude Sonnet |
| 1.6.5 | **Bienestar** | Especialista en Salud Integral. Wellness, nutrición, ejercicio y salud mental. | Claude Sonnet |

#### Métricas Específicas
- Consultas atendidas (por área)
- Satisfacción del usuario (rating)
- Planes/recomendaciones generados
- Tasa de seguimiento de consejos
- Tiempo de respuesta por consulta

---

### 3.7 GAMBITO - Estratega de Apuestas Deportivas

**Propósito:** Análisis cuantitativo y refinamiento continuo de modelos predictivos para apuestas deportivas con valor esperado positivo.

#### Sub-Agentes

| ID | Nombre | Descripción | Modelo Recomendado |
|----|--------|-------------|-------------------|
| 1.7.1 | **Analyst** | Modelador Estadístico. Desarrolla modelos Poisson, Dixon-Coles, ELO dinámico. | Claude Opus |
| 1.7.2 | **Evaluator** | Validador de Modelos. Ejecuta backtesting y validación de predicciones. | Claude Sonnet |
| 1.7.3 | **Optimizer** | Ajustador de Modelos. Optimiza parámetros y calibra modelos continuamente. | Claude Sonnet |
| 1.7.4 | **Manager** | Gestor de Capital. Aplica Kelly fraccionario y gestiona bankroll. | Claude Opus |
| 1.7.5 | **Monitor** | Seguimiento de Resultados. Trackea apuestas, ROI y performance histórico. | Claude Haiku |

#### Métricas Específicas
- ROI acumulado (%)
- Win rate por mercado (%)
- Valor esperado promedio (EV)
- Precisión de predicciones (%)
- Bankroll actual vs inicial

#### Mercados Soportados
- Fútbol (principales ligas)
- Tenis (ATP/WTA)
- Baloncesto (NBA/Euro)
- Béisbol (MLB)
- Hockey (NHL)
- MMA (UFC)
- F1
- eSports

---

### 3.8 CÓNDOR360 - Sistema de Inteligencia Financiera

**Propósito:** Análisis exhaustivo de portafolios, detección de oportunidades de inversión y gestión estratégica de activos financieros.

#### Sub-Agentes

| ID | Nombre | Descripción | Modelo Recomendado |
|----|--------|-------------|-------------------|
| 1.8.1 | **Cuantificador** | Analista Numérico. Análisis técnico, indicadores y patrones de mercado. | Claude Opus |
| 1.8.2 | **Fundamental** | Evaluador Empresarial. Análisis fundamental, ratios y valuación de empresas. | Claude Opus |
| 1.8.3 | **Estratega** | Optimizador de Portafolios. Construcción y rebalanceo de portafolios. | Claude Opus |
| 1.8.4 | **Newswire** | Analista de Noticias. Procesamiento de noticias financieras en tiempo real. | Claude Sonnet |
| 1.8.5 | **Simulador** | Validador de Estrategias. Backtesting y simulación Monte Carlo. | Claude Sonnet |

#### Métricas Específicas
- Retorno del portafolio (%)
- Sharpe ratio
- Max drawdown (%)
- Señales generadas (por convicción)
- Accuracy de predicciones de mercado

#### Niveles de Convicción
| Nivel | Rango | Descripción |
|-------|-------|-------------|
| Alta | >85% | Señal fuerte, alta confianza |
| Media | 65-85% | Señal moderada, considerar |
| Baja | <65% | Señal débil, precaución |

---

### 3.9 OPTIMUS - Sistema de Interfaces y Experiencia de Usuario

**Propósito:** Diseño, desarrollo y gestión de interfaces visuales centralizadas con enfoque en experiencia de usuario.

#### Sub-Agentes

| ID | Nombre | Descripción | Modelo Recomendado |
|----|--------|-------------|-------------------|
| 1.9.1 | **Designer** | Especialista UX/UI. Diseña interfaces, wireframes y sistemas de diseño. | Claude Opus |
| 1.9.2 | **Integrator** | Experto en APIs. Conecta interfaces con fuentes de datos y servicios. | Claude Sonnet |
| 1.9.3 | **Innovator** | Prototipador. Explora nuevas interacciones y tecnologías emergentes. | Claude Sonnet |
| 1.9.4 | **Communicator** | Visualizador de Datos. Crea dashboards y visualizaciones narrativas. | Claude Sonnet |
| 1.9.5 | **Conservator** | Gestor de Componentes. Mantiene librería de componentes y versionado. | Claude Haiku |

#### Métricas Específicas
- Componentes en librería (count)
- Cobertura de accesibilidad (%)
- Performance score (Lighthouse)
- Tiempo de carga promedio (ms)
- Bugs de UI reportados/resueltos

---

## 4. Estructura de Pestañas del Dashboard

### 4.1 Arquitectura de Navegación

```
┌─────────────────────────────────────────────────────────────────────────┐
│  MANDO DE CONTROL                                                       │
├──────────┬──────────┬───────────────┬──────────────┬───────────────────┤
│ Overview │ Task     │ Execution     │ Agent        │ Orchestration     │
│          │ Queue    │ Logs          │ Details      │                   │
└──────────┴──────────┴───────────────┴──────────────┴───────────────────┘
```

---

### 4.2 Tab: Overview

**Propósito:** Vista ejecutiva de la salud del sistema y KPIs principales.

#### Layout

```
┌─────────────────────────────────────────────────────────────────────────┐
│ SYSTEM HEALTH BAR                                                  [■■■]│
├─────────────────────────────────────────────────────────────────────────┤
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐        │
│ │ Active      │ │ Pending     │ │ Success     │ │ System      │        │
│ │ Agents      │ │ Tasks       │ │ Rate        │ │ Load        │        │
│ │    7/9      │ │    23       │ │   94.2%     │ │   67%       │        │
│ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘        │
├─────────────────────────────────────────────────────────────────────────┤
│ ┌────────────────────────────────┐ ┌──────────────────────────────────┐│
│ │ AGENT STATUS GRID              │ │ ACTIVITY TIMELINE                ││
│ │ ┌─────┐ ┌─────┐ ┌─────┐       │ │                                  ││
│ │ │ ASI │ │ NEX │ │ SEN │       │ │  ──●──●────●─────●──●──►         ││
│ │ │  ●  │ │  ●  │ │  ●  │       │ │                                  ││
│ │ └─────┘ └─────┘ └─────┘       │ │                                  ││
│ │ ┌─────┐ ┌─────┐ ┌─────┐       │ │                                  ││
│ │ │ SCO │ │ AUD │ │ CON │       │ │                                  ││
│ │ │  ●  │ │  ○  │ │  ●  │       │ │                                  ││
│ │ └─────┘ └─────┘ └─────┘       │ │                                  ││
│ │ ┌─────┐ ┌─────┐ ┌─────┐       │ │                                  ││
│ │ │ GAM │ │ CON │ │ OPT │       │ │                                  ││
│ │ │  ●  │ │  ●  │ │  ●  │       │ │                                  ││
│ │ └─────┘ └─────┘ └─────┘       │ └──────────────────────────────────┘│
│ └────────────────────────────────┘                                     │
├─────────────────────────────────────────────────────────────────────────┤
│ ┌────────────────────────────────┐ ┌──────────────────────────────────┐│
│ │ RECENT ALERTS                  │ │ QUICK STATS                      ││
│ │ ⚠ Sentinel: High CPU usage     │ │ Tasks Today: 127                 ││
│ │ ● Nexus: Deploy completed      │ │ Avg Response: 1.2s               ││
│ │ ⚠ Scout: API rate limited      │ │ Errors: 3                        ││
│ └────────────────────────────────┘ └──────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────┘
```

#### Componentes Requeridos
- `SystemHealthBar` (nuevo)
- `StatCard` (existente)
- `AgentStatusGrid` (nuevo, basado en AgentCard)
- `LineChart` (existente)
- `AlertPanel` (nuevo)
- `ActivityFeed` (existente, compact mode)

---

### 4.3 Tab: Task Queue

**Propósito:** Gestión visual de la cola de tareas con vista Kanban.

#### Layout

```
┌─────────────────────────────────────────────────────────────────────────┐
│ FILTERS: [All Agents ▼] [All Priorities ▼] [Search...]     [+ New Task]│
├─────────────────────────────────────────────────────────────────────────┤
│ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ ┌─────────┐│
│ │ QUEUED (12)     │ │ IN PROGRESS (5) │ │ REVIEW (3)      │ │DONE (45)││
│ ├─────────────────┤ ├─────────────────┤ ├─────────────────┤ ├─────────┤│
│ │ ┌─────────────┐ │ │ ┌─────────────┐ │ │ ┌─────────────┐ │ │ ┌─────┐ ││
│ │ │ Task #234   │ │ │ │ Task #231   │ │ │ │ Task #228   │ │ │ │#225 │ ││
│ │ │ Nexus       │ │ │ │ Scout       │ │ │ │ Sentinel    │ │ │ │ ✓   │ ││
│ │ │ ● High      │ │ │ │ ○ Medium    │ │ │ │ ○ Low       │ │ │ └─────┘ ││
│ │ └─────────────┘ │ │ └─────────────┘ │ │ └─────────────┘ │ │ ┌─────┐ ││
│ │ ┌─────────────┐ │ │ ┌─────────────┐ │ │ ┌─────────────┐ │ │ │#224 │ ││
│ │ │ Task #235   │ │ │ │ Task #232   │ │ │ │ Task #229   │ │ │ │ ✓   │ ││
│ │ │ Gambito     │ │ │ │ Cóndor360   │ │ │ │ Audiovisual │ │ │ └─────┘ ││
│ │ │ ○ Medium    │ │ │ │ ● High      │ │ │ │ ○ Medium    │ │ │         ││
│ │ └─────────────┘ │ │ └─────────────┘ │ │ └─────────────┘ │ │         ││
│ │       ...       │ │       ...       │ │                 │ │   ...   ││
│ └─────────────────┘ └─────────────────┘ └─────────────────┘ └─────────┘│
└─────────────────────────────────────────────────────────────────────────┘
```

#### Componentes Requeridos
- `TaskQueue` (nuevo) - Contenedor Kanban
- `TaskCard` (nuevo) - Card de tarea individual
- `TaskFilters` (nuevo) - Barra de filtros
- `Select` (existente)
- `Input` (existente)
- `Button` (existente)
- `Badge` (existente)

---

### 4.4 Tab: Execution Logs

**Propósito:** Registro de auditoría de todas las ejecuciones del sistema.

#### Layout

```
┌─────────────────────────────────────────────────────────────────────────┐
│ FILTERS: [Date Range] [Agent ▼] [Status ▼] [Type ▼]    [Export] [Clear]│
├─────────────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ TIMESTAMP      │ AGENT    │ ACTION           │ STATUS  │ DURATION  │ │
│ ├─────────────────────────────────────────────────────────────────────┤ │
│ │ 2025-03-06     │ Nexus    │ Code Review      │ ✓ Done  │ 2.3s      │ │
│ │ 14:32:15       │ Explorer │ PR #456          │         │           │ │
│ ├─────────────────────────────────────────────────────────────────────┤ │
│ │ 2025-03-06     │ Sentinel │ Security Scan    │ ⚠ Warn  │ 45.2s     │ │
│ │ 14:31:02       │ Cipher   │ Full system      │         │           │ │
│ ├─────────────────────────────────────────────────────────────────────┤ │
│ │ 2025-03-06     │ Scout    │ Data Fetch       │ ✓ Done  │ 1.1s      │ │
│ │ 14:30:45       │ Hunter   │ API: NewsAPI     │         │           │ │
│ ├─────────────────────────────────────────────────────────────────────┤ │
│ │ 2025-03-06     │ Gambito  │ Model Update     │ ✓ Done  │ 12.8s     │ │
│ │ 14:28:33       │ Optimizer│ Poisson recalib  │         │           │ │
│ ├─────────────────────────────────────────────────────────────────────┤ │
│ │ 2025-03-06     │ Cóndor   │ Portfolio Sync   │ ✗ Error │ 0.5s      │ │
│ │ 14:25:10       │ Integrator│ Timeout         │         │           │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────┤
│ Showing 1-50 of 1,247 entries                    [◄] [1] [2] [3] [►]   │
└─────────────────────────────────────────────────────────────────────────┘
```

#### Componentes Requeridos
- `ExecutionLog` (nuevo) - Tabla de logs
- `LogEntry` (nuevo) - Fila de log expandible
- `LogFilters` (nuevo) - Filtros especializados
- `Pagination` (nuevo)
- `Badge` (existente) - Status badges
- `Button` (existente) - Export, Clear

---

### 4.5 Tab: Agent Details

**Propósito:** Vista detallada de métricas y estado por agente individual.

#### Layout

```
┌─────────────────────────────────────────────────────────────────────────┐
│ SELECT AGENT: [Nexus ▼]                           [Refresh] [Settings] │
├─────────────────────────────────────────────────────────────────────────┤
│ ┌───────────────────────────────────┐ ┌───────────────────────────────┐ │
│ │ AGENT OVERVIEW                    │ │ PERFORMANCE CHART             │ │
│ │ ┌─────┐                           │ │                               │ │
│ │ │ 🔧  │  NEXUS                    │ │    100% ┤    ╭─╮              │ │
│ │ │     │  Director de Desarrollo   │ │     75% ┤   ╭╯ ╰╮  ╭╮        │ │
│ │ └─────┘  Status: ● Active         │ │     50% ┤  ╭╯    ╰──╯╰╮      │ │
│ │          Model: Claude Opus       │ │     25% ┤ ╭╯           ╰──   │ │
│ │          Uptime: 99.8%            │ │      0% ┼─────────────────►  │ │
│ │                                   │ │         Mon Tue Wed Thu Fri  │ │
│ └───────────────────────────────────┘ └───────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────┤
│ SUB-AGENTS                                                              │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│ │ Explorer │ │ Proposer │ │ Spec     │ │ Designer │ │ Task     │       │
│ │ ● Active │ │ ○ Idle   │ │ Writer   │ │ ● Active │ │ Planner  │       │
│ │ Tasks: 3 │ │ Tasks: 0 │ │ ● Active │ │ Tasks: 2 │ │ ○ Idle   │       │
│ └──────────┘ └──────────┘ │ Tasks: 1 │ └──────────┘ │ Tasks: 0 │       │
│                          └──────────┘              └──────────┘       │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐                                 │
│ │Implement │ │Verificad │ │ Auditor  │                                 │
│ │ ● Busy   │ │ ○ Idle   │ │ ○ Idle   │                                 │
│ │ Tasks: 5 │ │ Tasks: 0 │ │ Tasks: 0 │                                 │
│ └──────────┘ └──────────┘ └──────────┘                                 │
├─────────────────────────────────────────────────────────────────────────┤
│ ┌────────────────────────────────┐ ┌──────────────────────────────────┐ │
│ │ AGENT-SPECIFIC METRICS         │ │ RECENT ACTIVITY                  │ │
│ │                                │ │                                  │ │
│ │ Lines of Code: 12,456          │ │ • PR #456 merged       2m ago   │ │
│ │ Test Coverage: 87%             │ │ • Tests passed         5m ago   │ │
│ │ Bugs Fixed: 23                 │ │ • Code review done    12m ago   │ │
│ │ Cycle Time: 4.2h               │ │ • Feature deployed    1h ago    │ │
│ │ Technical Debt: Low            │ │ • Sprint planning     2h ago    │ │
│ └────────────────────────────────┘ └──────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

#### Componentes Requeridos
- `AgentDetailView` (nuevo) - Vista completa del agente
- `AgentCard` (existente, modo expandido)
- `SubAgentGrid` (nuevo)
- `LineChart` (existente)
- `ActivityFeed` (existente)
- `StatCard` (existente)
- `Select` (existente)

---

### 4.6 Tab: Orchestration

**Propósito:** Control manual de agentes y comunicación inter-agentes.

#### Layout

```
┌─────────────────────────────────────────────────────────────────────────┐
│ ORCHESTRATION CONTROLS                                                  │
├─────────────────────────────────────────────────────────────────────────┤
│ ┌───────────────────────────────────┐ ┌───────────────────────────────┐ │
│ │ QUICK ACTIONS                     │ │ AGENT COMMUNICATION           │ │
│ │                                   │ │                               │ │
│ │ [▶ Start All] [⏸ Pause All]      │ │ From: [Pascual      ▼]        │ │
│ │ [🔄 Restart System]               │ │ To:   [All Agents   ▼]        │ │
│ │ [📊 Generate Report]              │ │                               │ │
│ │                                   │ │ ┌───────────────────────────┐ │ │
│ │ INDIVIDUAL CONTROLS               │ │ │ Enter message...          │ │ │
│ │ ┌─────────────────────────────┐   │ │ │                           │ │ │
│ │ │ Agent      │ Status │Action │   │ │ └───────────────────────────┘ │ │
│ │ │ Asistente  │ ● On   │[⏸][🔄]│   │ │ [Send Directive]              │ │
│ │ │ Nexus      │ ● On   │[⏸][🔄]│   │ │                               │ │
│ │ │ Sentinel   │ ● On   │[⏸][🔄]│   │ │ RECENT MESSAGES               │ │
│ │ │ Scout      │ ○ Off  │[▶][🔄]│   │ │ ┌───────────────────────────┐ │ │
│ │ │ Audiovisual│ ○ Off  │[▶][🔄]│   │ │ │ Pascual → Nexus           │ │ │
│ │ │ Consultor  │ ● On   │[⏸][🔄]│   │ │ │ "Priority: Deploy hotfix" │ │ │
│ │ │ Gambito    │ ● On   │[⏸][🔄]│   │ │ │ 2m ago                    │ │ │
│ │ │ Cóndor360  │ ● On   │[⏸][🔄]│   │ │ └───────────────────────────┘ │ │
│ │ │ Optimus    │ ● On   │[⏸][🔄]│   │ │ ┌───────────────────────────┐ │ │
│ │ └─────────────────────────────┘   │ │ │ Sentinel → Pascual        │ │ │
│ │                                   │ │ │ "Alert: Unusual activity" │ │ │
│ │ SYSTEM RESOURCES                  │ │ │ 15m ago                   │ │ │
│ │ CPU: [████████░░] 78%             │ │ └───────────────────────────┘ │ │
│ │ RAM: [██████░░░░] 62%             │ │                               │ │
│ │ GPU: [████░░░░░░] 45%             │ └───────────────────────────────┘ │
│ └───────────────────────────────────┘                                   │
├─────────────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ WORKFLOW VISUALIZATION                                              │ │
│ │                                                                     │ │
│ │   [PASCUAL] ──┬──► [NEXUS] ──────► [SENTINEL]                       │ │
│ │              │                         │                            │ │
│ │              ├──► [SCOUT] ◄────────────┤                            │ │
│ │              │        │                                             │ │
│ │              │        ▼                                             │ │
│ │              └──► [GAMBITO] ◄──► [CÓNDOR360]                        │ │
│ │                                                                     │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

#### Componentes Requeridos
- `OrchestrationControls` (nuevo)
- `AgentControlRow` (nuevo)
- `AgentCommunication` (nuevo)
- `MessageComposer` (nuevo)
- `MessageList` (nuevo)
- `WorkflowVisualization` (nuevo)
- `ResourceBar` (nuevo)
- `Button` (existente)
- `Select` (existente)
- `Textarea` (existente)

---

## 5. Componentes UI

### 5.1 Componentes Reutilizables (Existentes)

| Componente | Ubicación | Props Principales |
|------------|-----------|-------------------|
| `Card` | `/ui/Card.tsx` | variant, glow, className |
| `CardHeader` | `/ui/Card.tsx` | children |
| `CardBody` | `/ui/Card.tsx` | children |
| `CardFooter` | `/ui/Card.tsx` | children |
| `StatCard` | `/ui/Card.tsx` | title, value, trend, icon, variant |
| `Badge` | `/ui/Badge.tsx` | variant, pulse, className |
| `StatusBadge` | `/ui/Badge.tsx` | status, showDot |
| `Button` | `/ui/Button.tsx` | variant, size, loading, fullWidth |
| `IconButton` | `/ui/Button.tsx` | children, onClick |
| `Input` | `/ui/Input.tsx` | label, error, placeholder |
| `Textarea` | `/ui/Textarea.tsx` | label, error, rows |
| `Select` | `/ui/Select.tsx` | label, options, compact |
| `Tooltip` | `/ui/Tooltip.tsx` | content, position, delay |
| `LineChart` | `/charts/LineChart.tsx` | data, dataKey, color, showAxis |
| `BarChart` | `/charts/BarChart.tsx` | data, color, horizontal |
| `DonutChart` | `/charts/DonutChart.tsx` | data, centerLabel, centerValue |
| `CircularProgress` | `/charts/CircularProgress.tsx` | value, max, color, label |
| `HeatMap` | `/charts/HeatMap.tsx` | data, xLabels, yLabels |
| `AgentCard` | `/dashboard/AgentCard.tsx` | agent, onExpand |
| `ActivityFeed` | `/dashboard/ActivityFeed.tsx` | activities, maxItems |
| `Grid` | `/layout/MainContent.tsx` | cols, gap |
| `Section` | `/layout/MainContent.tsx` | children |
| `SectionHeader` | `/layout/MainContent.tsx` | title, action |
| `PageHeader` | `/layout/MainContent.tsx` | title, description, actions |

### 5.2 Componentes Nuevos Requeridos

| Componente | Propósito | Props Estimados |
|------------|-----------|-----------------|
| `SystemHealthBar` | Barra de estado general del sistema | status, metrics, alerts |
| `AgentStatusGrid` | Grid de estado de todos los agentes | agents, onSelect |
| `AlertPanel` | Panel de alertas recientes | alerts, maxItems, onDismiss |
| `TaskQueue` | Contenedor Kanban de tareas | tasks, columns, onMove |
| `TaskCard` | Card individual de tarea | task, onEdit, onMove |
| `TaskFilters` | Filtros para cola de tareas | filters, onChange |
| `ExecutionLog` | Tabla de logs de ejecución | logs, filters, pagination |
| `LogEntry` | Fila expandible de log | entry, expanded, onToggle |
| `LogFilters` | Filtros específicos para logs | filters, onChange |
| `Pagination` | Control de paginación | page, total, pageSize, onChange |
| `AgentDetailView` | Vista completa de agente | agentId, onClose |
| `SubAgentGrid` | Grid de sub-agentes | subAgents, parentAgent |
| `OrchestrationControls` | Panel de control de orquestación | agents, onAction |
| `AgentControlRow` | Fila de control individual | agent, onStart, onPause, onRestart |
| `AgentCommunication` | Panel de comunicación | messages, onSend |
| `MessageComposer` | Compositor de mensajes | from, to, onSend |
| `MessageList` | Lista de mensajes recientes | messages, maxItems |
| `WorkflowVisualization` | Visualización de flujos | agents, connections |
| `ResourceBar` | Barra de uso de recursos | label, value, max, color |
| `ReportGenerator` | Generador de reportes | agentId, dateRange, format |

---

## 6. Estructuras de Datos (TypeScript)

### 6.1 Interfaces Base

```typescript
// Tipos de estado de agente
type AgentStatus = "active" | "busy" | "offline" | "error";

// Tipos de rol de agente
type AgentRole = "personal" | "development" | "security" | "search" |
                 "multimedia" | "advisory" | "prediction" | "financial" | "ux";

// Tipos de prioridad
type Priority = "critical" | "high" | "medium" | "low";

// Tipos de severidad de alerta
type AlertSeverity = "critical" | "warning" | "info";
```

### 6.2 Interface: Task

```typescript
interface Task {
  id: string;
  title: string;
  description: string;
  agentId: string;
  subAgentId?: string;
  status: "queued" | "in_progress" | "review" | "done" | "failed";
  priority: Priority;
  createdAt: string;      // ISO timestamp
  startedAt?: string;     // ISO timestamp
  completedAt?: string;   // ISO timestamp
  estimatedDuration?: number; // milliseconds
  actualDuration?: number;    // milliseconds
  dependencies?: string[];    // Task IDs
  metadata?: Record<string, unknown>;
  result?: {
    success: boolean;
    output?: string;
    error?: string;
  };
}
```

### 6.3 Interface: LogEntry

```typescript
interface LogEntry {
  id: string;
  timestamp: string;      // ISO timestamp
  agentId: string;
  subAgentId?: string;
  action: string;
  actionType: "task" | "communication" | "system" | "error" | "security";
  status: "success" | "warning" | "error" | "pending";
  duration?: number;      // milliseconds
  input?: string;
  output?: string;
  metadata?: Record<string, unknown>;
  correlationId?: string; // Para agrupar logs relacionados
}
```

### 6.4 Interface: Alert

```typescript
interface Alert {
  id: string;
  timestamp: string;
  agentId?: string;
  severity: AlertSeverity;
  title: string;
  message: string;
  acknowledged: boolean;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  autoResolve?: boolean;
  resolveAfter?: number;  // milliseconds
  actions?: AlertAction[];
}

interface AlertAction {
  id: string;
  label: string;
  action: string;         // Identificador de acción
  destructive?: boolean;
}
```

### 6.5 Interface: AgentMessage

```typescript
interface AgentMessage {
  id: string;
  timestamp: string;
  fromAgentId: string;
  toAgentId: string | "broadcast";
  type: "directive" | "query" | "response" | "notification" | "alert";
  priority: Priority;
  subject: string;
  content: string;
  requiresResponse: boolean;
  responseDeadline?: string;  // ISO timestamp
  parentMessageId?: string;   // Para hilos de conversación
  status: "sent" | "delivered" | "read" | "responded";
}
```

### 6.6 Interface: Agent (Extendida)

```typescript
interface Agent {
  id: string;
  name: string;
  icon: string;
  description: string;
  role: AgentRole;
  status: AgentStatus;
  model: string;
  version: string;

  // Métricas de estado
  uptime: number;           // Porcentaje
  lastActive: string;       // ISO timestamp
  activeTasks: number;
  completedTasks: number;
  failedTasks: number;

  // Recursos
  cpuUsage: number;         // Porcentaje
  memoryUsage: number;      // MB

  // Historial
  usageHistory: number[];   // Últimos N puntos de datos

  // Sub-agentes
  subAgents: SubAgent[];

  // Configuración
  config: AgentConfig;

  // Métricas específicas del rol
  roleMetrics: RoleMetrics;
}

interface SubAgent {
  id: string;
  name: string;
  description: string;
  model: string;
  status: AgentStatus;
  activeTasks: number;
  specialization: string;
}

interface AgentConfig {
  autoStart: boolean;
  maxConcurrentTasks: number;
  priority: Priority;
  allowedActions: string[];
  restrictedActions: string[];
}
```

### 6.7 Métricas por Tipo de Agente

```typescript
// Métricas base (comunes a todos)
interface BaseMetrics {
  tasksCompleted: number;
  tasksInProgress: number;
  tasksFailed: number;
  averageResponseTime: number;  // ms
  errorRate: number;            // porcentaje
  uptime: number;               // porcentaje
}

// Métricas específicas por rol
interface AsistenteMetrics extends BaseMetrics {
  scheduledTasks: number;
  remindersSent: number;
  predictionsAccuracy: number;
  userSatisfaction: number;
}

interface NexusMetrics extends BaseMetrics {
  linesOfCode: number;
  testCoverage: number;
  bugsFixed: number;
  bugsIntroduced: number;
  cycleTime: number;           // horas
  technicalDebt: "low" | "medium" | "high";
  pullRequestsMerged: number;
}

interface SentinelMetrics extends BaseMetrics {
  threatsDetected: number;
  threatsBlocked: number;
  securityScore: number;
  vulnerabilitiesFound: number;
  incidentResponseTime: number; // ms
  complianceScore: number;
}

interface ScoutMetrics extends BaseMetrics {
  searchesPerformed: number;
  sourcesMonitored: number;
  dataExtracted: number;       // GB
  extractionSuccessRate: number;
  averageSearchLatency: number; // ms
}

interface AudiovisualMetrics extends BaseMetrics {
  assetsGenerated: number;
  storageUsed: number;         // GB
  averageGenerationTime: number; // ms
  assetReuseRate: number;
  qualityScore: number;
}

interface ConsultorMetrics extends BaseMetrics {
  consultationsCompleted: number;
  recommendationsGenerated: number;
  userRating: number;
  followUpRate: number;
  expertiseAreas: string[];
}

interface GambitoMetrics extends BaseMetrics {
  predictionsGenerated: number;
  predictionsAccurate: number;
  roi: number;                 // porcentaje
  winRate: number;            // porcentaje
  expectedValue: number;
  marketsAnalyzed: string[];
}

interface Condor360Metrics extends BaseMetrics {
  portfolioReturn: number;    // porcentaje
  sharpeRatio: number;
  maxDrawdown: number;        // porcentaje
  signalsGenerated: number;
  predictionAccuracy: number;
}

interface OptimusMetrics extends BaseMetrics {
  componentsManaged: number;
  accessibilityScore: number;
  performanceScore: number;   // Lighthouse
  loadTime: number;           // ms
  uiBugsReported: number;
  uiBugsResolved: number;
}

// Unión discriminada para métricas por rol
type RoleMetrics =
  | { role: "personal"; data: AsistenteMetrics }
  | { role: "development"; data: NexusMetrics }
  | { role: "security"; data: SentinelMetrics }
  | { role: "search"; data: ScoutMetrics }
  | { role: "multimedia"; data: AudiovisualMetrics }
  | { role: "advisory"; data: ConsultorMetrics }
  | { role: "prediction"; data: GambitoMetrics }
  | { role: "financial"; data: Condor360Metrics }
  | { role: "ux"; data: OptimusMetrics };
```

### 6.8 Mock Data Specifications

```typescript
// Generador de mock data
interface MockDataConfig {
  agents: {
    count: 9;
    subAgentsPerAgent: number[];  // [3, 8, 5, 5, 5, 5, 5, 5, 5]
    defaultStatus: AgentStatus;
    usageHistoryPoints: 10;
  };
  tasks: {
    defaultCount: 50;
    statusDistribution: {
      queued: 0.25;
      in_progress: 0.15;
      review: 0.10;
      done: 0.45;
      failed: 0.05;
    };
    priorityDistribution: {
      critical: 0.05;
      high: 0.20;
      medium: 0.50;
      low: 0.25;
    };
  };
  logs: {
    entriesPerDay: 100;
    retentionDays: 30;
  };
  alerts: {
    maxActive: 10;
    severityDistribution: {
      critical: 0.10;
      warning: 0.40;
      info: 0.50;
    };
  };
}
```

---

## 7. Métricas por Agente

### 7.1 Métricas Base (Comunes)

Todas las métricas mostradas en el dashboard deben incluir:

| Métrica | Tipo | Descripción |
|---------|------|-------------|
| `status` | enum | Estado actual del agente |
| `uptime` | % | Tiempo activo vs tiempo total |
| `tasksCompleted` | número | Tareas finalizadas exitosamente |
| `tasksInProgress` | número | Tareas actualmente en ejecución |
| `tasksFailed` | número | Tareas fallidas |
| `avgResponseTime` | ms | Tiempo promedio de respuesta |
| `errorRate` | % | Porcentaje de errores |
| `lastActive` | timestamp | Última actividad registrada |
| `cpuUsage` | % | Uso de CPU |
| `memoryUsage` | MB | Uso de memoria |

### 7.2 Métricas Específicas por Agente

#### ASISTENTE
| Métrica | Unidad | Target | Crítico |
|---------|--------|--------|---------|
| Scheduled Tasks | count | - | - |
| Reminders Sent | count/day | - | - |
| Prediction Accuracy | % | >80% | <50% |
| User Satisfaction | 1-5 | >4.0 | <3.0 |

#### NEXUS
| Métrica | Unidad | Target | Crítico |
|---------|--------|--------|---------|
| Lines of Code | count | - | - |
| Test Coverage | % | >80% | <60% |
| Bugs Fixed | count | - | - |
| Cycle Time | hours | <8h | >24h |
| Technical Debt | low/med/high | low | high |

#### SENTINEL
| Métrica | Unidad | Target | Crítico |
|---------|--------|--------|---------|
| Threats Detected | count | - | - |
| Threats Blocked | count | - | - |
| Security Score | 0-100 | >90 | <70 |
| Incident Response | ms | <5000 | >30000 |
| Compliance Score | % | 100% | <95% |

#### SCOUT
| Métrica | Unidad | Target | Crítico |
|---------|--------|--------|---------|
| Searches/Day | count | - | - |
| Sources Monitored | count | - | - |
| Extraction Rate | % | >95% | <80% |
| Search Latency | ms | <2000 | >10000 |
| Data Processed | GB/day | - | - |

#### AUDIOVISUAL
| Métrica | Unidad | Target | Crítico |
|---------|--------|--------|---------|
| Assets Generated | count/day | - | - |
| Storage Used | GB | - | >90% capacity |
| Generation Time | ms | <30000 | >120000 |
| Asset Reuse Rate | % | >30% | <10% |
| Quality Score | 0-100 | >85 | <60 |

#### CONSULTOR
| Métrica | Unidad | Target | Crítico |
|---------|--------|--------|---------|
| Consultations | count/day | - | - |
| User Rating | 1-5 | >4.5 | <3.5 |
| Follow-up Rate | % | >60% | <30% |
| Response Time | ms | <3000 | >15000 |
| Recommendations | count | - | - |

#### GAMBITO
| Métrica | Unidad | Target | Crítico |
|---------|--------|--------|---------|
| ROI | % | >5% | <-5% |
| Win Rate | % | >55% | <45% |
| Expected Value | units | >0.02 | <-0.01 |
| Predictions/Day | count | - | - |
| Markets Covered | count | - | - |

#### CÓNDOR360
| Métrica | Unidad | Target | Crítico |
|---------|--------|--------|---------|
| Portfolio Return | % | >benchmark | <-10% |
| Sharpe Ratio | ratio | >1.5 | <0.5 |
| Max Drawdown | % | <15% | >30% |
| Signals/Day | count | - | - |
| Prediction Accuracy | % | >65% | <50% |

#### OPTIMUS
| Métrica | Unidad | Target | Crítico |
|---------|--------|--------|---------|
| Components | count | - | - |
| Accessibility Score | % | 100% | <90% |
| Performance Score | 0-100 | >90 | <70 |
| Load Time | ms | <2000 | >5000 |
| UI Bugs Open | count | 0 | >10 |

---

## 8. Sistema de Alertas

### 8.1 Tipos de Alertas

| Tipo | Descripción | Ejemplo |
|------|-------------|---------|
| `system` | Alertas del sistema general | CPU > 90%, Memory full |
| `agent` | Alertas de agentes específicos | Agent offline, Task failed |
| `security` | Alertas de seguridad | Unauthorized access, Threat detected |
| `performance` | Alertas de rendimiento | High latency, Timeout |
| `task` | Alertas de tareas | Task deadline missed, Queue full |

### 8.2 Severidades

| Severidad | Color | Descripción | Acción Requerida |
|-----------|-------|-------------|------------------|
| `critical` | #ff006e (pink) | Requiere acción inmediata | Auto-notify, Block operations |
| `warning` | #ffaa00 (orange) | Atención necesaria | Log, Monitor closely |
| `info` | #00d9ff (cyan) | Informativo | Log only |

### 8.3 Acciones Automáticas

```typescript
interface AlertRule {
  id: string;
  name: string;
  condition: AlertCondition;
  severity: AlertSeverity;
  actions: AlertAction[];
  cooldown: number;  // ms entre alertas repetidas
  enabled: boolean;
}

interface AlertCondition {
  metric: string;
  operator: ">" | "<" | "==" | "!=" | ">=" | "<=";
  threshold: number;
  duration?: number;  // ms que debe mantenerse la condición
}

// Ejemplos de reglas predefinidas
const defaultAlertRules: AlertRule[] = [
  {
    id: "cpu-critical",
    name: "CPU Usage Critical",
    condition: { metric: "system.cpu", operator: ">", threshold: 95, duration: 60000 },
    severity: "critical",
    actions: [{ id: "notify", label: "Notify Admin", action: "sendNotification" }],
    cooldown: 300000,
    enabled: true
  },
  {
    id: "agent-offline",
    name: "Agent Offline",
    condition: { metric: "agent.status", operator: "==", threshold: 0 },
    severity: "warning",
    actions: [
      { id: "restart", label: "Restart Agent", action: "restartAgent" },
      { id: "notify", label: "Notify", action: "sendNotification" }
    ],
    cooldown: 600000,
    enabled: true
  }
];
```

---

## 9. Consideraciones Técnicas

### 9.1 Patrones Existentes a Seguir

| Patrón | Descripción | Archivos de Referencia |
|--------|-------------|----------------------|
| Component Composition | Sub-componentes con export barrel | Card.tsx (Card, CardHeader, etc.) |
| Status Variants | Variantes de estilo basadas en estado | Badge.tsx, StatusBadge |
| Time Range Selection | Selector de rango temporal en charts | ChartContainer.tsx |
| Responsive Grid | Grid adaptativo con breakpoints | MainContent.tsx (Grid) |
| Loading States | Estados de carga con spinners | Button.tsx (loading prop) |
| Error Handling | Manejo de estados de error | Input.tsx (error prop) |

### 9.2 Tokens de Diseño

```typescript
// Colores principales (Neo-punk theme)
const colors = {
  primary: {
    cyan: "#00d9ff",      // Info, active, links
    lime: "#39ff14",      // Success, positive
    pink: "#ff006e",      // Danger, errors, critical
    orange: "#ffaa00",    // Warning, assistant
  },
  background: {
    base: "#09090b",      // zinc-950
    card: "#18181b",      // zinc-900
    elevated: "#27272a",  // zinc-800
  },
  text: {
    primary: "#fafafa",   // zinc-50
    secondary: "#a1a1aa", // zinc-400
    muted: "#71717a",     // zinc-500
  },
  border: {
    default: "#27272a",   // zinc-800
    focus: "#00d9ff",     // cyan
  }
};

// Espaciado
const spacing = {
  xs: "0.25rem",   // 4px
  sm: "0.5rem",    // 8px
  md: "1rem",      // 16px
  lg: "1.5rem",    // 24px
  xl: "2rem",      // 32px
  "2xl": "3rem",   // 48px
};

// Tipografía
const typography = {
  fontFamily: "ui-monospace, monospace",
  sizes: {
    xs: "0.75rem",    // 12px
    sm: "0.875rem",   // 14px
    base: "1rem",     // 16px
    lg: "1.125rem",   // 18px
    xl: "1.25rem",    // 20px
    "2xl": "1.5rem",  // 24px
  }
};

// Efectos
const effects = {
  glow: {
    cyan: "0 0 20px rgba(0, 217, 255, 0.3)",
    lime: "0 0 20px rgba(57, 255, 20, 0.3)",
    pink: "0 0 20px rgba(255, 0, 110, 0.3)",
    orange: "0 0 20px rgba(255, 170, 0, 0.3)",
  },
  transition: "all 0.2s ease",
};
```

### 9.3 Accesibilidad

| Requisito | Implementación |
|-----------|----------------|
| Contraste de color | Ratio mínimo 4.5:1 para texto |
| Focus visible | Anillo de focus cyan en elementos interactivos |
| Navegación por teclado | Tab order lógico, Enter/Space para activar |
| Screen readers | aria-labels en iconos y elementos interactivos |
| Estados hover/focus | Feedback visual claro |
| Reducción de movimiento | Respetar prefers-reduced-motion |

---

## 10. Roadmap de Implementación

### Fase 1: Fundamentos (Sprint 1)

**Objetivo:** Establecer la estructura base y componentes core.

**Entregables:**
- [ ] Estructura de navegación con 5 tabs
- [ ] Interfaces TypeScript completas
- [ ] Mock data para todos los agentes
- [ ] Componentes: `SystemHealthBar`, `AlertPanel`
- [ ] Tab Overview funcional con datos mock

**Criterios de Aceptación:**
- Navegación entre tabs funciona
- Overview muestra KPIs con datos mock
- Responsive en desktop y tablet

---

### Fase 2: Task Management (Sprint 2)

**Objetivo:** Implementar sistema de gestión de tareas.

**Entregables:**
- [ ] Componentes: `TaskQueue`, `TaskCard`, `TaskFilters`
- [ ] Funcionalidad drag-and-drop para Kanban
- [ ] Filtros por agente, prioridad, estado
- [ ] Creación y edición de tareas

**Criterios de Aceptación:**
- Tareas se mueven entre columnas
- Filtros funcionan correctamente
- CRUD completo de tareas

---

### Fase 3: Logging y Auditoría (Sprint 3)

**Objetivo:** Implementar sistema completo de logs.

**Entregables:**
- [ ] Componentes: `ExecutionLog`, `LogEntry`, `LogFilters`, `Pagination`
- [ ] Filtrado avanzado por fecha, agente, tipo
- [ ] Exportación de logs (CSV/JSON)
- [ ] Detalle expandible de cada log

**Criterios de Aceptación:**
- Logs se muestran con paginación
- Filtros combinables funcionan
- Export genera archivo válido

---

### Fase 4: Agent Details (Sprint 4)

**Objetivo:** Vista detallada de cada agente.

**Entregables:**
- [ ] Componentes: `AgentDetailView`, `SubAgentGrid`
- [ ] Métricas específicas por tipo de agente
- [ ] Gráficos de performance histórico
- [ ] Lista de sub-agentes con estados

**Criterios de Aceptación:**
- Cada agente tiene vista dedicada
- Métricas específicas visibles
- Sub-agentes monitoreables

---

### Fase 5: Orquestación (Sprint 5)

**Objetivo:** Control manual y comunicación inter-agentes.

**Entregables:**
- [ ] Componentes: `OrchestrationControls`, `AgentCommunication`, `WorkflowVisualization`
- [ ] Controles start/pause/restart por agente
- [ ] Sistema de mensajería entre agentes
- [ ] Visualización de flujos de comunicación
- [ ] Generador de reportes

**Criterios de Aceptación:**
- Controles modifican estado de agentes (mock)
- Mensajes se envían y reciben
- Flujos se visualizan correctamente
- Reportes se generan en PDF/JSON

---

## Anexos

### A. Glosario

| Término | Definición |
|---------|------------|
| **Agente** | Unidad autónoma de IA con rol específico |
| **Sub-agente** | Especialización dentro de un agente principal |
| **Orquestador** | Sistema central que coordina agentes (Pascual) |
| **KPI** | Key Performance Indicator - métrica clave |
| **ROI** | Return on Investment - retorno sobre inversión |
| **EV** | Expected Value - valor esperado |

### B. Referencias

- Documentación de Agentes: `/pascual-agentes/`
- Componentes UI: `/pascual-dashboard/src/components/`
- Mock Data: `/pascual-dashboard/src/lib/api/mock/`
- Design System: Tailwind CSS + Custom Neo-punk theme

### C. Historial de Cambios

| Versión | Fecha | Descripción |
|---------|-------|-------------|
| 1.0.0 | 2025-03-06 | Documento inicial |

---

*Documento generado para el proyecto PASCUAL - Mando de Control Dashboard*
