"use client";

import { useState } from "react";
import { PageHeader, Section, SectionHeader, Grid } from "@/components/layout/MainContent";
import { Card, CardHeader, CardBody, CardFooter } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

type TaskStatus = "backlog" | "todo" | "in_progress" | "done";
type TaskPriority = "low" | "medium" | "high" | "urgent";

interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedAgent?: string;
  dueDate?: string;
}

const initialTasks: Task[] = [
  {
    id: "1",
    title: "Research market trends",
    description: "Analyze Q4 financial data",
    status: "done",
    priority: "high",
    assignedAgent: "Oracle",
  },
  {
    id: "2",
    title: "Security audit",
    description: "Run weekly security scan",
    status: "in_progress",
    priority: "urgent",
    assignedAgent: "Sentinel",
  },
  {
    id: "3",
    title: "Update documentation",
    description: "API documentation needs update",
    status: "in_progress",
    priority: "medium",
    assignedAgent: "Nexus",
  },
  {
    id: "4",
    title: "Calendar optimization",
    description: "Reorganize meeting schedules",
    status: "todo",
    priority: "medium",
    assignedAgent: "Scout",
  },
  {
    id: "5",
    title: "Code review",
    description: "Review latest PR submissions",
    status: "todo",
    priority: "high",
    assignedAgent: "Forge",
  },
  {
    id: "6",
    title: "Data backup",
    status: "backlog",
    priority: "low",
  },
  {
    id: "7",
    title: "Performance optimization",
    status: "backlog",
    priority: "medium",
  },
];

interface CalendarEvent {
  id: string;
  title: string;
  time: string;
  type: "meeting" | "task" | "reminder";
}

const todayEvents: CalendarEvent[] = [
  { id: "1", title: "Team standup", time: "09:00", type: "meeting" },
  { id: "2", title: "Security scan", time: "10:30", type: "task" },
  { id: "3", title: "Lunch break", time: "12:00", type: "reminder" },
  { id: "4", title: "Market analysis review", time: "14:00", type: "meeting" },
  { id: "5", title: "Code deployment", time: "16:00", type: "task" },
  { id: "6", title: "Daily report", time: "17:30", type: "reminder" },
];

const columns: { status: TaskStatus; title: string }[] = [
  { status: "backlog", title: "Backlog" },
  { status: "todo", title: "To Do" },
  { status: "in_progress", title: "In Progress" },
  { status: "done", title: "Done" },
];

export default function AssistantPage() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [view, setView] = useState<"kanban" | "agenda">("kanban");

  const getTasksByStatus = (status: TaskStatus) =>
    tasks.filter((task) => task.status === status);

  const moveTask = (taskId: string, newStatus: TaskStatus) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assistant"
        description="Manage tasks and schedule"
        actions={
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-zinc-900 rounded-sm">
              <button
                onClick={() => setView("kanban")}
                className={`px-3 py-1.5 font-mono text-sm transition-colors ${
                  view === "kanban"
                    ? "bg-cyan-950 text-[#00d9ff]"
                    : "text-zinc-500 hover:text-white"
                }`}
              >
                Kanban
              </button>
              <button
                onClick={() => setView("agenda")}
                className={`px-3 py-1.5 font-mono text-sm transition-colors ${
                  view === "agenda"
                    ? "bg-cyan-950 text-[#00d9ff]"
                    : "text-zinc-500 hover:text-white"
                }`}
              >
                Agenda
              </button>
            </div>
            <Button variant="primary">+ Add Task</Button>
          </div>
        }
      />

      {view === "kanban" ? (
        <KanbanBoard
          columns={columns}
          getTasksByStatus={getTasksByStatus}
          moveTask={moveTask}
        />
      ) : (
        <AgendaView events={todayEvents} />
      )}
    </div>
  );
}

function KanbanBoard({
  columns,
  getTasksByStatus,
  moveTask,
}: {
  columns: { status: TaskStatus; title: string }[];
  getTasksByStatus: (status: TaskStatus) => Task[];
  moveTask: (taskId: string, newStatus: TaskStatus) => void;
}) {
  return (
    <div className="grid grid-cols-4 gap-4 h-[calc(100vh-220px)] overflow-hidden">
      {columns.map((column) => (
        <KanbanColumn
          key={column.status}
          title={column.title}
          status={column.status}
          tasks={getTasksByStatus(column.status)}
          onMoveTask={moveTask}
          allStatuses={columns.map((c) => c.status)}
        />
      ))}
    </div>
  );
}

