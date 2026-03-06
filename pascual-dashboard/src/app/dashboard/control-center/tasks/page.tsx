"use client";

import { useState } from "react";
import { PageHeader, Section } from "@/components/layout/MainContent";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { PascualInputButton } from "@/components/pascual";

type TaskStatus = "queued" | "in_progress" | "review" | "done";
type Priority = "critical" | "high" | "medium" | "low";

interface Task {
  id: string;
  title: string;
  description: string;
  agentId: string;
  agentName: string;
  status: TaskStatus;
  priority: Priority;
  createdAt: string;
  subAgentName?: string;
}

const AGENTS = [
  { id: "all", name: "All Agents" },
  { id: "asistente", name: "Asistente" },
  { id: "nexus", name: "Nexus" },
  { id: "sentinel", name: "Sentinel" },
  { id: "scout", name: "Scout" },
  { id: "audiovisual", name: "Audiovisual" },
  { id: "consultor", name: "Consultor" },
  { id: "gambito", name: "Gambito" },
  { id: "condor360", name: "Cóndor360" },
  { id: "optimus", name: "Optimus" },
];

const mockTasks: Task[] = [
  // Queued
  { id: "234", title: "Code Review PR #456", description: "Review authentication module changes", agentId: "nexus", agentName: "Nexus", subAgentName: "Explorer", status: "queued", priority: "high", createdAt: "10m ago" },
  { id: "235", title: "Analyze Match Data", description: "Process LaLiga weekend results", agentId: "gambito", agentName: "Gambito", subAgentName: "Analyst", status: "queued", priority: "medium", createdAt: "15m ago" },
  { id: "236", title: "Generate Report", description: "Monthly security audit report", agentId: "sentinel", agentName: "Sentinel", subAgentName: "Monitor", status: "queued", priority: "low", createdAt: "20m ago" },
  { id: "237", title: "Fetch Market Data", description: "Update stock prices for portfolio", agentId: "condor360", agentName: "Cóndor360", subAgentName: "Cuantificador", status: "queued", priority: "high", createdAt: "25m ago" },
  { id: "238", title: "Schedule Reminder", description: "Set up weekly review notification", agentId: "asistente", agentName: "Asistente", subAgentName: "Chronos", status: "queued", priority: "low", createdAt: "30m ago" },

  // In Progress
  { id: "231", title: "Data Extraction", description: "Extract news from financial sources", agentId: "scout", agentName: "Scout", subAgentName: "Harvester", status: "in_progress", priority: "medium", createdAt: "5m ago" },
  { id: "232", title: "Portfolio Rebalance", description: "Calculate optimal portfolio weights", agentId: "condor360", agentName: "Cóndor360", subAgentName: "Estratega", status: "in_progress", priority: "high", createdAt: "8m ago" },
  { id: "233", title: "Model Training", description: "Update Poisson regression model", agentId: "gambito", agentName: "Gambito", subAgentName: "Optimizer", status: "in_progress", priority: "medium", createdAt: "12m ago" },

  // Review
  { id: "228", title: "Security Patch", description: "Apply CVE-2024-1234 fix", agentId: "sentinel", agentName: "Sentinel", subAgentName: "Cipher", status: "review", priority: "critical", createdAt: "1h ago" },
  { id: "229", title: "Video Processing", description: "Render promotional video", agentId: "audiovisual", agentName: "Audiovisual", subAgentName: "Video", status: "review", priority: "medium", createdAt: "2h ago" },

  // Done
  { id: "225", title: "Deploy v2.3.1", description: "Production deployment completed", agentId: "nexus", agentName: "Nexus", subAgentName: "Implementador", status: "done", priority: "high", createdAt: "3h ago" },
  { id: "224", title: "Backup Database", description: "Weekly backup completed", agentId: "sentinel", agentName: "Sentinel", subAgentName: "Guardian", status: "done", priority: "medium", createdAt: "4h ago" },
  { id: "223", title: "API Integration", description: "Connected NewsAPI endpoint", agentId: "scout", agentName: "Scout", subAgentName: "Hunter", status: "done", priority: "low", createdAt: "5h ago" },
];

const COLUMNS: { status: TaskStatus; title: string; color: string }[] = [
  { status: "queued", title: "Queued", color: "text-zinc-400" },
  { status: "in_progress", title: "In Progress", color: "text-[#00d9ff]" },
  { status: "review", title: "Review", color: "text-amber-400" },
  { status: "done", title: "Done", color: "text-[#39ff14]" },
];

