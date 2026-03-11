// ============================================================================
// ASISTENTE - Tipos
// ============================================================================

import { ModuleBase, Priority } from "../../types/base";

export interface AsistenteMetrics {
  tasksToday: number;
  tasksCompleted: number;
  tasksPending: number;
  weeklyCompletionRate: number;
  suggestionsGenerated: number;
  suggestionsAccepted: number;
  proactiveAccuracy: number;
  pantryLevel: number;
  cleaningSuppliesLevel: number;
  maintenanceStatus: "ok" | "attention" | "urgent";
  userSatisfaction: number;
  nextReminder: string;
}

export interface ScheduleEvent {
  id: string;
  time: string;
  title: string;
  completed: boolean;
  type: "work" | "personal" | "health" | "family";
}

export interface Task {
  id: string;
  title: string;
  status: "completed" | "pending" | "in_progress";
  priority: Priority;
  dueDate?: string;
}

export interface ProactiveSuggestion {
  id: string;
  text: string;
  source: "chronos" | "proactive" | "domus";
  confidence: number;
}

export interface AsistenteData extends ModuleBase {
  metrics: AsistenteMetrics;
  todaySchedule: ScheduleEvent[];
  tasks: Task[];
  suggestions: ProactiveSuggestion[];
  upcomingPurchases: string[];
}
