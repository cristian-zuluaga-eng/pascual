"use client";

import { useState } from "react";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal, ModalHeader, ModalBody, ModalFooter, useModal } from "@/components/ui/Modal";
import { PascualInput } from "@/components/pascual/PascualInput";
import { Sparkline } from "@/components/charts/LineChart";

// ============================================================================
// TYPES
// ============================================================================

type TaskStatus = "backlog" | "todo" | "in_progress" | "in_review" | "done";
type TaskPriority = "low" | "medium" | "high" | "urgent";
type CalendarView = "week" | "month";
type TimeRange = "24h" | "7d" | "1m" | "1y";

interface Project {
  id: string;
  name: string;
  description: string;
  color: string;
}

const TIME_RANGE_LABELS: Record<TimeRange, string> = {
  "24h": "24H",
  "7d": "7D",
  "1m": "1M",
  "1y": "1Y",
};

interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedAgent?: string;
  createdAt: string;
  completedAt?: string;
  notes?: TaskNote[];
  tags?: string[];
  projectId: string;
}

interface TaskNote {
  id: string;
  content: string;
  createdAt: string;
}

interface Reminder {
  id: string;
  title: string;
  date: string;
  time?: string;
  type: "reminder" | "meeting" | "deadline";
  description?: string;
}

// ============================================================================
// MOCK DATA
// ============================================================================

const projects: Project[] = [
  {
    id: "general",
    name: "Proyecto General",
    description: "Tareas generales del equipo",
    color: "#00d9ff",
  },
  {
    id: "software",
    name: "Proyecto de Software",
    description: "Desarrollo de la nueva plataforma",
    color: "#39ff14",
  },
];

const initialTasks: Task[] = [
  // === PROYECTO GENERAL ===
  {
    id: "1",
    title: "Analizar tendencias de mercado Q1",
    description: "Revisar datos financieros del primer trimestre",
    status: "done",
    priority: "high",
    assignedAgent: "Cóndor360",
    createdAt: "2024-03-01",
    completedAt: "2024-03-05",
    tags: ["finanzas", "análisis"],
    projectId: "general",
    notes: [
      { id: "n1", content: "Revisados los datos de enero y febrero", createdAt: "2024-03-02" },
      { id: "n2", content: "Tendencia positiva en sector tecnológico", createdAt: "2024-03-04" },
    ],
  },
  {
    id: "2",
    title: "Auditoría de seguridad semanal",
    description: "Ejecutar escaneo completo del sistema",
    status: "in_progress",
    priority: "urgent",
    assignedAgent: "Sentinel",
    createdAt: "2024-03-04",
    tags: ["seguridad"],
    projectId: "general",
  },
  {
    id: "3",
    title: "Actualizar documentación API",
    description: "La documentación de endpoints necesita actualización",
    status: "in_review",
    priority: "medium",
    assignedAgent: "Nexus",
    createdAt: "2024-03-03",
    tags: ["desarrollo", "docs"],
    projectId: "general",
  },
  {
    id: "4",
    title: "Optimizar calendario de reuniones",
    description: "Reorganizar horarios para mayor productividad",
    status: "todo",
    priority: "medium",
    assignedAgent: "Asistente",
    createdAt: "2024-03-05",
    tags: ["productividad"],
    projectId: "general",
  },
  {
    id: "5",
    title: "Code review sprint actual",
    description: "Revisar PRs pendientes del sprint",
    status: "todo",
    priority: "high",
    assignedAgent: "Nexus",
    createdAt: "2024-03-06",
    tags: ["desarrollo", "review"],
    projectId: "general",
  },
  {
    id: "6",
    title: "Backup de datos mensual",
    status: "backlog",
    priority: "low",
    createdAt: "2024-03-01",
    tags: ["mantenimiento"],
    projectId: "general",
  },
  {
    id: "7",
    title: "Optimización de rendimiento",
    description: "Mejorar tiempos de respuesta del dashboard",
    status: "backlog",
    priority: "medium",
    createdAt: "2024-03-02",
    tags: ["performance"],
    projectId: "general",
  },
  {
    id: "8",
    title: "Preparar reporte semanal",
    status: "done",
    priority: "medium",
    assignedAgent: "Scout",
    createdAt: "2024-03-01",
    completedAt: "2024-03-03",
    tags: ["reportes"],
    projectId: "general",
  },
  {
    id: "9",
    title: "Configurar alertas de mercado",
    status: "done",
    priority: "high",
    assignedAgent: "Cóndor360",
    createdAt: "2024-02-28",
    completedAt: "2024-03-02",
    tags: ["finanzas", "alertas"],
    projectId: "general",
  },
  // === PROYECTO DE SOFTWARE ===
  {
    id: "sw-1",
    title: "Diseñar arquitectura de microservicios",
    description: "Definir la estructura de servicios para el nuevo sistema",
    status: "done",
    priority: "high",
    assignedAgent: "Nexus",
    createdAt: "2024-02-20",
    completedAt: "2024-02-28",
    tags: ["arquitectura", "backend"],
    projectId: "software",
    notes: [
      { id: "sw-n1", content: "Se definieron 5 microservicios principales", createdAt: "2024-02-25" },
      { id: "sw-n2", content: "Arquitectura aprobada por el equipo", createdAt: "2024-02-28" },
    ],
  },
  {
    id: "sw-2",
    title: "Implementar autenticación OAuth2",
    description: "Integrar sistema de autenticación con proveedores externos",
    status: "in_review",
    priority: "urgent",
    assignedAgent: "Sentinel",
    createdAt: "2024-03-01",
    tags: ["seguridad", "auth", "backend"],
    projectId: "software",
    notes: [
      { id: "sw-n3", content: "Implementación completada, pendiente revisión de seguridad", createdAt: "2024-03-05" },
    ],
  },
  {
    id: "sw-3",
    title: "Crear componentes UI del dashboard",
    description: "Desarrollar componentes reutilizables en React",
    status: "in_progress",
    priority: "high",
    assignedAgent: "Nexus",
    createdAt: "2024-03-02",
    tags: ["frontend", "react", "ui"],
    projectId: "software",
  },
  {
    id: "sw-4",
    title: "Configurar pipeline CI/CD",
    description: "Automatizar el proceso de build y deployment",
    status: "in_progress",
    priority: "medium",
    assignedAgent: "Optimus",
    createdAt: "2024-03-03",
    tags: ["devops", "automation"],
    projectId: "software",
  },
  {
    id: "sw-5",
    title: "Escribir tests unitarios API",
    description: "Cobertura mínima del 80% para endpoints críticos",
    status: "todo",
    priority: "high",
    assignedAgent: "Nexus",
    createdAt: "2024-03-04",
    tags: ["testing", "backend"],
    projectId: "software",
  },
  {
    id: "sw-6",
    title: "Integrar sistema de logging",
    description: "Implementar logging centralizado con ELK stack",
    status: "todo",
    priority: "medium",
    assignedAgent: "Sentinel",
    createdAt: "2024-03-05",
    tags: ["devops", "monitoring"],
    projectId: "software",
  },
  {
    id: "sw-7",
    title: "Documentar APIs con OpenAPI",
    description: "Generar especificación OpenAPI 3.0 para todos los endpoints",
    status: "backlog",
    priority: "medium",
    createdAt: "2024-03-01",
    tags: ["docs", "api"],
    projectId: "software",
  },
  {
    id: "sw-8",
    title: "Optimizar queries de base de datos",
    description: "Mejorar rendimiento de consultas lentas identificadas",
    status: "backlog",
    priority: "low",
    createdAt: "2024-03-02",
    tags: ["backend", "database", "performance"],
    projectId: "software",
  },
  {
    id: "sw-9",
    title: "Implementar caché con Redis",
    description: "Agregar capa de caché para mejorar tiempos de respuesta",
    status: "backlog",
    priority: "medium",
    createdAt: "2024-03-03",
    tags: ["backend", "performance"],
    projectId: "software",
  },
  {
    id: "sw-10",
    title: "Setup ambiente de staging",
    status: "done",
    priority: "high",
    assignedAgent: "Optimus",
    createdAt: "2024-02-25",
    completedAt: "2024-03-01",
    tags: ["devops", "infrastructure"],
    projectId: "software",
  },
];

