"use client";

import { useState } from "react";
import { PageHeader, Section, SectionHeader, Grid } from "@/components/layout/MainContent";
import { Card, CardBody, CardHeader, StatCard } from "@/components/ui/Card";
import { Badge, StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Input";
import { LineChart } from "@/components/charts/LineChart";
import { CircularProgress } from "@/components/charts/CircularProgress";
import { ActivityFeed, ActivityItem } from "@/components/dashboard/ActivityFeed";

type AgentStatus = "active" | "busy" | "offline" | "error";
type AgentRole = "personal" | "development" | "security" | "search" | "multimedia" | "advisory" | "prediction" | "financial" | "ux";

interface SubAgent {
  id: string;
  name: string;
  description: string;
  model: string;
  status: AgentStatus;
  activeTasks: number;
}

interface AgentDetail {
  id: string;
  name: string;
  icon: string;
  description: string;
  role: AgentRole;
  status: AgentStatus;
  model: string;
  uptime: number;
  activeTasks: number;
  completedTasks: number;
  failedTasks: number;
  avgResponseTime: number;
  errorRate: number;
  usageHistory: number[];
  subAgents: SubAgent[];
  metrics: Record<string, string | number>;
}

const PASCUAL_AGENTS: AgentDetail[] = [
  {
    id: "asistente",
    name: "Asistente",
    icon: "👤",
    description: "Gestor Personal Inteligente - Orquestación de sistemas para gestión personal",
    role: "personal",
    status: "active",
    model: "Claude Sonnet",
    uptime: 99.2,
    activeTasks: 3,
    completedTasks: 156,
    failedTasks: 2,
    avgResponseTime: 1200,
    errorRate: 1.3,
    usageHistory: [45, 52, 48, 61, 55, 58, 62, 54, 49, 57],
    subAgents: [
      { id: "chronos", name: "Chronos", description: "Gestión de Tiempo y Tareas", model: "Claude Sonnet", status: "active", activeTasks: 2 },
      { id: "proactive", name: "Proactive", description: "Anticipación Proactiva", model: "Claude Haiku", status: "active", activeTasks: 1 },
      { id: "domus", name: "Domus", description: "Gestión Doméstica", model: "Claude Haiku", status: "busy", activeTasks: 0 },
    ],
    metrics: { scheduledTasks: 23, remindersSent: 45, predictionAccuracy: "82%", userSatisfaction: "4.5" }
  },
  {
    id: "nexus",
    name: "Nexus",
    icon: "🔧",
    description: "Director de Desarrollo de Software - Dirección estratégica del desarrollo técnico",
    role: "development",
    status: "active",
    model: "Claude Opus",
    uptime: 99.8,
    activeTasks: 5,
    completedTasks: 234,
    failedTasks: 8,
    avgResponseTime: 2300,
    errorRate: 3.4,
    usageHistory: [65, 72, 68, 81, 75, 78, 82, 74, 69, 77],
    subAgents: [
      { id: "explorer", name: "Explorer", description: "Analista de Código", model: "Claude Sonnet", status: "active", activeTasks: 1 },
      { id: "proposer", name: "Proposer", description: "Estratega Técnico", model: "Claude Opus", status: "active", activeTasks: 0 },
      { id: "spec-writer", name: "Spec Writer", description: "Especificador", model: "Claude Sonnet", status: "active", activeTasks: 1 },
      { id: "designer", name: "Designer", description: "Arquitecto", model: "Claude Opus", status: "busy", activeTasks: 2 },
      { id: "task-planner", name: "Task Planner", description: "Planificador", model: "Claude Sonnet", status: "active", activeTasks: 0 },
      { id: "implementador", name: "Implementador", description: "Desarrollador", model: "Claude Sonnet", status: "active", activeTasks: 1 },
      { id: "verificador", name: "Verificador QA", description: "Control de Calidad", model: "Claude Haiku", status: "active", activeTasks: 0 },
      { id: "auditor", name: "Auditor", description: "Evaluador Técnico", model: "Claude Sonnet", status: "offline", activeTasks: 0 },
    ],
    metrics: { linesOfCode: "12,456", testCoverage: "87%", bugsFixed: 23, cycleTime: "4.2h", technicalDebt: "Low" }
  },
  {
    id: "sentinel",
    name: "Sentinel",
    icon: "🛡️",
    description: "Guardián de Seguridad - Protección integral del ecosistema",
    role: "security",
    status: "active",
    model: "Claude Opus",
    uptime: 99.9,
    activeTasks: 2,
    completedTasks: 89,
    failedTasks: 1,
    avgResponseTime: 890,
    errorRate: 1.1,
    usageHistory: [35, 42, 38, 51, 45, 48, 52, 44, 39, 47],
    subAgents: [
      { id: "cipher", name: "Cipher", description: "Director de Seguridad Digital", model: "Claude Opus", status: "active", activeTasks: 1 },
      { id: "monitor", name: "Monitor", description: "Supervisor de Rendimiento", model: "Claude Haiku", status: "active", activeTasks: 1 },
      { id: "guardian", name: "Guardian", description: "Responsable de Resiliencia", model: "Claude Sonnet", status: "active", activeTasks: 0 },
      { id: "warden", name: "Warden", description: "Gestor de Acceso", model: "Claude Sonnet", status: "active", activeTasks: 0 },
      { id: "custodian", name: "Custodian", description: "Administrador de Recursos", model: "Claude Haiku", status: "busy", activeTasks: 0 },
    ],
    metrics: { threatsDetected: 12, threatsBlocked: 12, securityScore: 94, incidentResponse: "3.2s", complianceScore: "100%" }
  },
  {
    id: "scout",
    name: "Scout",
    icon: "🔍",
    description: "Maestro en Búsqueda - Ingesta y extracción de información",
    role: "search",
    status: "busy",
    model: "Claude Sonnet",
    uptime: 98.5,
    activeTasks: 4,
    completedTasks: 312,
    failedTasks: 15,
    avgResponseTime: 1800,
    errorRate: 4.8,
    usageHistory: [55, 62, 58, 71, 65, 68, 72, 64, 59, 67],
    subAgents: [
      { id: "hunter", name: "Hunter", description: "Especialista en Búsqueda", model: "Claude Sonnet", status: "busy", activeTasks: 2 },
      { id: "harvester", name: "Harvester", description: "Experto en Extracción", model: "Claude Haiku", status: "active", activeTasks: 1 },
      { id: "curator", name: "Curator", description: "Gestor de Calidad", model: "Claude Haiku", status: "active", activeTasks: 0 },
      { id: "synthesizer", name: "Synthesizer", description: "Procesador de Información", model: "Claude Sonnet", status: "busy", activeTasks: 1 },
      { id: "satelite", name: "Satelite", description: "Vigilante de Tendencias", model: "Claude Haiku", status: "active", activeTasks: 0 },
    ],
    metrics: { searchesPerDay: 245, sourcesMonitored: 34, extractionRate: "96%", searchLatency: "1.2s", dataProcessed: "4.2GB" }
  },
  {
    id: "audiovisual",
    name: "Audiovisual",
    icon: "🎬",
    description: "Orquestador Multimedia - Creación y gestión de recursos audiovisuales",
    role: "multimedia",
    status: "offline",
    model: "DALL-E 3",
    uptime: 95.2,
    activeTasks: 0,
    completedTasks: 78,
    failedTasks: 5,
    avgResponseTime: 15000,
    errorRate: 6.4,
    usageHistory: [25, 32, 28, 0, 0, 0, 0, 0, 0, 0],
    subAgents: [
      { id: "imagen", name: "Imagen", description: "Especialista Visual", model: "DALL-E 3", status: "offline", activeTasks: 0 },
      { id: "video", name: "Video", description: "Productor Videográfico", model: "Runway", status: "offline", activeTasks: 0 },
      { id: "audio", name: "Audio", description: "Especialista Sonoro", model: "ElevenLabs", status: "offline", activeTasks: 0 },
      { id: "texto", name: "Texto", description: "Experto en Narrativa", model: "Claude Opus", status: "offline", activeTasks: 0 },
      { id: "bibliotecario", name: "Bibliotecario", description: "Gestor de Recursos", model: "Claude Haiku", status: "offline", activeTasks: 0 },
    ],
    metrics: { assetsGenerated: 156, storageUsed: "2.3GB", generationTime: "28s", assetReuseRate: "34%", qualityScore: 87 }
  },
  {
    id: "consultor",
    name: "Consultor",
    icon: "📚",
    description: "Orquestador de Conocimiento - Coordinación de expertos multidisciplinarios",
    role: "advisory",
    status: "active",
    model: "Claude Opus",
    uptime: 99.4,
    activeTasks: 2,
    completedTasks: 67,
    failedTasks: 1,
    avgResponseTime: 3500,
    errorRate: 1.5,
    usageHistory: [40, 47, 43, 56, 50, 53, 57, 49, 44, 52],
    subAgents: [
      { id: "financiero", name: "Financiero", description: "Asesor Económico", model: "Claude Opus", status: "active", activeTasks: 1 },
      { id: "crianza", name: "Crianza", description: "Experto en Desarrollo Infantil", model: "Claude Sonnet", status: "active", activeTasks: 0 },
      { id: "emprendimiento", name: "Emprendimiento", description: "Especialista en Negocios", model: "Claude Opus", status: "active", activeTasks: 1 },
      { id: "carrera", name: "Carrera", description: "Experto en Desarrollo Profesional", model: "Claude Sonnet", status: "active", activeTasks: 0 },
      { id: "bienestar", name: "Bienestar", description: "Especialista en Salud Integral", model: "Claude Sonnet", status: "busy", activeTasks: 0 },
    ],
    metrics: { consultations: 89, userRating: "4.7", followUpRate: "68%", responseTime: "2.8s", recommendations: 234 }
  },
  {
    id: "gambito",
    name: "Gambito",
    icon: "🎯",
    description: "Estratega de Predicción - Análisis cuantitativo y modelos predictivos",
    role: "prediction",
    status: "active",
    model: "Claude Opus",
    uptime: 99.6,
    activeTasks: 3,
    completedTasks: 145,
    failedTasks: 7,
    avgResponseTime: 4200,
    errorRate: 4.8,
    usageHistory: [50, 57, 53, 66, 60, 63, 67, 59, 54, 62],
    subAgents: [
      { id: "analyst", name: "Analyst", description: "Modelador Estadístico", model: "Claude Opus", status: "active", activeTasks: 1 },
      { id: "evaluator", name: "Evaluator", description: "Validador de Modelos", model: "Claude Sonnet", status: "active", activeTasks: 1 },
      { id: "optimizer", name: "Optimizer", description: "Ajustador de Modelos", model: "Claude Sonnet", status: "busy", activeTasks: 1 },
      { id: "manager", name: "Manager", description: "Gestor de Capital", model: "Claude Opus", status: "active", activeTasks: 0 },
      { id: "monitor-g", name: "Monitor", description: "Seguimiento de Resultados", model: "Claude Haiku", status: "active", activeTasks: 0 },
    ],
    metrics: { roi: "+8.3%", winRate: "57%", expectedValue: "0.034", predictionsPerDay: 34, marketsAnalyzed: 8 }
  },
  {
    id: "condor360",
    name: "Cóndor360",
    icon: "📈",
    description: "Inteligencia Financiera - Análisis de portafolios e inversiones",
    role: "financial",
    status: "active",
    model: "Claude Opus",
    uptime: 99.7,
    activeTasks: 2,
    completedTasks: 98,
    failedTasks: 3,
    avgResponseTime: 5600,
    errorRate: 3.1,
    usageHistory: [60, 67, 63, 76, 70, 73, 77, 69, 64, 72],
    subAgents: [
      { id: "cuantificador", name: "Cuantificador", description: "Analista Numérico", model: "Claude Opus", status: "active", activeTasks: 1 },
      { id: "fundamental", name: "Fundamental", description: "Evaluador Empresarial", model: "Claude Opus", status: "active", activeTasks: 0 },
      { id: "estratega", name: "Estratega", description: "Optimizador de Portafolios", model: "Claude Opus", status: "busy", activeTasks: 1 },
      { id: "newswire", name: "Newswire", description: "Analista de Noticias", model: "Claude Sonnet", status: "active", activeTasks: 0 },
      { id: "simulador", name: "Simulador", description: "Validador de Estrategias", model: "Claude Sonnet", status: "active", activeTasks: 0 },
    ],
    metrics: { portfolioReturn: "+12.4%", sharpeRatio: "1.8", maxDrawdown: "-8.2%", signalsPerDay: 15, predictionAccuracy: "68%" }
  },
  {
    id: "optimus",
    name: "Optimus",
    icon: "🎨",
    description: "Sistema de Interfaces - Diseño y experiencia de usuario",
    role: "ux",
    status: "active",
    model: "Claude Opus",
    uptime: 99.5,
    activeTasks: 1,
    completedTasks: 56,
    failedTasks: 2,
    avgResponseTime: 1500,
    errorRate: 3.6,
    usageHistory: [30, 37, 33, 46, 40, 43, 47, 39, 34, 42],
    subAgents: [
      { id: "designer-o", name: "Designer", description: "Especialista UX/UI", model: "Claude Opus", status: "active", activeTasks: 1 },
      { id: "integrator", name: "Integrator", description: "Experto en APIs", model: "Claude Sonnet", status: "active", activeTasks: 0 },
      { id: "innovator", name: "Innovator", description: "Prototipador", model: "Claude Sonnet", status: "active", activeTasks: 0 },
      { id: "communicator", name: "Communicator", description: "Visualizador de Datos", model: "Claude Sonnet", status: "active", activeTasks: 0 },
      { id: "conservator", name: "Conservator", description: "Gestor de Componentes", model: "Claude Haiku", status: "active", activeTasks: 0 },
    ],
    metrics: { components: 47, accessibilityScore: "98%", performanceScore: 92, loadTime: "1.8s", uiBugsOpen: 3 }
  },
];

const mockActivities: ActivityItem[] = [
  { id: "1", type: "task", title: "Code review completed", timestamp: "2m ago" },
  { id: "2", type: "system", title: "Model updated", timestamp: "5m ago" },
  { id: "3", type: "task", title: "Tests executed", timestamp: "12m ago" },
  { id: "4", type: "agent", title: "Sub-agent restarted", timestamp: "1h ago" },
  { id: "5", type: "task", title: "Deployment successful", timestamp: "2h ago" },
];

export default function AgentDetailsPage() {
  const [selectedAgentId, setSelectedAgentId] = useState<string>("nexus");
  const agent = PASCUAL_AGENTS.find(a => a.id === selectedAgentId) || PASCUAL_AGENTS[0];

  const getStatusColor = (status: AgentStatus) => {
    switch (status) {
      case "active": return "bg-[#39ff14]";
      case "busy": return "bg-amber-400";
      case "offline": return "bg-zinc-600";
      case "error": return "bg-[#ff006e]";
    }
  };

  const performanceData = agent.usageHistory.map((value, index) => ({
    name: `${index}h`,
    value
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Agent Details"
        description="Vista detallada de métricas y estado por agente"
        actions={
          <div className="flex items-center gap-4">
            <Select
              options={PASCUAL_AGENTS.map(a => ({ value: a.id, label: `${a.icon} ${a.name}` }))}
              value={selectedAgentId}
              onChange={(e) => setSelectedAgentId(e.target.value)}
              className="w-48"
            />
            <Button variant="ghost">Refresh</Button>
            <Button variant="ghost">Settings</Button>
          </div>
        }
      />

      {/* Agent Overview + Performance */}
      <Section>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Agent Overview */}
          <Card>
            <CardHeader>
              <span className="font-mono text-sm text-zinc-400 uppercase">Agent Overview</span>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-zinc-800 rounded-sm flex items-center justify-center text-3xl">
                  {agent.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="font-mono text-xl font-bold text-white">{agent.name}</h2>
                    <StatusBadge status={agent.status} />
                  </div>
                  <p className="font-mono text-xs text-zinc-500 mt-1">{agent.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-zinc-800">
                <div>
                  <p className="font-mono text-[10px] text-zinc-500 uppercase">Model</p>
                  <p className="font-mono text-sm text-white">{agent.model}</p>
                </div>
                <div>
                  <p className="font-mono text-[10px] text-zinc-500 uppercase">Uptime</p>
                  <p className="font-mono text-sm text-[#39ff14]">{agent.uptime}%</p>
                </div>
                <div>
                  <p className="font-mono text-[10px] text-zinc-500 uppercase">Role</p>
                  <p className="font-mono text-sm text-white capitalize">{agent.role}</p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Performance Chart */}
          <Card>
            <CardHeader>
              <span className="font-mono text-sm text-zinc-400 uppercase">Performance Chart</span>
              <span className="font-mono text-xs text-zinc-500">Last 10 hours</span>
            </CardHeader>
            <CardBody>
              <div className="h-[180px]">
                <LineChart
                  data={performanceData}
                  height={180}
                  color="#00d9ff"
                  showAxis
                  showTooltip
                />
              </div>
            </CardBody>
          </Card>
        </div>
      </Section>

      {/* Sub-Agents Grid */}
      <Section>
        <SectionHeader title={`Sub-Agents (${agent.subAgents.length})`} />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {agent.subAgents.map((subAgent) => (
            <Card key={subAgent.id} className="hover:border-zinc-600 transition-colors">
              <CardBody className="p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-white">{subAgent.name}</span>
                  <div className={`w-2 h-2 rounded-full ${getStatusColor(subAgent.status)} ${subAgent.status === "active" ? "status-pulse" : ""}`} />
                </div>
                <p className="font-mono text-[10px] text-zinc-500 line-clamp-2">{subAgent.description}</p>
                <div className="flex items-center justify-between pt-1 border-t border-zinc-800">
                  <span className="font-mono text-[9px] text-zinc-600">{subAgent.model}</span>
                  <Badge variant={subAgent.activeTasks > 0 ? "info" : "default"} className="text-[9px]">
                    {subAgent.activeTasks} tasks
                  </Badge>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </Section>

      {/* Metrics + Activity */}
      <Section>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Agent-Specific Metrics */}
          <Card>
            <CardHeader>
              <span className="font-mono text-sm text-zinc-400 uppercase">Agent-Specific Metrics</span>
            </CardHeader>
            <CardBody>
              <div className="space-y-3">
                {Object.entries(agent.metrics).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between py-2 border-b border-zinc-800 last:border-0">
                    <span className="font-mono text-xs text-zinc-500 capitalize">
                      {key.replace(/([A-Z])/g, " $1").trim()}
                    </span>
                    <span className="font-mono text-sm text-white">{value}</span>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <span className="font-mono text-sm text-zinc-400 uppercase">Recent Activity</span>
            </CardHeader>
            <CardBody>
              <ActivityFeed activities={mockActivities} maxItems={5} />
            </CardBody>
          </Card>
        </div>
      </Section>

      {/* Base Metrics */}
      <Section>
        <SectionHeader title="Base Metrics" />
        <Grid cols={5}>
          <StatCard title="Active Tasks" value={agent.activeTasks.toString()} variant="info" />
          <StatCard title="Completed" value={agent.completedTasks.toString()} variant="success" />
          <StatCard title="Failed" value={agent.failedTasks.toString()} variant="danger" />
          <StatCard title="Avg Response" value={`${(agent.avgResponseTime / 1000).toFixed(1)}s`} variant="default" />
          <StatCard title="Error Rate" value={`${agent.errorRate}%`} variant={agent.errorRate > 5 ? "danger" : "default"} />
        </Grid>
      </Section>

      {/* Performance Indicators */}
      <Section>
        <SectionHeader title="Performance Indicators" />
        <Card>
          <CardBody>
            <div className="grid grid-cols-4 gap-8">
              <div className="flex flex-col items-center">
                <CircularProgress value={agent.uptime} size={100} color="#39ff14" label="Uptime" />
              </div>
              <div className="flex flex-col items-center">
                <CircularProgress value={100 - agent.errorRate} size={100} color="#00d9ff" label="Success Rate" />
              </div>
              <div className="flex flex-col items-center">
                <CircularProgress
                  value={Math.min(100, (agent.completedTasks / (agent.completedTasks + agent.failedTasks)) * 100)}
                  size={100}
                  color="#ffaa00"
                  label="Completion"
                />
              </div>
              <div className="flex flex-col items-center">
                <CircularProgress
                  value={agent.subAgents.filter(s => s.status === "active").length / agent.subAgents.length * 100}
                  size={100}
                  color="#ff006e"
                  label="Sub-agents Active"
                />
              </div>
            </div>
          </CardBody>
        </Card>
      </Section>
    </div>
  );
}