export default function TaskQueuePage() {
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [filterAgent, setFilterAgent] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTasks = tasks.filter(task => {
    if (filterAgent !== "all" && task.agentId !== filterAgent) return false;
    if (filterPriority !== "all" && task.priority !== filterPriority) return false;
    if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const getTasksByStatus = (status: TaskStatus) =>
    filteredTasks.filter(task => task.status === status);

  const getPriorityStyles = (priority: Priority) => {
    switch (priority) {
      case "critical": return { bg: "bg-pink-950/50", border: "border-[#ff006e]", dot: "bg-[#ff006e]" };
      case "high": return { bg: "bg-amber-950/30", border: "border-amber-500/50", dot: "bg-amber-400" };
      case "medium": return { bg: "bg-zinc-800/50", border: "border-zinc-700", dot: "bg-[#00d9ff]" };
      case "low": return { bg: "bg-zinc-900", border: "border-zinc-800", dot: "bg-zinc-500" };
    }
  };

  const moveTask = (taskId: string, newStatus: TaskStatus) => {
    setTasks(prev => prev.map(task =>
      task.id === taskId ? { ...task, status: newStatus } : task
    ));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Task Queue"
        description="Gestiona las tareas de todos los agentes del ecosistema"
        actions={
          <PascualInputButton
            label="New Task"
            placeholder="Describe la nueva tarea para Pascual..."
            context="tasks"
          />
        }
      />

      {/* Filters */}
      <Section>
        <Card>
          <CardBody className="py-3">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select
                options={AGENTS.map(a => ({ value: a.id, label: a.name }))}
                value={filterAgent}
                onChange={(e) => setFilterAgent(e.target.value)}
                className="w-40"
              />
              <Select
                options={[
                  { value: "all", label: "All Priorities" },
                  { value: "critical", label: "Critical" },
                  { value: "high", label: "High" },
                  { value: "medium", label: "Medium" },
                  { value: "low", label: "Low" },
                ]}
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="w-36"
              />
              <Button variant="ghost" onClick={() => { setFilterAgent("all"); setFilterPriority("all"); setSearchQuery(""); }}>
                Clear
              </Button>
            </div>
          </CardBody>
        </Card>
      </Section>

      {/* Kanban Board */}
      <Section>
        <div className="grid grid-cols-4 gap-4">
          {COLUMNS.map((column) => {
            const columnTasks = getTasksByStatus(column.status);
            return (
              <div key={column.status} className="flex flex-col">
                {/* Column Header */}
                <div className="flex items-center justify-between mb-3 px-2">
                  <div className="flex items-center gap-2">
                    <span className={`font-mono text-sm uppercase ${column.color}`}>
                      {column.title}
                    </span>
                    <Badge variant={column.status === "done" ? "success" : "default"}>
                      {columnTasks.length}
                    </Badge>
                  </div>
                </div>

                {/* Column Content */}
                <div className="flex-1 bg-zinc-900/50 rounded-sm border border-zinc-800 p-2 min-h-[500px] space-y-2">
                  {columnTasks.map((task) => {
                    const priorityStyles = getPriorityStyles(task.priority);
                    return (
                      <Card
                        key={task.id}
                        className={`${priorityStyles.bg} border ${priorityStyles.border} hover:border-zinc-600 transition-all cursor-grab active:cursor-grabbing`}
                      >
                        <CardBody className="p-3 space-y-2">
                          {/* Task Header */}
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-mono text-xs text-zinc-500">#{task.id}</span>
                            <div className={`w-2 h-2 rounded-full ${priorityStyles.dot}`} title={task.priority} />
                          </div>

                          {/* Task Title */}
                          <p className="font-mono text-sm text-white leading-tight">{task.title}</p>

                          {/* Task Description */}
                          <p className="font-mono text-[10px] text-zinc-500 line-clamp-2">{task.description}</p>

                          {/* Task Meta */}
                          <div className="flex items-center justify-between pt-1">
                            <div className="flex items-center gap-1">
                              <Badge variant="info" className="text-[9px] px-1.5 py-0">
                                {task.agentName}
                              </Badge>
                              {task.subAgentName && (
                                <span className="font-mono text-[9px] text-zinc-600">
                                  / {task.subAgentName}
                                </span>
                              )}
                            </div>
                            <span className="font-mono text-[9px] text-zinc-600">{task.createdAt}</span>
                          </div>

                          {/* Quick Actions */}
                          {column.status !== "done" && (
                            <div className="flex gap-1 pt-1">
                              {column.status === "queued" && (
                                <button
                                  onClick={() => moveTask(task.id, "in_progress")}
                                  className="flex-1 text-[9px] font-mono py-1 px-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-sm transition-colors"
                                >
                                  ▶ Start
                                </button>
                              )}
                              {column.status === "in_progress" && (
                                <button
                                  onClick={() => moveTask(task.id, "review")}
                                  className="flex-1 text-[9px] font-mono py-1 px-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-sm transition-colors"
                                >
                                  ↗ Review
                                </button>
                              )}
                              {column.status === "review" && (
                                <button
                                  onClick={() => moveTask(task.id, "done")}
                                  className="flex-1 text-[9px] font-mono py-1 px-2 bg-green-950 hover:bg-green-900 text-[#39ff14] rounded-sm transition-colors"
                                >
                                  ✓ Complete
                                </button>
                              )}
                            </div>
                          )}
                        </CardBody>
                      </Card>
                    );
                  })}

                  {columnTasks.length === 0 && (
                    <div className="flex items-center justify-center h-32 text-zinc-600 font-mono text-xs">
                      No tasks
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      {/* Stats Footer */}
      <Section>
        <Card>
          <CardBody className="py-3">
            <div className="flex items-center justify-between font-mono text-xs">
              <div className="flex items-center gap-6">
                <span className="text-zinc-500">
                  Total: <span className="text-white">{filteredTasks.length}</span> tasks
                </span>
                <span className="text-zinc-500">
                  Critical: <span className="text-[#ff006e]">{filteredTasks.filter(t => t.priority === "critical").length}</span>
                </span>
                <span className="text-zinc-500">
                  High: <span className="text-amber-400">{filteredTasks.filter(t => t.priority === "high").length}</span>
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-zinc-500">
                  Completion rate: <span className="text-[#39ff14]">94.2%</span>
                </span>
                <span className="text-zinc-500">
                  Avg. time: <span className="text-[#00d9ff]">2.4h</span>
                </span>
              </div>
            </div>
          </CardBody>
        </Card>
      </Section>
    </div>
  );
}