const initialReminders: Reminder[] = [
  { id: "r1", title: "Standup diario", date: "2024-03-07", time: "09:00", type: "meeting" },
  { id: "r2", title: "Revisión de métricas", date: "2024-03-07", time: "14:00", type: "meeting" },
  { id: "r3", title: "Deadline: Documentación API", date: "2024-03-10", type: "deadline" },
  { id: "r4", title: "Backup semanal", date: "2024-03-08", time: "23:00", type: "reminder" },
  { id: "r5", title: "Reunión con equipo", date: "2024-03-11", time: "10:00", type: "meeting" },
  { id: "r6", title: "Deploy a producción", date: "2024-03-12", time: "16:00", type: "deadline" },
  { id: "r7", title: "Revisión de seguridad", date: "2024-03-14", time: "11:00", type: "meeting" },
  { id: "r8", title: "Fin de sprint", date: "2024-03-15", type: "deadline" },
];

const columns: { status: TaskStatus; title: string; color: string }[] = [
  { status: "backlog", title: "Backlog", color: "zinc-600" },
  { status: "todo", title: "Por Hacer", color: "#ffaa00" },
  { status: "in_progress", title: "En Progreso", color: "#00d9ff" },
  { status: "in_review", title: "En Revisión", color: "#a855f7" },
  { status: "done", title: "Completado", color: "#39ff14" },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [reminders, setReminders] = useState<Reminder[]>(initialReminders);
  const [view, setView] = useState<"kanban" | "agenda">("kanban");
  const [calendarView, setCalendarView] = useState<CalendarView>("week");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>("7d");
  const [selectedProjectId, setSelectedProjectId] = useState<string>("general");

  const taskModal = useModal();
  const newTaskModal = useModal();
  const reminderModal = useModal();

  // Get current project
  const currentProject = projects.find(p => p.id === selectedProjectId) || projects[0];

  // Filter tasks by selected project
  const projectTasks = tasks.filter(task => task.projectId === selectedProjectId);

  // Task operations
  const getTasksByStatus = (status: TaskStatus) =>
    projectTasks.filter((task) => task.status === status);

  const moveTask = (taskId: string, newStatus: TaskStatus) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === taskId) {
          return {
            ...task,
            status: newStatus,
            completedAt: newStatus === "done" ? new Date().toISOString().split("T")[0] : undefined,
          };
        }
        return task;
      })
    );
  };

  const addNote = (taskId: string, content: string) => {
    const newNote: TaskNote = {
      id: `note-${Date.now()}`,
      content,
      createdAt: new Date().toISOString(),
    };
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === taskId) {
          return {
            ...task,
            notes: [...(task.notes || []), newNote],
          };
        }
        return task;
      })
    );
  };

  const openTaskModal = (task: Task) => {
    setSelectedTask(task);
    taskModal.open();
  };

  // KPI calculations based on time range
  const getKPIsByTimeRange = () => {
    const now = new Date();
    let filterDate = new Date();

    switch (timeRange) {
      case "24h":
        filterDate.setDate(now.getDate() - 1);
        break;
      case "7d":
        filterDate.setDate(now.getDate() - 7);
        break;
      case "1m":
        filterDate.setMonth(now.getMonth() - 1);
        break;
      case "1y":
        filterDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    const completedInRange = projectTasks.filter((t) => {
      if (!t.completedAt) return false;
      return new Date(t.completedAt) >= filterDate;
    }).length;

    const createdInRange = projectTasks.filter((t) => {
      return new Date(t.createdAt) >= filterDate;
    }).length;

    return { completedInRange, createdInRange };
  };

  const { completedInRange, createdInRange } = getKPIsByTimeRange();

  const avgCompletionTime = (() => {
    const completedTasks = projectTasks.filter((t) => t.completedAt && t.createdAt);
    if (completedTasks.length === 0) return 0;
    const totalDays = completedTasks.reduce((acc, t) => {
      const created = new Date(t.createdAt);
      const completed = new Date(t.completedAt!);
      return acc + Math.ceil((completed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
    }, 0);
    return Math.round(totalDays / completedTasks.length);
  })();

  const urgentTasks = projectTasks.filter((t) => t.priority === "urgent" && t.status !== "done").length;
  const inProgressTasks = projectTasks.filter((t) => t.status === "in_progress").length;
  const inReviewTasks = projectTasks.filter((t) => t.status === "in_review").length;
  const pendingTasks = projectTasks.filter((t) => t.status === "todo" || t.status === "backlog").length;
  const totalNotes = projectTasks.reduce((acc, t) => acc + (t.notes?.length || 0), 0);

  // Activity data for sparkline
  const activityData: Record<TimeRange, number[]> = {
    "24h": [2, 3, 1, 4, 2, 3, 5, 4, 3, 2],
    "7d": [8, 12, 15, 10, 18, 14, completedInRange],
    "1m": [45, 52, 48, 62, 58, 70, 65, 72, 68, 75, 80, completedInRange],
    "1y": [120, 145, 160, 180, 200, 220, 250, 280, 300, 320, 350, completedInRange],
  };

  // KPI status helper
  const getKPIStatus = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) return "good";
    if (value <= thresholds.warning) return "warning";
    return "critical";
  };

  const getKPIColor = (status: "good" | "warning" | "critical" | "neutral") => {
    switch (status) {
      case "good": return "text-[#39ff14]";
      case "warning": return "text-amber-400";
      case "critical": return "text-[#ff006e]";
      default: return "text-white";
    }
  };

  return (
    <div className="space-y-4">
      {/* Header con KPIs estilo agente */}
      <div className="flex items-center justify-between">
        {/* Left: Title and description */}
        <div className="flex items-center gap-4">
          <span className="text-3xl">☑</span>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-mono text-xl font-bold text-white">Planificador</h1>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full status-pulse" style={{ backgroundColor: currentProject.color }} />
                <span className="font-mono text-[10px] text-zinc-400">{projectTasks.length} tareas</span>
              </div>
            </div>
            <p className="font-mono text-xs text-zinc-500 italic">"Gestiona tareas y eventos"</p>
          </div>
        </div>

        {/* Right: Time Range + Sparkline + KPIs */}
        <div className="flex items-center gap-4 mr-4">
          {/* Time Range Filter */}
          <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-sm p-1">
            {(Object.keys(TIME_RANGE_LABELS) as TimeRange[]).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-2 py-1 text-[10px] font-mono rounded-sm transition-colors ${
                  timeRange === range
                    ? "bg-[#00d9ff]/20 text-[#00d9ff] border border-[#00d9ff]/30"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {TIME_RANGE_LABELS[range]}
              </button>
            ))}
          </div>

          {/* Activity Sparkline */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-sm px-3 py-2 min-w-[120px]">
            <p className="font-mono text-[9px] text-zinc-500 uppercase mb-1">Actividad</p>
            <Sparkline data={activityData[timeRange]} color="#00d9ff" height={24} />
          </div>

          {/* KPIs in boxes */}
          <div className="flex items-center gap-3">
            <div className="bg-zinc-950 border border-zinc-800 rounded-sm px-4 py-2 text-center min-w-[80px]">
              <p className={`font-mono text-lg font-bold ${getKPIColor("good")}`}>
                {completedInRange}
              </p>
              <p className="font-mono text-[9px] text-zinc-500 uppercase">Completadas</p>
            </div>
            <div className="bg-zinc-950 border border-zinc-800 rounded-sm px-4 py-2 text-center min-w-[80px]">
              <p className="font-mono text-lg font-bold text-[#00d9ff]">
                {inProgressTasks}
              </p>
              <p className="font-mono text-[9px] text-zinc-500 uppercase">En Progreso</p>
            </div>
            <div className="bg-zinc-950 border border-zinc-800 rounded-sm px-4 py-2 text-center min-w-[80px]">
              <p className="font-mono text-lg font-bold text-white">
                {pendingTasks}
              </p>
              <p className="font-mono text-[9px] text-zinc-500 uppercase">Pendientes</p>
            </div>
            <div className="bg-zinc-950 border border-zinc-800 rounded-sm px-4 py-2 text-center min-w-[80px]">
              <p className={`font-mono text-lg font-bold ${urgentTasks > 0 ? "text-[#ff006e]" : "text-[#39ff14]"}`}>
                {urgentTasks}
              </p>
              <p className="font-mono text-[9px] text-zinc-500 uppercase">Urgentes</p>
            </div>
            <div className="bg-zinc-950 border border-zinc-800 rounded-sm px-4 py-2 text-center min-w-[80px]">
              <p className="font-mono text-lg font-bold text-zinc-400">
                {totalNotes}
              </p>
              <p className="font-mono text-[9px] text-zinc-500 uppercase">Notas</p>
            </div>
            <div className="bg-zinc-950 border border-zinc-800 rounded-sm px-4 py-2 text-center min-w-[80px]">
              <p className={`font-mono text-lg font-bold ${avgCompletionTime <= 3 ? "text-[#39ff14]" : avgCompletionTime <= 5 ? "text-amber-400" : "text-[#ff006e]"}`}>
                {avgCompletionTime}d
              </p>
              <p className="font-mono text-[9px] text-zinc-500 uppercase">Tiempo Prom.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-header: Project Selector + View toggle + Actions */}
      <div className="flex items-center justify-between bg-zinc-950 border border-zinc-800 rounded-sm p-3">
        <div className="flex items-center gap-3">
          {/* Project Selector */}
          <div className="relative">
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              disabled={view === "agenda"}
              className={`appearance-none bg-zinc-900 border border-zinc-700 rounded-sm px-3 py-1.5 pr-8 font-mono text-xs focus:outline-none transition-colors ${
                view === "agenda"
                  ? "text-zinc-500 cursor-not-allowed opacity-50"
                  : "text-white cursor-pointer hover:bg-zinc-800 focus:border-[#00d9ff]"
              }`}
              style={{ borderLeft: `3px solid ${view === "agenda" ? "#52525b" : currentProject.color}` }}
            >
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={view === "agenda" ? "text-zinc-600" : "text-zinc-500"}>
                <path d="M6 9l6 6 6-6" />
              </svg>
            </div>
          </div>
          {/* Divider */}
          <div className="h-6 w-px bg-zinc-700" />
          {/* View Toggle */}
          <div className="flex items-center bg-zinc-900 rounded-sm border border-zinc-700">
            <button
              onClick={() => setView("kanban")}
              className={`px-3 py-1.5 font-mono text-xs transition-colors ${
                view === "kanban"
                  ? "bg-[#00d9ff]/20 text-[#00d9ff]"
                  : "text-zinc-500 hover:text-white"
              }`}
            >
              Kanban
            </button>
            <button
              onClick={() => setView("agenda")}
              className={`px-3 py-1.5 font-mono text-xs transition-colors ${
                view === "agenda"
                  ? "bg-[#00d9ff]/20 text-[#00d9ff]"
                  : "text-zinc-500 hover:text-white"
              }`}
            >
              Agenda
            </button>
          </div>
          <span className="font-mono text-xs text-zinc-600">
            {view === "kanban"
              ? `${projectTasks.filter(t => t.status !== "done").length} tareas activas`
              : `${reminders.length} eventos`
            }
          </span>
        </div>
        {view === "kanban" ? (
          <Button variant="primary" onClick={newTaskModal.open}>
            + Nueva Tarea
          </Button>
        ) : (
          <Button variant="primary" onClick={reminderModal.open}>
            + Nuevo Evento
          </Button>
        )}
      </div>

      {/* Main Content */}
      {view === "kanban" ? (
        <KanbanBoard
          columns={columns}
          getTasksByStatus={getTasksByStatus}
          moveTask={moveTask}
          onTaskClick={openTaskModal}
          draggedTask={draggedTask}
          setDraggedTask={setDraggedTask}
        />
      ) : (
        <AgendaView
          reminders={reminders}
          tasks={tasks}
          calendarView={calendarView}
          setCalendarView={setCalendarView}
        />
      )}

      {/* Task Detail Modal */}
      <TaskDetailModal
        task={selectedTask}
        isOpen={taskModal.isOpen}
        onClose={() => {
          taskModal.close();
          setSelectedTask(null);
        }}
        onAddNote={addNote}
        onMove={moveTask}
      />

      {/* New Task Modal */}
      <NewTaskModal
        isOpen={newTaskModal.isOpen}
        onClose={newTaskModal.close}
        projectId={selectedProjectId}
        onAdd={(task) => {
          setTasks((prev) => [task, ...prev]);
          newTaskModal.close();
        }}
      />

      {/* Reminder Modal */}
      <ReminderModal
        isOpen={reminderModal.isOpen}
        onClose={reminderModal.close}
        onAdd={(reminder) => {
          setReminders((prev) => [...prev, reminder]);
          reminderModal.close();
        }}
      />
    </div>
  );
}

