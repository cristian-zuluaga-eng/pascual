"use client";

import { useState } from "react";
import { Section, Grid } from "@/components/layout/MainContent";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  AgentHeader,
  PascualFeedbackBar,
  SubAgentsStatusBar,
  KPICard,
  ProgressBar,
  SectionCard,
} from "@/components/agents";
import { asistenteData } from "@/lib/api/mock/pascual-agents";

export default function AsistenteDashboard() {
  const [data] = useState(asistenteData);

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "work": return "border-[#00d9ff]";
      case "personal": return "border-[#39ff14]";
      case "health": return "border-[#ff006e]";
      case "family": return "border-amber-400";
      default: return "border-zinc-700";
    }
  };

  const getTaskStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return "✓";
      case "in_progress": return "◐";
      case "pending": return "○";
      default: return "○";
    }
  };

  const getSuggestionIcon = (source: string) => {
    switch (source) {
      case "chronos": return "⏰";
      case "proactive": return "💡";
      case "domus": return "🏠";
      default: return "●";
    }
  };

  return (
    <div className="space-y-6">
      <AgentHeader
        name={data.name}
        icon={data.icon}
        lema={data.lema}
        status={data.status}
        onRefresh={() => console.log("Refresh")}
        onSettings={() => console.log("Settings")}
        onChat={() => console.log("Chat")}
      />

      <PascualFeedbackBar
        agentName={data.name}
        quickActions={data.quickActions}
        placeholder="¿Qué necesitas organizar hoy?"
        onSendMessage={(msg) => console.log("Message:", msg)}
      />

      {/* KPIs */}
      <Section>
        <Grid cols={5}>
          <KPICard
            title="Tareas Hoy"
            value={data.metrics.tasksToday}
            status="neutral"
          />
          <KPICard
            title="Completado Semana"
            value={`${data.metrics.weeklyCompletionRate}%`}
            status={data.metrics.weeklyCompletionRate > 80 ? "good" : "warning"}
            subtitle={data.metrics.weeklyCompletionRate > 80 ? "✓ On track" : "⚠ Behind"}
          />
          <KPICard
            title="Precisión Proactiva"
            value={`${data.metrics.proactiveAccuracy}%`}
            status={data.metrics.proactiveAccuracy > 75 ? "good" : "warning"}
          />
          <KPICard
            title="Próx. Recordatorio"
            value={data.metrics.nextReminder}
            status="neutral"
          />
          <KPICard
            title="Satisfacción"
            value={`${data.metrics.userSatisfaction}/5`}
            status={data.metrics.userSatisfaction >= 4 ? "good" : "warning"}
          />
        </Grid>
      </Section>

      {/* Main Content */}
      <Section>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Agenda del Día */}
          <SectionCard title="Agenda del Día">
            <div className="space-y-2">
              {data.todaySchedule.map((event) => (
                <div
                  key={event.id}
                  className={`flex items-center gap-3 p-2 bg-zinc-900 rounded-sm border-l-2 ${getEventTypeColor(event.type)}`}
                >
                  <span className="font-mono text-xs text-zinc-500 w-12">{event.time}</span>
                  <div className={`w-2 h-2 rounded-full ${event.completed ? "bg-[#39ff14]" : "bg-zinc-600"}`} />
                  <span className={`font-mono text-xs ${event.completed ? "text-zinc-500 line-through" : "text-white"}`}>
                    {event.title}
                  </span>
                </div>
              ))}
            </div>
            <Button variant="ghost" size="sm" className="mt-3 w-full">
              + Agregar evento
            </Button>
          </SectionCard>

          {/* Sugerencias Proactivas */}
          <SectionCard title="Sugerencias Proactivas">
            <div className="space-y-3">
              <p className="font-mono text-xs text-zinc-500">💡 Basado en tu rutina:</p>
              {data.suggestions.map((suggestion) => (
                <div
                  key={suggestion.id}
                  className="flex items-start gap-2 p-2 bg-zinc-900 rounded-sm"
                >
                  <span>{getSuggestionIcon(suggestion.source)}</span>
                  <div className="flex-1">
                    <p className="font-mono text-xs text-zinc-300">{suggestion.text}</p>
                    <p className="font-mono text-[10px] text-zinc-600 mt-0.5">
                      Confianza: {Math.round(suggestion.confidence * 100)}%
                    </p>
                  </div>
                </div>
              ))}
              <div className="flex gap-2 mt-3">
                <Button variant="primary" size="sm" className="flex-1">Aceptar todas</Button>
                <Button variant="ghost" size="sm" className="flex-1">Personalizar</Button>
              </div>
            </div>
          </SectionCard>
        </div>
      </Section>

      {/* Second Row */}
      <Section>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Lista de Tareas */}
          <SectionCard
            title="Lista de Tareas"
            action={
              <Badge variant="info">{data.metrics.tasksPending} pendientes</Badge>
            }
          >
            <div className="space-y-2">
              {data.tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-2 bg-zinc-900 rounded-sm"
                >
                  <div className="flex items-center gap-2">
                    <span className={`font-mono text-sm ${
                      task.status === "completed" ? "text-[#39ff14]" :
                      task.status === "in_progress" ? "text-[#00d9ff]" : "text-zinc-500"
                    }`}>
                      {getTaskStatusIcon(task.status)}
                    </span>
                    <span className={`font-mono text-xs ${
                      task.status === "completed" ? "text-zinc-500 line-through" : "text-white"
                    }`}>
                      {task.title}
                    </span>
                  </div>
                  <Badge
                    variant={
                      task.priority === "high" ? "danger" :
                      task.priority === "medium" ? "warning" : "default"
                    }
                    className="text-[9px]"
                  >
                    {task.priority}
                  </Badge>
                </div>
              ))}
            </div>
            <Button variant="ghost" size="sm" className="mt-3 w-full">
              + Nueva tarea
            </Button>
          </SectionCard>

          {/* Gestión Doméstica */}
          <SectionCard title="Gestión Doméstica">
            <div className="space-y-4">
              <div>
                <p className="font-mono text-xs text-zinc-400 mb-3">🏠 Inventario Hogar</p>
                <div className="space-y-2">
                  <ProgressBar
                    label="Despensa"
                    value={data.metrics.pantryLevel}
                    color={data.metrics.pantryLevel > 50 ? "#39ff14" : "#ff006e"}
                  />
                  <ProgressBar
                    label="Limpieza"
                    value={data.metrics.cleaningSuppliesLevel}
                    color={data.metrics.cleaningSuppliesLevel > 50 ? "#39ff14" : "#ff006e"}
                  />
                  <div className="flex items-center justify-between py-1">
                    <span className="font-mono text-xs text-zinc-500">Mantenimiento</span>
                    <Badge variant={data.metrics.maintenanceStatus === "ok" ? "success" : "warning"}>
                      {data.metrics.maintenanceStatus === "ok" ? "✓ OK" : "⚠ Atención"}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="pt-3 border-t border-zinc-800">
                <p className="font-mono text-[10px] text-zinc-500 mb-2">Próximo restock:</p>
                <div className="flex flex-wrap gap-1">
                  {data.upcomingPurchases.map((item, i) => (
                    <Badge key={i} variant="default" className="text-[9px]">{item}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </SectionCard>
        </div>
      </Section>

      <SubAgentsStatusBar
        subAgents={data.subAgents}
        lastSync={data.lastSync}
      />
    </div>
  );
}
