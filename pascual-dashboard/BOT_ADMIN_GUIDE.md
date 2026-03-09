# PASCUAL Dashboard - Guia Tecnica para Bot Administrador

## Tabla de Contenidos

1. [Vision General](#1-vision-general)
2. [Principios Arquitectonicos](#2-principios-arquitectonicos)
3. [Arquitectura del Sistema](#3-arquitectura-del-sistema)
4. [Backend Recomendado](#4-backend-recomendado)
5. [Estructuras de Datos](#5-estructuras-de-datos)
6. [Componentes Disponibles](#6-componentes-disponibles)
7. [Sistema de Configuracion](#7-sistema-de-configuracion)
8. [Guias de Implementacion](#8-guias-de-implementacion)
9. [Protocolos de Comunicacion](#9-protocolos-de-comunicacion)
10. [Proceso de Cambios Arquitectonicos](#10-proceso-de-cambios-arquitectonicos)
11. [Sistema de Diseno](#11-sistema-de-diseno)
12. [Checklist de Implementacion](#12-checklist-de-implementacion)
13. [Consideraciones Adicionales](#13-consideraciones-adicionales)

---

## 1. Vision General

El PASCUAL Dashboard es el centro de control visual para un ecosistema de 10 agentes inteligentes especializados. Este documento proporciona las directrices tecnicas para que un bot administrador pueda gestionar, actualizar y expandir el dashboard de forma autonoma y organizada.

### 1.1 Agentes del Ecosistema

| Agent ID    | Nombre      | Icono | Descripcion                                    |
|-------------|-------------|-------|------------------------------------------------|
| pascual     | Pascual     | 🤖    | Orquestador principal del ecosistema           |
| asistente   | Asistente   | 👤    | Gestor personal (tareas, calendario, hogar)    |
| nexus       | Nexus       | 💻    | Director de desarrollo de software             |
| sentinel    | Sentinel    | 🛡️    | Guardian de seguridad                          |
| scout       | Scout       | 🔍    | Busqueda e ingesta de datos                    |
| audiovisual | Audiovisual | 🎬    | Generacion multimedia                          |
| consultor   | Consultor   | 📚    | Asesoria multidisciplinaria                    |
| gambito     | Gambito     | 🎯    | Prediccion deportiva                           |
| condor360   | Condor360   | 🦅    | Inteligencia financiera                        |
| picasso     | Picasso     | 🎨    | Interfaces y UX del dashboard                  |

### 1.2 Stack Tecnologico

- **Frontend**: Next.js 16, React 19, TypeScript
- **Estilos**: Tailwind CSS (tema neopunk)
- **Estado**: React Context API
- **Graficos**: Recharts
- **Cache/Fetching**: TanStack Query (preparado)

---

## 2. Principios Arquitectonicos

### PRINCIPIO 1: Componentes Base Inmutables

```
╔═══════════════════════════════════════════════════════════════════════╗
║  LOS COMPONENTES EN /src/components/ui/ NO DEBEN SER MODIFICADOS     ║
║                                                                       ║
║  Si se requiere una modificacion obligatoria:                        ║
║  1. Comunicar con el agente superior PASCUAL                         ║
║  2. Solicitar revision de los cambios propuestos                     ║
║  3. Esperar aprobacion antes de proceder                             ║
╚═══════════════════════════════════════════════════════════════════════╝
```

### PRINCIPIO 2: Aislamiento de Codigo por Agente

Cada agente debe tener su codigo completamente aislado para garantizar independencia:

```
/src/app/dashboard/agents/
├── sentinel/
│   └── page.tsx              # Codigo aislado de Sentinel
├── nexus/
│   └── page.tsx              # Codigo aislado de Nexus
├── gambito/
│   └── page.tsx              # Codigo aislado de Gambito
└── [otros-agentes]/
    └── page.tsx

/src/components/agents/
├── sentinel/                 # Componentes especificos de Sentinel
│   └── ThreatMonitor.tsx
├── nexus/                    # Componentes especificos de Nexus
│   └── CodeReviewPanel.tsx
└── [otros-agentes]/
```

### PRINCIPIO 3: Reutilizacion como Pilar Fundamental

Antes de crear cualquier componente nuevo:
1. Verificar si existe en `/src/components/ui/`
2. Verificar si existe en `/src/components/agents/AgentDashboardLayout.tsx`
3. Solo crear nuevo si no existe equivalente

### PRINCIPIO 4: Backend como Puente de Datos

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   BOT       │         │   BACKEND   │         │  DASHBOARD  │
│   (Datos    │ ──────▶ │   (Transfor-│ ──────▶ │  (Presenta- │
│   crudos)   │         │   macion)   │         │   cion)     │
└─────────────┘         └─────────────┘         └─────────────┘

El administrador de este sistema debe hacer un puente y transformar
la data del bot en insumos de calidad para este dashboard.
```

### PRINCIPIO 5: Mock Data = Estructura Objetivo

Los datos mock en `/src/lib/api/mock/pascual-agents.ts` representan:
- La estructura EXACTA esperada de los datos
- El formato de visualizacion deseado
- El contrato que el backend debe cumplir

**La data inicial se desea mantener de esa forma de ser posible.**

### PRINCIPIO 6: Loading States Obligatorios

```tsx
// CUANDO SE ACTIVE UN AGENTE O FUNCIONALIDAD CON TOGGLE:
// Mostrar spinner con loading message hasta tener data real

if (isLoading || !hasRealData) {
  return (
    <Card>
      <CardBody className="flex flex-col items-center justify-center py-12">
        <Spinner size="lg" />
        <span className="mt-4 text-zinc-500 font-mono text-sm">
          Cargando datos...
        </span>
      </CardBody>
    </Card>
  );
}
```

### PRINCIPIO 7: Cambios Arquitectonicos via Picasso

```
╔═══════════════════════════════════════════════════════════════════════╗
║  CAMBIOS ARQUITECTONICOS DEBEN SER PROPUESTOS OBLIGATORIAMENTE       ║
║  EN "HALLAZGOS POR APROBAR" DENTRO DEL AGENTE PICASSO                ║
║  ANTES DE PONERLOS EN FUNCIONAMIENTO                                  ║
╚═══════════════════════════════════════════════════════════════════════╝
```

### PRINCIPIO 8: Analisis Previo Obligatorio

**Primero se recomienda analizar el codigo existente para entender la logica y el workflow antes de realizar cualquier cambio.**

---

## 3. Arquitectura del Sistema

### 3.1 Diagrama de Alto Nivel

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           PASCUAL ECOSYSTEM                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────┐     ┌──────────────────┐     ┌──────────────────────┐ │
│  │  BOT ADMIN   │     │   BACKEND API    │     │  PASCUAL DASHBOARD   │ │
│  │  (Claude/    │────▶│   (Node.js)      │────▶│   (Next.js 16)       │ │
│  │   otro LLM)  │◀────│                  │◀────│                      │ │
│  └──────────────┘     └──────────────────┘     └──────────────────────┘ │
│         │                     │                         │                │
│         │                     │                         │                │
│         ▼                     ▼                         ▼                │
│  ┌──────────────┐     ┌──────────────────┐     ┌──────────────────────┐ │
│  │  Procesa     │     │  Transforma &    │     │  Renderiza UI        │ │
│  │  Comandos    │     │  Valida Data     │     │  React Components    │ │
│  │              │     │  WebSocket/SSE   │     │  TanStack Query      │ │
│  └──────────────┘     └──────────────────┘     └──────────────────────┘ │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Flujo de Datos

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐      ┌─────────────┐
│   Bot       │      │   Backend    │      │   Frontend  │      │   Usuario   │
│   Admin     │      │   API        │      │   Dashboard │      │             │
└──────┬──────┘      └──────┬───────┘      └──────┬──────┘      └──────┬──────┘
       │                    │                     │                    │
       │  1. Enviar datos   │                     │                    │
       │───────────────────▶│                     │                    │
       │                    │                     │                    │
       │                    │  2. Transformar a   │                    │
       │                    │     estructura mock │                    │
       │                    │────────────────────▶│                    │
       │                    │                     │                    │
       │                    │                     │  3. Renderizar UI  │
       │                    │                     │───────────────────▶│
       │                    │                     │                    │
       │                    │  4. WebSocket/SSE   │                    │
       │                    │  (actualizaciones)  │                    │
       │                    │════════════════════▶│                    │
       │                    │                     │                    │
       │  5. Recibir estado │                     │                    │
       │◀───────────────────│                     │                    │
       │                    │                     │                    │
```

### 3.3 Estructura de Capas

```
┌─────────────────────────────────────────────────────────────────┐
│                     CAPA DE PRESENTACION                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │  Pages      │  │  Layouts    │  │  Agent-Specific Comps   │  │
│  │  /dashboard │  │  Sidebar    │  │  /components/agents/    │  │
│  │  /agents/*  │  │  Header     │  │  [agente]/Component.tsx │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│                     CAPA DE COMPONENTES BASE                     │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  /src/components/ui/   [NO MODIFICAR - CONTACTAR PASCUAL]   ││
│  │  Card, Button, Badge, Input, Modal, Toggle, Spinner, etc.   ││
│  └─────────────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────────┤
│                     CAPA DE SERVICIOS                            │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │ agentService.ts │  │ DashboardConfig │  │   useGrowl()    │  │
│  │ API Abstraction │  │    Context      │  │  Chat System    │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│                     CAPA DE DATOS                                │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  /src/lib/api/mock/   [ESTRUCTURA OBJETIVO PARA BACKEND]    ││
│  │  pascual-agents.ts - Tipos e interfaces de cada agente      ││
│  │  agents.ts - Listado de agentes y capacidades               ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Backend Recomendado

### 4.1 Recomendacion: Node.js con Express o Fastify

**Justificacion:**
- Mismo ecosistema JavaScript/TypeScript que el frontend
- Reutilizacion directa de tipos e interfaces
- Excelente soporte para WebSocket/SSE (tiempo real)
- Facil integracion con Next.js API Routes si se desea hibrido
- Amplio ecosistema de librerias
- Bajo overhead de contexto para el bot administrador

### 4.2 Estructura Sugerida del Backend

```
pascual-backend/
├── src/
│   ├── api/
│   │   ├── routes/
│   │   │   ├── agents.ts         # GET /api/agents, GET /api/agents/:id
│   │   │   ├── metrics.ts        # GET /api/agents/:id/metrics
│   │   │   ├── config.ts         # GET/PUT /api/config
│   │   │   └── health.ts         # GET /api/health
│   │   ├── middleware/
│   │   │   ├── auth.ts           # Autenticacion del bot
│   │   │   ├── validation.ts     # Validacion de datos (Zod)
│   │   │   └── errorHandler.ts   # Manejo de errores
│   │   └── index.ts
│   ├── services/
│   │   ├── agentService.ts       # Logica de negocio por agente
│   │   ├── transformService.ts   # Bot data -> Dashboard format
│   │   └── cacheService.ts       # Redis/in-memory cache
│   ├── websocket/
│   │   ├── server.ts             # WebSocket server
│   │   └── handlers.ts           # Event handlers
│   ├── types/
│   │   └── index.ts              # Tipos (copiar del frontend)
│   └── index.ts                  # Entry point
├── package.json
└── tsconfig.json
```

### 4.3 Diagrama del Backend

```
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND NODE.JS                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌─────────────────┐    ┌─────────────────┐                    │
│   │   REST API      │    │   WebSocket     │                    │
│   │   /api/agents   │    │   Server        │                    │
│   │   /api/metrics  │    │   (Real-time)   │                    │
│   └────────┬────────┘    └────────┬────────┘                    │
│            │                      │                              │
│            └──────────┬───────────┘                              │
│                       │                                          │
│            ┌──────────▼──────────┐                               │
│            │   Transform Service │                               │
│            │   Bot -> Dashboard  │                               │
│            └──────────┬──────────┘                               │
│                       │                                          │
│     ┌─────────────────┼─────────────────┐                        │
│     │                 │                 │                        │
│     ▼                 ▼                 ▼                        │
│  ┌──────┐       ┌──────────┐      ┌──────────┐                   │
│  │Cache │       │Validation│      │ Logging  │                   │
│  │Redis │       │  Zod     │      │ Winston  │                   │
│  └──────┘       └──────────┘      └──────────┘                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 4.4 Endpoints API Principales

```typescript
// ══════════════════════════════════════════════════════════════
// ENDPOINTS REST
// ══════════════════════════════════════════════════════════════

// GET /api/agents
// Retorna lista de todos los agentes
Response: {
  success: boolean;
  data: Agent[];
  meta: { timestamp: number };
}

// GET /api/agents/:agentId
// Retorna datos completos de un agente
Response: {
  success: boolean;
  data: AgentData;  // SentinelData, GambitoData, etc.
  meta: { timestamp: number };
}

// GET /api/agents/:agentId/metrics?timeRange=24h
// Retorna metricas del agente filtradas por rango
Response: {
  success: boolean;
  data: AgentMetrics;
  meta: { timestamp: number; timeRange: string };
}

// PUT /api/agents/:agentId/config
// Actualiza configuracion del agente
Request: {
  model?: string;
  subAgents?: { id: string; model: string }[];
}

// GET /api/config
// Retorna configuracion del dashboard
Response: {
  success: boolean;
  data: DashboardConfig;
}

// PUT /api/config
// Actualiza configuracion del dashboard (toggles)
Request: Partial<DashboardConfig>
```

### 4.5 Servicio de Transformacion

```typescript
// src/services/transformService.ts

import type { SentinelData, GambitoData } from "../types";

export class TransformService {

  /**
   * Transforma datos crudos del bot al formato del dashboard
   * IMPORTANTE: Debe seguir la estructura de /src/lib/api/mock/pascual-agents.ts
   */
  transformBotData(agentId: string, botData: unknown): AgentData {
    switch (agentId) {
      case "sentinel":
        return this.transformSentinelData(botData);
      case "gambito":
        return this.transformGambitoData(botData);
      case "nexus":
        return this.transformNexusData(botData);
      // ... otros agentes
      default:
        throw new Error(`Unknown agent: ${agentId}`);
    }
  }

  private transformSentinelData(botData: any): SentinelData {
    // Mapear datos del bot a la estructura esperada
    return {
      id: "sentinel",
      name: "Sentinel",
      icon: "🛡️",
      lema: botData.lema || "Proteccion integral del ecosistema",
      status: this.mapStatus(botData.status),
      lastSync: new Date().toISOString(),
      metrics: {
        securityScore: botData.security?.score || 0,
        uptime: botData.uptime || 99.9,
        threatsDetected: botData.threats?.detected || 0,
        threatsBlocked: botData.threats?.blocked || 0,
        mttd: botData.mttd || 0,
        complianceScore: botData.compliance || 0,
        diskUsage: botData.disk?.usage || 0,
        // ... mapear el resto segun mock
      },
      subAgents: this.transformSubAgents(botData.subAgents),
      quickActions: this.getQuickActions("sentinel"),
      // ... resto de campos
    };
  }

  private mapStatus(status: string): AgentStatus {
    const statusMap: Record<string, AgentStatus> = {
      "running": "active",
      "processing": "busy",
      "waiting": "idle",
      "down": "offline",
      "failed": "error",
    };
    return statusMap[status] || "idle";
  }
}
```

---

## 5. Estructuras de Datos

### 5.1 Archivo de Referencia Principal

```
/src/lib/api/mock/pascual-agents.ts

Este archivo contiene TODAS las estructuras de datos objetivo.
El backend DEBE transformar los datos del bot a estas estructuras exactas.
```

### 5.2 Tipos Base Compartidos

```typescript
// ══════════════════════════════════════════════════════════════
// TIPOS BASE - Copiar al backend
// ══════════════════════════════════════════════════════════════

export type AgentStatus = "active" | "busy" | "idle" | "offline" | "error";
export type Priority = "critical" | "high" | "medium" | "low";
export type TimeRange = "24h" | "7d" | "1m" | "1y";

export interface SubAgentStatus {
  id: string;
  name: string;
  description: string;
  detailedDescription: string;  // Para tooltips expandidos
  model: string;                // "Claude Opus", "Claude Sonnet", etc.
  status: AgentStatus;
  activeTasks: number;
  lastActivity: string;         // "hace 5m", "hace 1h"
  score: number;                // 0-100
}

export interface QuickAction {
  id: string;
  label: string;
  icon: string;                 // Emoji
  prompt: string;               // Comando a ejecutar
}

export interface PascualMessage {
  id: string;
  type: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  agentId?: string;
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
```

### 5.3 Ejemplo: Estructura de Sentinel

```typescript
export interface SentinelData extends AgentBase {
  metrics: {
    securityScore: number;      // 0-100, status: good >80, warning >60, critical <=60
    uptime: number;             // Porcentaje (99.9)
    threatsDetected: number;    // Contador
    threatsBlocked: number;     // Contador
    mttd: number;               // Mean Time To Detect (segundos)
    complianceScore: number;    // 0-100
    diskUsage: number;          // Porcentaje
    activeSessions: number;
    activeApiKeys: number;
  };

  // Secciones especificas del agente
  threats: {
    id: string;
    type: string;
    severity: Priority;
    source: string;
    timestamp: string;
    status: "active" | "blocked" | "investigating";
    description: string;
  }[];

  systemResources: {
    name: string;
    usage: number;
    status: "good" | "warning" | "critical";
    trend: "up" | "down" | "stable";
  }[];

  vulnerabilities: {
    lastScan: string;
    nextScan: string;
    critical: number;
    high: number;
    medium: number;
    low: number;
    items: VulnerabilityItem[];
  };

  improvements: {
    id: string;
    title: string;
    description: string;
    status: "implemented" | "pending" | "in_progress";
    date: string;
    impact: "high" | "medium" | "low";
  }[];

  activityHeatmap: {
    data: number[][];  // 7x24 matrix (dias x horas)
    dayLabels: string[];
    hourLabels: string[];
  };
}
```

### 5.4 Soporte de Time Ranges

Los KPIs y metricas soportan multiples rangos de tiempo:

```typescript
interface KPIWithTimeRange {
  id: string;
  label: string;
  value: number;
  values: {
    "24h": number;
    "7d": number;
    "1m": number;
    "1y": number;
  };
  status: "good" | "warning" | "critical" | "neutral";
  statuses: {
    "24h": "good" | "warning" | "critical" | "neutral";
    "7d": "good" | "warning" | "critical" | "neutral";
    "1m": "good" | "warning" | "critical" | "neutral";
    "1y": "good" | "warning" | "critical" | "neutral";
  };
}
```

---

## 6. Componentes Disponibles

### 6.1 Componentes UI Base (NO MODIFICAR)

```
/src/components/ui/
├── Card.tsx          # Card, CardHeader, CardBody, CardFooter, StatCard
├── Button.tsx        # Button (primary, secondary, ghost, danger), IconButton
├── Badge.tsx         # Badge, StatusBadge
├── Input.tsx         # Input, Textarea, Select
├── Modal.tsx         # Modal, ModalHeader, ModalBody, ModalFooter + useModal()
├── Toggle.tsx        # Toggle switch
├── Spinner.tsx       # Spinner, GridLoader
├── Tooltip.tsx       # Tooltip con posicionamiento
├── NavLink.tsx       # NavLink, TabLink
├── RadioGroup.tsx    # RadioGroup, RadioItem, RadioCard
├── Slider.tsx        # Slider, RangeSlider
├── TimePicker.tsx    # TimePicker, TimeRangePicker
├── FileUpload.tsx    # FileUpload
├── ConfirmDialog.tsx # ConfirmDialog + useConfirmDialog()
└── index.ts          # Barrel export
```

**USO:**
```tsx
import { Card, CardBody, Button, Badge, Spinner } from "@/components/ui";
```

### 6.2 Componentes de Agentes (REUTILIZAR)

```
/src/components/agents/AgentDashboardLayout.tsx

Componentes reutilizables para cualquier dashboard de agente:
```

| Componente            | Proposito                                         |
|-----------------------|---------------------------------------------------|
| `AgentHeader`         | Header con nombre, status, KPIs, sparkline        |
| `SubAgentStatusGrid`  | Grid de sub-agentes con estados y scores          |
| `SubAgentsStatusBar`  | Barra horizontal de sub-agentes                   |
| `Canvas`              | Area de comunicacion con Pascual                  |
| `SectionCard`         | Tarjeta de seccion con titulo y visibilidad       |
| `KPICard`             | Tarjeta de KPI individual                         |
| `ProgressBar`         | Barras de progreso con label                      |
| `ActivityItem`        | Item de actividad con icon y status               |
| `ExpandableListItem`  | Items expandibles con detalles                    |
| `FilterTabs`          | Pestanas de filtrado + busqueda                   |
| `PascualFeedbackBar`  | Formulario para enviar mensajes al agente         |
| `AgentChatInput`      | Input para hablar con agente                      |
| `AgentConfigModal`    | Modal de configuracion de agente                  |

**USO:**
```tsx
import {
  AgentHeader,
  SubAgentStatusGrid,
  Canvas,
  SectionCard,
  KPICard,
  FilterTabs,
} from "@/components/agents";
```

### 6.3 Componentes de Graficos

```
/src/components/charts/
├── LineChart.tsx         # LineChart, Sparkline
├── BarChart.tsx          # BarChart
├── CircularProgress.tsx  # Progreso circular
├── HeatMap.tsx           # Mapa de calor
└── ChartContainer.tsx    # Wrapper base
```

### 6.4 Ejemplo de Pagina de Agente

```tsx
// /src/app/dashboard/agents/[mi-agente]/page.tsx

"use client";

import { useState } from "react";
import {
  AgentHeader,
  SubAgentStatusGrid,
  Canvas,
  SectionCard,
  PascualFeedbackBar,
  useAgentConfig,
} from "@/components/agents";
import { useDashboardConfig } from "@/lib/context/DashboardConfigContext";
import { miAgenteData } from "@/lib/api/mock/pascual-agents";
import { Spinner } from "@/components/ui";

export default function MiAgenteDashboard() {
  const [data] = useState(miAgenteData);
  const { config } = useDashboardConfig();
  const [isLoading, setIsLoading] = useState(false);

  const {
    showConfigModal,
    agentData,
    openConfig,
    closeConfig,
    handleAgentModelChange,
    handleSubAgentModelChange,
  } = useAgentConfig("mi-agente");

  // Loading state cuando se activa via toggle
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <Spinner size="lg" />
        <span className="mt-4 text-zinc-500 font-mono text-sm">
          Cargando datos del agente...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header con KPIs */}
      <AgentHeader
        name={data.name}
        icon={data.icon}
        lema={data.lema}
        status={data.status}
        showTimeRange={true}
        kpiVisibility={config.kpis.miAgente}
        kpis={[
          { id: "kpi1", label: "Metrica 1", value: "95%", status: "good" },
          { id: "kpi2", label: "Metrica 2", value: "3", status: "warning" },
        ]}
        onRefresh={() => {}}
        onSettings={openConfig}
      />

      {/* Quick Actions */}
      <PascualFeedbackBar
        agentId={data.id}
        agentName={data.name}
        agentIcon={data.icon}
        quickActions={data.quickActions}
      />

      {/* Secciones controladas por config */}
      {config.grids.miAgente.seccion1 && (
        <SectionCard title="Mi Seccion">
          {/* Contenido especifico */}
        </SectionCard>
      )}

      {/* Sub-agentes */}
      <SubAgentStatusGrid
        subAgents={data.subAgents}
        onSettings={openConfig}
      />

      {/* Canvas de Pascual */}
      <Canvas
        title="Consulta Personalizada"
        onSendMessage={(msg) => console.log(msg)}
        quickPrompts={[
          { label: "Accion 1", prompt: "Ejecuta accion 1" },
        ]}
      />
    </div>
  );
}
```

---

## 7. Sistema de Configuracion

### 7.1 DashboardConfigContext

```
/src/lib/context/DashboardConfigContext.tsx

Sistema central de toggles para mostrar/ocultar elementos del dashboard.
```

### 7.2 Estructura de Configuracion

```typescript
interface DashboardConfig {
  // Vistas principales del sidebar
  views: {
    home: boolean;
    planificador: boolean;
    agents: boolean;
    chatEmergente: boolean;
  };

  // Visibilidad de dashboards individuales de agentes
  agentViews: {
    sentinel: boolean;
    nexus: boolean;
    condor360: boolean;
    gambito: boolean;
    scout: boolean;
    audiovisual: boolean;
    consultor: boolean;
    asistente: boolean;
    picasso: boolean;
  };

  // Elementos del header global
  header: {
    showNotificationBanner: boolean;
    showSystemStatus: boolean;
    showLastSync: boolean;
  };

  // Secciones (grids) por agente
  grids: {
    home: { actividadReciente: boolean };
    sentinel: {
      monitorAmenazas: boolean;
      recursosSistema: boolean;
      escaneoVulnerabilidades: boolean;
      mejorasImplementadas: boolean;
      mapaActividad: boolean;
    };
    nexus: {
      tareasEnCurso: boolean;
      mejorasScripts: boolean;
      codeReviews: boolean;
    };
    // ... uno por cada agente
  };

  // KPIs individuales por agente
  kpis: {
    sentinel: {
      seguridad: boolean;
      uptime: boolean;
      amenazas: boolean;
      mttd: boolean;
      cumplimiento: boolean;
      disco: boolean;
    };
    nexus: {
      eficienciaIA: boolean;
      tests: boolean;
      docs: boolean;
      arquitectura: boolean;
      prsAbiertos: boolean;
      bugs: boolean;
    };
    // ... uno por cada agente
  };
}
```

### 7.3 Uso en Componentes

```tsx
import { useDashboardConfig } from "@/lib/context/DashboardConfigContext";

function MiComponente() {
  const { config, updateGridConfig, updateKpiConfig } = useDashboardConfig();

  // Mostrar/ocultar seccion segun toggle
  if (!config.grids.sentinel.monitorAmenazas) {
    return null;
  }

  // Filtrar KPIs visibles
  const visibleKpis = kpis.filter(kpi => config.kpis.sentinel[kpi.id]);

  return (
    <SectionCard title="Monitor de Amenazas">
      {/* contenido */}
    </SectionCard>
  );
}
```

### 7.4 Panel de Administracion

El panel en `/dashboard/administracion` permite:
- Activar/desactivar agentes completos
- Activar/desactivar secciones (grids) por agente
- Activar/desactivar KPIs individuales
- Toggle maestro para activar/desactivar todo de un agente

**Comportamiento en cascada:**
- Si se desactiva un agente, se desactivan todos sus grids y KPIs
- Cada seccion muestra loading spinner hasta tener data real

---

## 8. Guias de Implementacion

### 8.1 Agregar Datos a un Agente Existente

```
PASO 1: Definir la estructura en tipos
────────────────────────────────────
Archivo: /src/lib/api/types/index.ts

export interface NuevosDatos {
  campo1: string;
  campo2: number;
  // ...
}

PASO 2: Agregar al mock data
────────────────────────────
Archivo: /src/lib/api/mock/pascual-agents.ts

export const sentinelData = {
  // ... datos existentes
  nuevosDatos: {
    campo1: "valor",
    campo2: 42,
  }
};

PASO 3: Implementar en backend
──────────────────────────────
Agregar endpoint o campo al existente
Implementar transformacion en TransformService

PASO 4: Actualizar pagina del agente
────────────────────────────────────
Archivo: /src/app/dashboard/agents/sentinel/page.tsx

// Importar y usar los nuevos datos
```

### 8.2 Crear Nuevo Componente de Agente

```
PASO 1: Crear directorio si no existe
─────────────────────────────────────
/src/components/agents/[nombre-agente]/

PASO 2: Crear archivo del componente
────────────────────────────────────
/src/components/agents/[nombre-agente]/MiComponente.tsx

PASO 3: Usar SOLO componentes base existentes
─────────────────────────────────────────────
import { Card, CardBody, Badge } from "@/components/ui";
import { SectionCard, ProgressBar } from "@/components/agents";

// NO crear nuevos componentes base
// NO modificar componentes existentes

PASO 4: Exportar si es necesario
────────────────────────────────
/src/components/agents/index.ts

export { MiComponente } from "./[nombre-agente]/MiComponente";

PASO 5: Usar en la pagina del agente
────────────────────────────────────
/src/app/dashboard/agents/[nombre-agente]/page.tsx

import { MiComponente } from "@/components/agents";
```

### 8.3 Manejo de Loading States

```tsx
// ══════════════════════════════════════════════════════════════
// PATRON OBLIGATORIO PARA LOADING STATES
// ══════════════════════════════════════════════════════════════

import { Spinner } from "@/components/ui";
import { Card, CardBody } from "@/components/ui";

interface MiComponenteProps {
  data: MiData | null;
  isLoading: boolean;
}

function MiComponente({ data, isLoading }: MiComponenteProps) {
  // Estado de carga
  if (isLoading) {
    return (
      <Card>
        <CardBody className="flex flex-col items-center justify-center py-12">
          <Spinner size="lg" />
          <span className="mt-4 text-zinc-500 font-mono text-sm">
            Cargando datos...
          </span>
        </CardBody>
      </Card>
    );
  }

  // Sin datos
  if (!data) {
    return (
      <Card>
        <CardBody className="flex flex-col items-center justify-center py-12">
          <span className="text-zinc-500 font-mono text-sm">
            No hay datos disponibles
          </span>
        </CardBody>
      </Card>
    );
  }

  // Renderizar con datos
  return (
    <Card>
      <CardBody>
        {/* contenido */}
      </CardBody>
    </Card>
  );
}
```

### 8.4 Integracion con Chat (Growl)

```tsx
import { useGrowl } from "@/components/growl";

function MiComponente() {
  const { sendToAgent, sendMessage } = useGrowl();

  // Enviar mensaje a agente especifico
  const handleAgentAction = () => {
    sendToAgent(
      "sentinel",      // agentId
      "Sentinel",      // agentName
      "🛡️",           // agentIcon
      "Ejecuta escaneo de seguridad"  // mensaje
    );
  };

  // Enviar mensaje general
  const handleGeneralMessage = () => {
    sendMessage("Mensaje para Pascual", "main");
  };

  return (
    <Button onClick={handleAgentAction}>
      Iniciar Escaneo
    </Button>
  );
}
```

---

## 9. Protocolos de Comunicacion

### 9.1 REST API (Consultas)

```
BOT ─────── GET /api/agents ──────────────────▶ BACKEND
BOT ◀────── { success: true, data: [...] } ─── BACKEND

BOT ─────── GET /api/agents/sentinel ─────────▶ BACKEND
BOT ◀────── { success: true, data: {...} } ─── BACKEND

BOT ─────── PUT /api/agents/sentinel/config ──▶ BACKEND
            { model: "Claude Opus" }
BOT ◀────── { success: true } ──────────────── BACKEND
```

### 9.2 WebSocket (Tiempo Real)

```
┌──────────────────────────────────────────────────────────┐
│                  EVENTOS WEBSOCKET                        │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  BACKEND ───── agent:status_change ─────▶ DASHBOARD      │
│                {                                          │
│                  agentId: "sentinel",                     │
│                  status: "active",                        │
│                  timestamp: 1704067200000                 │
│                }                                          │
│                                                           │
│  BACKEND ───── agent:metrics_update ────▶ DASHBOARD      │
│                {                                          │
│                  agentId: "sentinel",                     │
│                  metrics: { securityScore: 95, ... },     │
│                  timeRange: "24h"                         │
│                }                                          │
│                                                           │
│  BACKEND ───── alert:new ───────────────▶ DASHBOARD      │
│                {                                          │
│                  id: "alert-001",                         │
│                  severity: "critical",                    │
│                  title: "Amenaza detectada",              │
│                  agentId: "sentinel"                      │
│                }                                          │
│                                                           │
│  DASHBOARD ─── config:update ───────────▶ BACKEND        │
│                {                                          │
│                  agentId: "sentinel",                     │
│                  grids: { monitorAmenazas: true }         │
│                }                                          │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

### 9.3 Formato de Mensajes WebSocket

```typescript
interface WSMessage<T = unknown> {
  type: WSEventType;
  payload: T;
  timestamp: number;
  agentId?: string;
}

type WSEventType =
  | "agent:status_change"
  | "agent:metrics_update"
  | "agent:task_update"
  | "agent:subagent_update"
  | "alert:new"
  | "alert:resolved"
  | "sync:complete"
  | "config:update";
```

---

## 10. Proceso de Cambios Arquitectonicos

### 10.1 Flujo de Propuestas

```
┌────────────────────────────────────────────────────────────┐
│                 FLUJO DE PROPUESTAS                         │
├────────────────────────────────────────────────────────────┤
│                                                             │
│   1. Bot detecta necesidad de cambio arquitectonico        │
│                        │                                    │
│                        ▼                                    │
│   2. Crear entrada en "Hallazgos por Aprobar"              │
│      dentro del dashboard de PICASSO                        │
│                        │                                    │
│                        ▼                                    │
│   3. Esperar revision y aprobacion de PASCUAL              │
│                        │                                    │
│                        ▼                                    │
│   4. Si APROBADO:                                          │
│      - Implementar siguiendo las guias                      │
│      - Documentar cambios                                   │
│      - Actualizar mock data si aplica                       │
│                                                             │
│   5. Si RECHAZADO:                                         │
│      - Buscar alternativa con componentes existentes        │
│      - Crear wrapper si es necesario                        │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

### 10.2 Formato de Propuesta

```json
{
  "id": "prop-001",
  "timestamp": "2024-01-15T10:30:00Z",
  "tipo": "arquitectonico",
  "categoria": "componente" | "estructura" | "integracion" | "datos",
  "prioridad": "critical" | "high" | "medium" | "low",
  "titulo": "Agregar nuevo tipo de grafico de radar",
  "descripcion": "Se requiere un grafico de radar para mostrar metricas multidimensionales en el dashboard de Condor360",
  "justificacion": "Los componentes de graficos existentes (LineChart, BarChart, HeatMap) no soportan visualizacion radial necesaria para comparar 5+ metricas simultaneamente",
  "impacto": {
    "archivos_afectados": [
      "/src/components/charts/RadarChart.tsx (nuevo)",
      "/src/components/charts/index.ts"
    ],
    "componentes_nuevos": ["RadarChart"],
    "componentes_modificados": [],
    "estimacion_esfuerzo": "medio"
  },
  "alternativas_consideradas": [
    "Usar libreria externa (recharts ya soporta RadarChart)",
    "Simular con multiples BarCharts"
  ],
  "solucion_propuesta": "Crear RadarChart usando recharts que ya esta instalado, siguiendo patrones de LineChart.tsx",
  "estado": "pendiente" | "aprobado" | "rechazado" | "implementado"
}
```

### 10.3 Tipos de Cambios que Requieren Aprobacion

| Tipo | Descripcion | Requiere Aprobacion |
|------|-------------|---------------------|
| Nuevo componente UI base | Agregar a /components/ui/ | **SI** |
| Modificar componente base | Cambiar Card, Button, etc. | **SI** |
| Nuevo componente de agente | Agregar a /components/agents/[agente]/ | NO |
| Nueva seccion en agente | Agregar grid a un dashboard | NO |
| Cambio de estructura de datos | Modificar tipos en /lib/api/types/ | **SI** |
| Nueva dependencia | Agregar paquete npm | **SI** |
| Cambio en contextos | Modificar DashboardConfigContext | **SI** |
| Nuevo endpoint API | Agregar ruta al backend | NO |

---

## 11. Sistema de Diseno

### 11.1 Paleta de Colores (Neopunk)

```
┌─────────────────────────────────────────────────────────┐
│                    COLORES PRIMARIOS                     │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Cyan (Primary):      #00d9ff                           │
│  Pink (Accent):       #ff006e                           │
│  Green (Success):     #39ff14                           │
│  Amber (Warning):     #ffaa00 / amber-400               │
│                                                          │
├─────────────────────────────────────────────────────────┤
│                    ESTADOS                               │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Good/Success:        #39ff14 (Verde neon)              │
│  Warning:             #ffaa00 / amber-400               │
│  Critical/Error:      #ff006e (Rosa neon)               │
│  Info/Neutral:        #00d9ff (Cyan neon)               │
│                                                          │
├─────────────────────────────────────────────────────────┤
│                    FONDOS                                │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Base:                zinc-950 (#09090b)                │
│  Surface:             zinc-900 (#18181b)                │
│  Elevated:            zinc-900/50                       │
│  Border:              zinc-800 (#27272a)                │
│  Border Hover:        zinc-700 (#3f3f46)                │
│                                                          │
├─────────────────────────────────────────────────────────┤
│                    TEXTO                                 │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Primary:             white                             │
│  Secondary:           zinc-400 (#a1a1aa)                │
│  Muted:               zinc-500 (#71717a)                │
│  Disabled:            zinc-600 (#52525b)                │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### 11.2 Clases Tailwind Comunes

```css
/* Estados de status */
text-[#39ff14]    /* active/good */
text-amber-400    /* busy/warning */
text-zinc-500     /* idle */
text-zinc-600     /* offline */
text-[#ff006e]    /* error/critical */

/* Fondos de cards */
bg-zinc-950                    /* Card base */
bg-zinc-900/50                 /* Card header */
border border-zinc-800         /* Bordes */
hover:border-zinc-700          /* Hover */

/* Efectos glow */
shadow-[0_0_15px_rgba(0,217,255,0.3)]   /* Cyan glow */
shadow-[0_0_15px_rgba(57,255,20,0.3)]   /* Green glow */
shadow-[0_0_15px_rgba(255,0,110,0.3)]   /* Pink glow */

/* Texto monospace */
font-mono text-xs              /* Labels, valores */
font-mono text-sm              /* Contenido general */

/* Animaciones */
animate-pulse                  /* Pulsacion */
transition-all duration-300    /* Transiciones suaves */
```

### 11.3 Fuentes

```css
/* Monospace (codigo, numeros, labels) */
font-family: 'Geist Mono', monospace;

/* Sans-serif (UI general) */
font-family: 'Geist Sans', sans-serif;
```

---

## 12. Checklist de Implementacion

### 12.1 Antes de Implementar

```
[ ] Analizar el codigo existente para entender logica y workflow
[ ] Verificar que la funcionalidad no existe ya
[ ] Revisar componentes base disponibles en /components/ui/
[ ] Revisar componentes de agentes en /components/agents/
[ ] Confirmar estructura de datos en mock (pascual-agents.ts)
[ ] Validar que NO requiere cambio arquitectonico
[ ] Si requiere cambio arquitectonico -> Proponer en Picasso
```

### 12.2 Durante la Implementacion

```
[ ] Usar componentes de /components/ui/ SIN modificarlos
[ ] Crear componentes nuevos en /components/agents/[agente]/
[ ] Seguir estructura de datos del mock exactamente
[ ] Implementar loading states con Spinner
[ ] Respetar paleta de colores del sistema
[ ] Mantener codigo aislado por agente
[ ] Usar hooks existentes (useAgentConfig, useDashboardConfig)
[ ] Integrar con sistema de chat si aplica (useGrowl)
```

### 12.3 Despues de Implementar

```
[ ] Verificar que no hay errores TypeScript (npm run build)
[ ] Confirmar que loading states funcionan correctamente
[ ] Probar integracion con toggles de DashboardConfigContext
[ ] Verificar que el agente se muestra/oculta correctamente
[ ] Probar en diferentes time ranges si aplica
[ ] Documentar cambios significativos
```

### 12.4 Si Necesita Modificar Componente Base

```
1. [ ] NO modificar directamente
2. [ ] Documentar la necesidad detalladamente
3. [ ] Crear propuesta en "Hallazgos por Aprobar" de Picasso
4. [ ] Esperar aprobacion de Pascual
5. [ ] Si es urgente: crear componente wrapper temporal
6. [ ] Si aprobado: seguir guias de modificacion
```

---

## 13. Consideraciones Adicionales

### 13.1 Versionado y Compatibilidad

- Mantener compatibilidad hacia atras con estructuras de datos existentes
- Nuevos campos en tipos deben ser opcionales inicialmente
- Deprecar campos antiguos gradualmente, no eliminar abruptamente
- Documentar cambios de version en el mock data

### 13.2 Manejo de Errores

```tsx
// Patron para manejo de errores en componentes
function MiComponente({ data, error, isLoading }) {
  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <Card>
        <CardBody className="text-center py-8">
          <span className="text-[#ff006e] font-mono text-sm">
            Error al cargar datos
          </span>
          <Button
            variant="ghost"
            onClick={retry}
            className="mt-4"
          >
            Reintentar
          </Button>
        </CardBody>
      </Card>
    );
  }

  if (!data) {
    return <EmptyState />;
  }

  return <DataDisplay data={data} />;
}
```

### 13.3 Performance

- Usar `useMemo` para calculos costosos
- Usar `useCallback` para funciones pasadas como props
- Evitar re-renders innecesarios con React.memo si es necesario
- Lazy loading para componentes pesados

### 13.4 Testing de Integracion

Antes de desplegar cambios:

1. Verificar build exitoso: `npm run build`
2. Probar todos los toggles del panel de administracion
3. Verificar que los agentes se muestran/ocultan correctamente
4. Probar time range selector en dashboards
5. Verificar comunicacion con sistema de chat

### 13.5 Documentacion de Cambios

Para cambios significativos, documentar:

```markdown
## Cambio: [Descripcion breve]

**Fecha**: YYYY-MM-DD
**Agente afectado**: [nombre]
**Tipo**: nuevo | modificacion | eliminacion

### Descripcion
[Descripcion detallada del cambio]

### Archivos modificados
- /ruta/archivo1.tsx
- /ruta/archivo2.ts

### Impacto en datos
[Si aplica, describir cambios en estructuras de datos]

### Notas de migracion
[Si aplica, pasos para migrar datos existentes]
```

### 13.6 Comunicacion con Pascual

Para cualquier duda o necesidad de aprobacion:

1. **Canal principal**: Sistema de chat (Growl)
2. **Propuestas**: Dashboard de Picasso -> Hallazgos por Aprobar
3. **Emergencias**: Crear alerta con prioridad "critical"

---

## Archivos de Referencia Criticos

| Archivo | Proposito | Modificable |
|---------|-----------|-------------|
| `/src/lib/api/mock/pascual-agents.ts` | Estructuras de datos objetivo | Solo agregar |
| `/src/lib/api/services/agentService.ts` | Capa de abstraccion API | Solo agregar |
| `/src/components/agents/AgentDashboardLayout.tsx` | Componentes reutilizables | NO |
| `/src/components/ui/*` | Componentes base | **NO** |
| `/src/lib/context/DashboardConfigContext.tsx` | Sistema de configuracion | Requiere aprobacion |
| `/src/app/dashboard/agents/*/page.tsx` | Paginas de agentes | SI |
| `/src/components/agents/[agente]/*` | Componentes especificos | SI |

---

*Documento generado para el ecosistema PASCUAL*
*Ultima actualizacion: Marzo 2026*