// ============================================================================
// KANBAN BOARD - DRAG AND DROP
// ============================================================================

interface KanbanBoardProps {
  columns: { status: TaskStatus; title: string; color: string }[];
  getTasksByStatus: (status: TaskStatus) => Task[];
  moveTask: (taskId: string, newStatus: TaskStatus) => void;
  onTaskClick: (task: Task) => void;
  draggedTask: Task | null;
  setDraggedTask: (task: Task | null) => void;
}

function KanbanBoard({
  columns,
  getTasksByStatus,
  moveTask,
  onTaskClick,
  draggedTask,
  setDraggedTask,
}: KanbanBoardProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 min-h-[500px]">
      {columns.map((column) => (
        <KanbanColumn
          key={column.status}
          title={column.title}
          status={column.status}
          color={column.color}
          tasks={getTasksByStatus(column.status)}
          onMoveTask={moveTask}
          onTaskClick={onTaskClick}
          draggedTask={draggedTask}
          setDraggedTask={setDraggedTask}
        />
      ))}
    </div>
  );
}

interface KanbanColumnProps {
  title: string;
  status: TaskStatus;
  color: string;
  tasks: Task[];
  onMoveTask: (taskId: string, newStatus: TaskStatus) => void;
  onTaskClick: (task: Task) => void;
  draggedTask: Task | null;
  setDraggedTask: (task: Task | null) => void;
}

