"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  AgentHeader,
  Canvas,
  SectionCard,
  ProgressBar,
  AgentConfigModal,
  useAgentConfig,
} from "@/components/agents";
import { useGrowl } from "@/components/growl";
import { asistenteData } from "@/lib/api/mock/pascual-agents";
import { useDashboardConfig } from "@/lib/context/DashboardConfigContext";

export default function AsistenteDashboard() {
  const [data] = useState(asistenteData);
  const { sendToAgent } = useGrowl();
  const { config } = useDashboardConfig();

  // Usar el hook reutilizable para configuración del agente
  const {
    showConfigModal,
    agentData,
    handleAgentModelChange,
    handleSubAgentModelChange,
    openConfig,
    closeConfig,
  } = useAgentConfig("asistente");

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
    <div className="space-y-4">
      <AgentHeader
        name={data.name}
        icon={data.icon}
        lema={data.lema}
        status={data.status}
        showTimeRange={true}
        kpiVisibility={config.kpis.asistente}
        usage={{
          data: [28, 35, 42, 38, 45, 52, 48, 55, 60, 58],
          dataByRange: {
            "24h": [28, 35, 42, 38, 45, 52, 48, 55, 60, 58],
            "7d": [195, 240, 220, 280, 320, 350, 310],
            "1m": [780, 920, 1050, 1180, 1320, 1450, 1380, 1520, 1650, 1780, 1920, 1850],
            "1y": [9200, 10800, 12500, 14200, 16500, 18800, 21200, 24000, 27000, 30500, 34000, 38000],
          },
          color: "#ffaa00",
        }}
        kpis={[
          {
            id: "tareasHoy",
            label: "Tareas Hoy",
            value: data.metrics.tasksToday,
            values: { "24h": data.metrics.tasksToday, "7d": "32", "1m": "128", "1y": "1542" },
            status: "neutral",
          },
          {
            id: "completado",
            label: "Completado",
            value: `${data.metrics.weeklyCompletionRate}%`,
            values: { "24h": `${data.metrics.weeklyCompletionRate}%`, "7d": "82%", "1m": "78%", "1y": "75%" },
            status: data.metrics.weeklyCompletionRate > 80 ? "good" : "warning",
            statuses: { "24h": "good", "7d": "good", "1m": "warning", "1y": "warning" },
          },
          {
            id: "precision",
            label: "Precisión",
            value: `${data.metrics.proactiveAccuracy}%`,
            values: { "24h": `${data.metrics.proactiveAccuracy}%`, "7d": "80%", "1m": "76%", "1y": "72%" },
            status: data.metrics.proactiveAccuracy > 75 ? "good" : "warning",
            statuses: { "24h": "good", "7d": "good", "1m": "good", "1y": "warning" },
          },
          {
            id: "recordatorio",
            label: "Recordatorio",
            value: data.metrics.nextReminder,
            values: { "24h": data.metrics.nextReminder, "7d": "15 min", "1m": "30 min", "1y": "1 hora" },
            status: "neutral",
          },
          {
            id: "satisfaccion",
            label: "Satisfacción",
            value: `${data.metrics.userSatisfaction}/5`,
            values: { "24h": `${data.metrics.userSatisfaction}/5`, "7d": "4.6/5", "1m": "4.5/5", "1y": "4.4/5" },
            status: data.metrics.userSatisfaction >= 4 ? "good" : "warning",
            statuses: { "24h": "good", "7d": "good", "1m": "good", "1y": "good" },
          },
        ]}
      />

      {/* Canvas + Agenda + Sugerencias - Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Canvas - Lienzo de respuestas de Pascual */}
        <Canvas
          title="Canvas"
          placeholder="¿Qué necesitas organizar hoy?"
          onSendMessage={(msg) => sendToAgent("asistente", "Asistente", "🤖", msg)}
          minHeight="180px"
          quickPrompts={[
            { label: "Mi agenda", prompt: "Muéstrame mi agenda para hoy" },
            { label: "Tareas pendientes", prompt: "¿Cuáles son mis tareas pendientes?" },
            { label: "Recordatorios", prompt: "Configura un recordatorio para..." },
          ]}
        />

        {/* Agenda del Día */}
        <SectionCard title="Agenda del Día" visible={config.grids.asistente.agendaDia} maxHeight="320px">
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
        <SectionCard title="Sugerencias Proactivas" visible={config.grids.asistente.sugerenciasProactivas} maxHeight="320px">
          <div className="space-y-3">
            <p className="font-mono text-xs text-zinc-500">Basado en tu rutina:</p>
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
          </div>
        </SectionCard>

        {/* Lista de Tareas */}
        <SectionCard
          title="Lista de Tareas"
          action={
            <Badge variant="info">{data.metrics.tasksPending} pendientes</Badge>
          }
          maxHeight="320px"
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
                  {task.priority === "high" ? "alta" : task.priority === "medium" ? "media" : "baja"}
                </Badge>
              </div>
            ))}
          </div>
          <Button variant="ghost" size="sm" className="mt-3 w-full">
            + Nueva tarea
          </Button>
        </SectionCard>

        {/* Gestión Doméstica */}
        <SectionCard title="Gestión Doméstica" visible={config.grids.asistente.gestionDomestica} maxHeight="320px">
          <div className="space-y-4">
            <div>
              <p className="font-mono text-xs text-zinc-400 mb-3">Inventario Hogar</p>
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
                    {data.metrics.maintenanceStatus === "ok" ? "OK" : "Atención"}
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

      {/* Agent Configuration Modal */}
      {showConfigModal && (
        <AgentConfigModal
          agent={agentData}
          onClose={closeConfig}
          onAgentModelChange={handleAgentModelChange}
          onSubAgentModelChange={handleSubAgentModelChange}
        />
      )}
    </div>
  );
}