function KanbanColumn({
  title,
  status,
  tasks,
  onMoveTask,
  allStatuses,
}: {
  title: string;
  status: TaskStatus;
  tasks: Task[];
  onMoveTask: (taskId: string, newStatus: TaskStatus) => void;
  allStatuses: TaskStatus[];
}) {
  const getStatusColor = () => {
    switch (status) {
      case "backlog":
        return "border-zinc-700";
      case "todo":
        return "border-[#ffaa00]";
      case "in_progress":
        return "border-[#00d9ff]";
      case "done":
        return "border-[#39ff14]";
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div
        className={`flex items-center justify-between p-3 border-t-2 ${getStatusColor()} bg-zinc-900 rounded-t-sm`}
      >
        <h3 className="font-mono text-sm font-bold text-white">{title}</h3>
        <Badge variant="default">{tasks.length}</Badge>
      </div>
      <div className="flex-1 overflow-y-auto p-2 bg-zinc-950 border border-zinc-800 border-t-0 rounded-b-sm space-y-2">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onMove={onMoveTask}
            allStatuses={allStatuses}
          />
        ))}
      </div>
    </div>
  );
}

function TaskCard({
  task,
  onMove,
  allStatuses,
}: {
  task: Task;
  onMove: (taskId: string, newStatus: TaskStatus) => void;
  allStatuses: TaskStatus[];
}) {
  const [showMoveMenu, setShowMoveMenu] = useState(false);

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

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-sm p-3 hover:border-zinc-700 transition-colors group relative">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <div className={`w-2 h-2 rounded-full ${getPriorityColor()}`} />
            <span className="font-mono text-xs text-zinc-500 uppercase">
              {task.priority}
            </span>
          </div>
          <p className="font-mono text-sm text-white">{task.title}</p>
          {task.description && (
            <p className="font-mono text-xs text-zinc-500 mt-1">
              {task.description}
            </p>
          )}
        </div>
        <button
          onClick={() => setShowMoveMenu(!showMoveMenu)}
          className="text-zinc-600 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
        >
          ⋮
        </button>
      </div>

      {task.assignedAgent && (
        <div className="mt-2 pt-2 border-t border-zinc-800 flex items-center justify-between">
          <span className="font-mono text-xs text-[#00d9ff]">
            {task.assignedAgent}
          </span>
          {task.dueDate && (
            <span className="font-mono text-xs text-zinc-600">
              {task.dueDate}
            </span>
          )}
        </div>
      )}

      {showMoveMenu && (
        <div className="absolute right-0 top-full mt-1 bg-zinc-900 border border-zinc-800 rounded-sm shadow-lg z-10">
          {allStatuses
            .filter((s) => s !== task.status)
            .map((status) => (
              <button
                key={status}
                onClick={() => {
                  onMove(task.id, status);
                  setShowMoveMenu(false);
                }}
                className="block w-full px-4 py-2 text-left font-mono text-xs text-zinc-300 hover:bg-zinc-800 transition-colors"
              >
                Move to {status.replace("_", " ")}
              </button>
            ))}
        </div>
      )}
    </div>
  );
}

function AgendaView({ events }: { events: CalendarEvent[] }) {
  const getEventTypeColor = (type: CalendarEvent["type"]) => {
    switch (type) {
      case "meeting":
        return "border-l-[#00d9ff]";
      case "task":
        return "border-l-[#39ff14]";
      case "reminder":
        return "border-l-[#ffaa00]";
    }
  };

  const getEventTypeIcon = (type: CalendarEvent["type"]) => {
    switch (type) {
      case "meeting":
        return "◎";
      case "task":
        return "☑";
      case "reminder":
        return "⚑";
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Today's Schedule */}
      <div className="lg:col-span-2">
        <Section>
          <SectionHeader title="Today's Schedule" />
          <Card>
            <CardBody className="p-0">
              <div className="divide-y divide-zinc-800">
                {events.map((event) => (
                  <div
                    key={event.id}
                    className={`p-4 border-l-2 ${getEventTypeColor(event.type)} hover:bg-zinc-900/50 transition-colors`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-lg text-zinc-500">
                          {getEventTypeIcon(event.type)}
                        </span>
                        <div>
                          <p className="font-mono text-sm text-white">
                            {event.title}
                          </p>
                          <p className="font-mono text-xs text-zinc-500 capitalize">
                            {event.type}
                          </p>
                        </div>
                      </div>
                      <span className="font-mono text-sm text-[#00d9ff]">
                        {event.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </Section>
      </div>

      {/* Quick Add */}
      <div>
        <Section>
          <SectionHeader title="Quick Add" />
          <Card>
            <CardBody className="space-y-3">
              <Input placeholder="Task title" />
              <Input placeholder="Description (optional)" />
              <div className="grid grid-cols-2 gap-2">
                <Button variant="primary" fullWidth>
                  Add Task
                </Button>
                <Button variant="ghost" fullWidth>
                  Add Event
                </Button>
              </div>
            </CardBody>
          </Card>
        </Section>

        <Section>
          <SectionHeader title="Summary" />
          <Card>
            <CardBody className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-mono text-sm text-zinc-400">
                  Meetings
                </span>
                <span className="font-mono text-sm text-white">2</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-mono text-sm text-zinc-400">Tasks</span>
                <span className="font-mono text-sm text-white">2</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-mono text-sm text-zinc-400">
                  Reminders
                </span>
                <span className="font-mono text-sm text-white">2</span>
              </div>
            </CardBody>
          </Card>
        </Section>
      </div>
    </div>
  );
}