function KanbanColumn({
  title,
  status,
  color,
  tasks,
  onMoveTask,
  onTaskClick,
  draggedTask,
  setDraggedTask,
}: KanbanColumnProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (draggedTask && draggedTask.status !== status) {
      onMoveTask(draggedTask.id, status);
    }
    setDraggedTask(null);
  };

  const borderColor = color.startsWith("#") ? color : undefined;

  return (
    <div
      className={`flex flex-col h-full transition-all duration-200 ${
        isDragOver ? "scale-[1.02]" : ""
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div
        className="flex items-center justify-between p-3 bg-zinc-900 rounded-t-sm"
        style={{ borderTop: `3px solid ${borderColor || "#52525b"}` }}
      >
        <h3 className="font-mono text-sm font-bold text-white">{title}</h3>
        <Badge variant="default">{tasks.length}</Badge>
      </div>
      <div
        className={`flex-1 overflow-y-auto p-2 bg-zinc-950 border border-zinc-800 border-t-0 rounded-b-sm space-y-2 min-h-[400px] transition-colors ${
          isDragOver ? "bg-zinc-900/50 border-[#00d9ff]/50" : ""
        }`}
      >
        {tasks.map((task) => (
          <DraggableTaskCard
            key={task.id}
            task={task}
            onClick={() => onTaskClick(task)}
            onDragStart={() => setDraggedTask(task)}
            onDragEnd={() => setDraggedTask(null)}
            isDragging={draggedTask?.id === task.id}
          />
        ))}
        {tasks.length === 0 && (
          <div className="flex items-center justify-center h-32 text-zinc-600 font-mono text-sm">
            {isDragOver ? "Soltar aquí" : "Sin tareas"}
          </div>
        )}
      </div>
    </div>
  );
}

interface DraggableTaskCardProps {
  task: Task;
  onClick: () => void;
  onDragStart: () => void;
  onDragEnd: () => void;
  isDragging: boolean;
}

function DraggableTaskCard({
  task,
  onClick,
  onDragStart,
  onDragEnd,
  isDragging,
}: DraggableTaskCardProps) {
  const getPriorityColor = () => {
    switch (task.priority) {
      case "urgent":
        return "bg-[#ff006e]";
      case "high":
        return "bg-[#ffaa00]";
      case "medium":
        return "bg-[#00d9ff]";
      case "low":
        return "bg-zinc-500";
    }
  };

  const getPriorityLabel = () => {
    switch (task.priority) {
      case "urgent":
        return "Urgente";
      case "high":
        return "Alta";
      case "medium":
        return "Media";
      case "low":
        return "Baja";
    }
  };

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onClick}
      className={`
        group bg-zinc-900 border border-zinc-800 rounded-sm p-2
        hover:border-[#00d9ff]/50 hover:shadow-[0_0_8px_rgba(0,217,255,0.1)]
        transition-all cursor-pointer
        ${isDragging ? "opacity-50 scale-95 cursor-grabbing" : ""}
      `}
    >
      {/* Header: Priority dot + Title + Expand */}
      <div className="flex items-center gap-2">
        <div className={`w-1.5 h-1.5 rounded-full ${getPriorityColor()} flex-shrink-0`} />
        <p className="font-mono text-xs text-white truncate flex-1">{task.title}</p>
        {/* Expand indicator */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#00d9ff]">
            <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
          </svg>
        </div>
      </div>

      {/* Footer: Agent + Notes count */}
      <div className="mt-1.5 flex items-center justify-between text-[10px]">
        {task.assignedAgent ? (
          <span className="font-mono text-[#00d9ff] truncate">→ {task.assignedAgent}</span>
        ) : (
          <span className="font-mono text-zinc-600">{getPriorityLabel()}</span>
        )}
        {task.notes && task.notes.length > 0 && (
          <span className="font-mono text-zinc-500 flex items-center gap-0.5">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            {task.notes.length}
          </span>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// TASK DETAIL MODAL - Simplified with notes only
// ============================================================================

interface TaskDetailModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onAddNote: (taskId: string, note: string) => void;
  onMove: (taskId: string, newStatus: TaskStatus) => void;
}

function TaskDetailModal({
  task,
  isOpen,
  onClose,
  onAddNote,
  onMove,
}: TaskDetailModalProps) {
  if (!task) return null;

  const handleAddNote = (message: string) => {
    if (message.trim()) {
      // Prepend task context with brackets for Pascual to identify the source
      const noteWithContext = `[${task.title}] ${message.trim()}`;
      onAddNote(task.id, noteWithContext);
    }
  };

  const getPriorityColor = () => {
    switch (task.priority) {
      case "urgent": return "#ff006e";
      case "high": return "#ffaa00";
      case "medium": return "#00d9ff";
      case "low": return "#71717a";
    }
  };

  const getStatusColor = () => {
    switch (task.status) {
      case "done": return "#39ff14";
      case "in_review": return "#a855f7";
      case "in_progress": return "#00d9ff";
      case "todo": return "#ffaa00";
      case "backlog": return "#71717a";
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="bg-zinc-900 border border-zinc-800 rounded-sm overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-zinc-800 bg-zinc-950">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              {/* Status badges */}
              <div className="flex items-center gap-2 mb-3">
                <span
                  className="px-2 py-1 rounded-sm font-mono text-[10px] uppercase"
                  style={{
                    backgroundColor: `${getPriorityColor()}20`,
                    color: getPriorityColor(),
                    border: `1px solid ${getPriorityColor()}40`
                  }}
                >
                  {task.priority === "urgent" ? "⚡ Urgente" :
                   task.priority === "high" ? "↑ Alta" :
                   task.priority === "medium" ? "→ Media" : "↓ Baja"}
                </span>
                <span
                  className="px-2 py-1 rounded-sm font-mono text-[10px] uppercase"
                  style={{
                    backgroundColor: `${getStatusColor()}20`,
                    color: getStatusColor(),
                    border: `1px solid ${getStatusColor()}40`
                  }}
                >
                  {task.status === "backlog" ? "Backlog" :
                   task.status === "todo" ? "Por Hacer" :
                   task.status === "in_progress" ? "En Progreso" :
                   task.status === "in_review" ? "En Revisión" : "✓ Completado"}
                </span>
                {task.assignedAgent && (
                  <span className="px-2 py-1 rounded-sm font-mono text-[10px] bg-zinc-800 text-[#00d9ff] border border-zinc-700">
                    → {task.assignedAgent}
                  </span>
                )}
              </div>

              {/* Title */}
              <h2 className="font-mono text-lg text-white font-bold">{task.title}</h2>

              {/* Description */}
              {task.description && (
                <p className="font-mono text-sm text-zinc-400 mt-2">
                  {task.description}
                </p>
              )}

              {/* Tags */}
              {task.tags && task.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {task.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 bg-zinc-800 text-zinc-400 font-mono text-xs rounded"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Close button */}
            <button
              onClick={onClose}
              className="p-2 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-sm transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Move to column */}
          <div className="flex gap-2 mt-4">
            {columns.map((col) => (
              <button
                key={col.status}
                onClick={() => onMove(task.id, col.status)}
                disabled={task.status === col.status}
                className={`flex-1 px-3 py-1.5 font-mono text-xs rounded-sm transition-colors border ${
                  task.status === col.status
                    ? "bg-[#00d9ff]/20 text-[#00d9ff] border-[#00d9ff]/50"
                    : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 border-zinc-700"
                }`}
              >
                {col.title}
              </button>
            ))}
          </div>
        </div>

        {/* Notes Section */}
        <div className="p-4 max-h-[50vh] overflow-y-auto bg-zinc-950">
          <div className="flex items-center gap-2 mb-3">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-zinc-500">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <span className="font-mono text-sm text-zinc-400">
              Notas {task.notes && task.notes.length > 0 && `(${task.notes.length})`}
            </span>
          </div>

          {/* Notes List */}
          <div className="space-y-2 mb-4">
            {task.notes && task.notes.length > 0 ? (
              task.notes.map((note) => (
                <div
                  key={note.id}
                  className="p-3 bg-zinc-900 border border-zinc-800 rounded-sm"
                >
                  <p className="font-mono text-sm text-white">{note.content}</p>
                  <p className="font-mono text-[10px] text-zinc-600 mt-2">
                    {formatDate(note.createdAt)}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center py-8 bg-zinc-900 border border-zinc-800 rounded-sm">
                <span className="text-2xl mb-2 block">📝</span>
                <p className="font-mono text-sm text-zinc-500">Sin notas todavía</p>
              </div>
            )}
          </div>

          {/* Add Note Input - Using PascualInput with task prefix */}
          <div className="border-t border-zinc-800 pt-4">
            <div className="font-mono text-[10px] text-zinc-600 mb-2">
              Contexto: <span className="text-[#00d9ff]">[{task.title}]</span>
            </div>
            <PascualInput
              placeholder="Escribe una nota..."
              onSend={handleAddNote}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-zinc-800 flex items-center justify-between bg-zinc-900">
          <div className="font-mono text-[10px] text-zinc-600">
            Creada: {task.createdAt}
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// ============================================================================
// NEW TASK MODAL
// ============================================================================

interface NewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (task: Task) => void;
  projectId: string;
}

function NewTaskModal({ isOpen, onClose, onAdd, projectId }: NewTaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [assignedAgent, setAssignedAgent] = useState("");

  const handleSubmit = () => {
    if (!title.trim()) return;

    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: title.trim(),
      description: description.trim() || undefined,
      status: "todo",
      priority,
      assignedAgent: assignedAgent || undefined,
      createdAt: new Date().toISOString().split("T")[0],
      projectId,
    };

    onAdd(newTask);

    // Reset form
    setTitle("");
    setDescription("");
    setPriority("medium");
    setAssignedAgent("");
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <div className="bg-zinc-900 border border-zinc-800 rounded-sm">
        <ModalHeader showClose onClose={onClose}>
          <h2 className="font-mono text-lg text-white">Nueva Tarea</h2>
        </ModalHeader>

        <ModalBody className="space-y-4">
          <div>
            <label className="block font-mono text-xs text-zinc-500 mb-2">
              Título *
            </label>
            <Input
              placeholder="Título de la tarea"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="block font-mono text-xs text-zinc-500 mb-2">
              Descripción
            </label>
            <textarea
              placeholder="Descripción opcional..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-sm font-mono text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#00d9ff] min-h-[80px] resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-mono text-xs text-zinc-500 mb-2">
                Prioridad
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-sm font-mono text-sm text-white focus:outline-none focus:border-[#00d9ff]"
              >
                <option value="low">Baja</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
                <option value="urgent">Urgente</option>
              </select>
            </div>

            <div>
              <label className="block font-mono text-xs text-zinc-500 mb-2">
                Asignar a
              </label>
              <select
                value={assignedAgent}
                onChange={(e) => setAssignedAgent(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-sm font-mono text-sm text-white focus:outline-none focus:border-[#00d9ff]"
              >
                <option value="">Sin asignar</option>
                <option value="Asistente">Asistente</option>
                <option value="Nexus">Nexus</option>
                <option value="Sentinel">Sentinel</option>
                <option value="Scout">Scout</option>
                <option value="Audiovisual">Audiovisual</option>
                <option value="Consultor">Consultor</option>
                <option value="Gambito">Gambito</option>
                <option value="Cóndor360">Cóndor360</option>
                <option value="Optimus">Optimus</option>
              </select>
            </div>
          </div>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={!title.trim()}>
            Crear Tarea
          </Button>
        </ModalFooter>
      </div>
    </Modal>
  );
}

// ============================================================================
// AGENDA VIEW WITH CALENDAR
// ============================================================================

interface AgendaViewProps {
  reminders: Reminder[];
  tasks: Task[];
  calendarView: CalendarView;
  setCalendarView: (view: CalendarView) => void;
}

function AgendaView({
  reminders,
  tasks,
  calendarView,
  setCalendarView,
}: AgendaViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getWeekDays = () => {
    const days = [];
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const getMonthDays = () => {
    const days = [];
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Add padding for days before the first day of the month
    const startPadding = firstDay.getDay();
    for (let i = 0; i < startPadding; i++) {
      const day = new Date(year, month, -startPadding + i + 1);
      days.push({ date: day, isCurrentMonth: false });
    }

    // Add days of the month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }

    // Add padding for days after the last day of the month
    const endPadding = 42 - days.length; // 6 rows * 7 days
    for (let i = 1; i <= endPadding; i++) {
      days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
    }

    return days;
  };

  const getRemindersByDate = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0];
    return reminders.filter((r) => r.date === dateStr);
  };

  const getTasksDueOnDate = (_date: Date) => {
    // Tasks no longer have due dates
    return [] as Task[];
  };

  const navigateCalendar = (direction: number) => {
    const newDate = new Date(currentDate);
    if (calendarView === "week") {
      newDate.setDate(newDate.getDate() + direction * 7);
    } else {
      newDate.setMonth(newDate.getMonth() + direction);
    }
    setCurrentDate(newDate);
  };

  const formatDateRange = () => {
    if (calendarView === "week") {
      const days = getWeekDays();
      const start = days[0];
      const end = days[6];
      return `${start.toLocaleDateString("es-ES", { day: "numeric", month: "short" })} - ${end.toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })}`;
    } else {
      return currentDate.toLocaleDateString("es-ES", { month: "long", year: "numeric" });
    }
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const getTypeColor = (type: Reminder["type"]) => {
    switch (type) {
      case "meeting": return "#00d9ff";
      case "deadline": return "#ff006e";
      case "reminder": return "#ffaa00";
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Calendar */}
      <div className="lg:col-span-2">
        <Card>
          <CardBody className="p-0">
            {/* Calendar Header */}
            <div className="flex items-center justify-between p-4 border-b border-zinc-800">
              <div className="flex items-center gap-4">
                <h3 className="font-mono text-lg text-white capitalize">
                  {formatDateRange()}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                {/* View Toggle */}
                <div className="flex items-center bg-zinc-800 rounded-sm">
                  <button
                    onClick={() => setCalendarView("week")}
                    className={`px-3 py-1.5 font-mono text-xs transition-colors ${
                      calendarView === "week"
                        ? "bg-zinc-700 text-white"
                        : "text-zinc-500 hover:text-white"
                    }`}
                  >
                    Semana
                  </button>
                  <button
                    onClick={() => setCalendarView("month")}
                    className={`px-3 py-1.5 font-mono text-xs transition-colors ${
                      calendarView === "month"
                        ? "bg-zinc-700 text-white"
                        : "text-zinc-500 hover:text-white"
                    }`}
                  >
                    Mes
                  </button>
                </div>
                {/* Navigation */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => navigateCalendar(-1)}
                    className="p-2 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-sm transition-colors"
                  >
                    ←
                  </button>
                  <button
                    onClick={() => setCurrentDate(new Date())}
                    className="px-3 py-1.5 font-mono text-xs text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-sm transition-colors"
                  >
                    Hoy
                  </button>
                  <button
                    onClick={() => navigateCalendar(1)}
                    className="p-2 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-sm transition-colors"
                  >
                    →
                  </button>
                </div>
              </div>
            </div>

            {/* Week Days Header */}
            <div className="grid grid-cols-7 border-b border-zinc-800">
              {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((day) => (
                <div
                  key={day}
                  className="p-2 text-center font-mono text-xs text-zinc-500"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            {calendarView === "week" ? (
              <div className="grid grid-cols-7 min-h-[400px]">
                {getWeekDays().map((date, index) => {
                  const dayReminders = getRemindersByDate(date);
                  const dayTasks = getTasksDueOnDate(date);

                  return (
                    <div
                      key={index}
                      className={`p-2 border-r border-zinc-800 last:border-r-0 ${
                        isToday(date) ? "bg-zinc-900" : ""
                      }`}
                    >
                      <div className={`text-center mb-2 ${
                        isToday(date)
                          ? "w-8 h-8 mx-auto rounded-full bg-[#00d9ff] text-black flex items-center justify-center font-bold"
                          : ""
                      }`}>
                        <span className="font-mono text-sm">
                          {date.getDate()}
                        </span>
                      </div>
                      <div className="space-y-1">
                        {dayReminders.slice(0, 3).map((r) => (
                          <div
                            key={r.id}
                            className="px-1.5 py-1 rounded-sm text-xs font-mono truncate"
                            style={{ backgroundColor: `${getTypeColor(r.type)}20`, color: getTypeColor(r.type) }}
                          >
                            {r.time && <span className="opacity-70">{r.time} </span>}
                            {r.title}
                          </div>
                        ))}
                        {dayTasks.slice(0, 2).map((t) => (
                          <div
                            key={t.id}
                            className="px-1.5 py-1 bg-zinc-800 rounded-sm text-xs font-mono text-zinc-300 truncate"
                          >
                            {t.title}
                          </div>
                        ))}
                        {(dayReminders.length + dayTasks.length) > 5 && (
                          <div className="text-center font-mono text-[10px] text-zinc-500">
                            +{dayReminders.length + dayTasks.length - 5} más
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="grid grid-cols-7">
                {getMonthDays().map(({ date, isCurrentMonth }, index) => {
                  const dayReminders = getRemindersByDate(date);
                  const dayTasks = getTasksDueOnDate(date);
                  const hasEvents = dayReminders.length > 0 || dayTasks.length > 0;

                  return (
                    <div
                      key={index}
                      className={`p-2 min-h-[80px] border-b border-r border-zinc-800 ${
                        !isCurrentMonth ? "opacity-40" : ""
                      } ${isToday(date) ? "bg-zinc-900" : ""}`}
                    >
                      <div className={`text-center mb-1 ${
                        isToday(date)
                          ? "w-6 h-6 mx-auto rounded-full bg-[#00d9ff] text-black flex items-center justify-center font-bold text-xs"
                          : ""
                      }`}>
                        <span className="font-mono text-xs">
                          {date.getDate()}
                        </span>
                      </div>
                      {hasEvents && (
                        <div className="flex justify-center gap-0.5 mt-1">
                          {dayReminders.length > 0 && (
                            <div
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ backgroundColor: getTypeColor(dayReminders[0].type) }}
                            />
                          )}
                          {dayTasks.length > 0 && (
                            <div className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Sidebar - Today's Events */}
      <div>
        <Card>
          <CardBody className="p-0">
            <div className="p-4 border-b border-zinc-800">
              <h3 className="font-mono text-sm text-white">Hoy</h3>
            </div>
            <div className="divide-y divide-zinc-800 max-h-[400px] overflow-y-auto">
              {reminders
                .filter((r) => r.date === new Date().toISOString().split("T")[0])
                .sort((a, b) => (a.time || "").localeCompare(b.time || ""))
                .map((r) => (
                  <div
                    key={r.id}
                    className="p-3 flex items-center gap-3 hover:bg-zinc-900/50 transition-colors"
                  >
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: getTypeColor(r.type) }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-sm text-white truncate">{r.title}</p>
                      <p className="font-mono text-xs text-zinc-500 capitalize">{r.type}</p>
                    </div>
                    {r.time && (
                      <span className="font-mono text-xs text-[#00d9ff]">{r.time}</span>
                    )}
                  </div>
                ))}
              {reminders.filter((r) => r.date === new Date().toISOString().split("T")[0]).length === 0 && (
                <div className="p-8 text-center font-mono text-sm text-zinc-500">
                  Sin eventos para hoy
                </div>
              )}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

// ============================================================================
// REMINDER MODAL
// ============================================================================

interface ReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (reminder: Reminder) => void;
}

function ReminderModal({ isOpen, onClose, onAdd }: ReminderModalProps) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [type, setType] = useState<Reminder["type"]>("reminder");
  const [description, setDescription] = useState("");

  const handleSubmit = () => {
    if (!title.trim() || !date) return;

    const newReminder: Reminder = {
      id: `reminder-${Date.now()}`,
      title: title.trim(),
      date,
      time: time || undefined,
      type,
      description: description.trim() || undefined,
    };

    onAdd(newReminder);

    // Reset form
    setTitle("");
    setDate("");
    setTime("");
    setType("reminder");
    setDescription("");
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <div className="bg-zinc-900 border border-zinc-800 rounded-sm">
        <ModalHeader showClose onClose={onClose}>
          <h2 className="font-mono text-lg text-white">Nuevo Recordatorio</h2>
        </ModalHeader>

        <ModalBody className="space-y-4">
          <div>
            <label className="block font-mono text-xs text-zinc-500 mb-2">
              Título *
            </label>
            <Input
              placeholder="Título del recordatorio"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="block font-mono text-xs text-zinc-500 mb-2">
              Tipo
            </label>
            <div className="flex gap-2">
              {[
                { value: "reminder", label: "Recordatorio" },
                { value: "meeting", label: "Reunión" },
                { value: "deadline", label: "Fecha límite" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setType(opt.value as Reminder["type"])}
                  className={`flex-1 px-3 py-1.5 font-mono text-xs rounded-sm transition-colors ${
                    type === opt.value
                      ? "bg-zinc-700 text-white"
                      : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-mono text-xs text-zinc-500 mb-2">
                Fecha *
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-sm font-mono text-sm text-white focus:outline-none focus:border-[#00d9ff]"
              />
            </div>

            <div>
              <label className="block font-mono text-xs text-zinc-500 mb-2">
                Hora (24h)
              </label>
              <input
                type="text"
                placeholder="14:30"
                value={time}
                onChange={(e) => {
                  // Only allow numbers and colon, max format HH:MM
                  const val = e.target.value.replace(/[^0-9:]/g, '');
                  if (val.length <= 5) setTime(val);
                }}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-sm font-mono text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#00d9ff]"
              />
            </div>
          </div>

          <div>
            <label className="block font-mono text-xs text-zinc-500 mb-2">
              Descripción
            </label>
            <textarea
              placeholder="Descripción opcional..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-sm font-mono text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#00d9ff] min-h-[60px] resize-none"
            />
          </div>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={!title.trim() || !date}>
            Crear Recordatorio
          </Button>
        </ModalFooter>
      </div>
    </Modal>
  );
}
