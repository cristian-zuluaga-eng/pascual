// ============================================================================
// ASISTENTE - Mock Data
// ============================================================================

import { DeepPartial, mergeWithDefaults } from "../../types/base";
import { AsistenteData } from "./types";

const defaultAsistenteData: AsistenteData = {
  id: "asistente",
  name: "Asistente",
  icon: "👤",
  lema: "Organizacion proactiva, vida simplificada",
  description: "Gestor Personal Inteligente - Orquestacion de sistemas para gestion personal",
  status: "active",
  lastSync: "hace 2s",
  quickActions: [
    { id: "plan-day", label: "Planificar mi dia", icon: "📅", prompt: "Pascual, ayudame a organizar mi dia de hoy" },
    { id: "reminder", label: "Recordatorio", icon: "⏰", prompt: "Pascual, necesito un recordatorio para..." },
    { id: "shopping", label: "Lista de compras", icon: "🛒", prompt: "Pascual, genera una lista de compras basada en mi inventario" },
    { id: "routine", label: "Optimizar rutina", icon: "🔄", prompt: "Pascual, analiza mi rutina y sugiere mejoras" },
  ],
  recentMessages: [
    { id: "1", timestamp: "hace 5m", moduleId: "asistente", query: "¿Que tengo pendiente hoy?", response: "Tienes 3 reuniones y 5 tareas pendientes. La primera reunion es a las 09:00.", confidence: 0.95 },
  ],
  metrics: {
    tasksToday: 12,
    tasksCompleted: 7,
    tasksPending: 5,
    weeklyCompletionRate: 85,
    suggestionsGenerated: 15,
    suggestionsAccepted: 12,
    proactiveAccuracy: 82,
    pantryLevel: 78,
    cleaningSuppliesLevel: 45,
    maintenanceStatus: "ok",
    userSatisfaction: 4.5,
    nextReminder: "15 min",
  },
  todaySchedule: [
    { id: "1", time: "09:00", title: "Reunion de equipo", completed: false, type: "work" },
    { id: "2", time: "10:30", title: "Call con cliente", completed: false, type: "work" },
    { id: "3", time: "12:00", title: "Almuerzo", completed: false, type: "personal" },
    { id: "4", time: "14:00", title: "Revision de proyecto", completed: false, type: "work" },
    { id: "5", time: "16:00", title: "Ejercicio", completed: false, type: "health" },
    { id: "6", time: "18:00", title: "Tiempo en familia", completed: false, type: "family" },
  ],
  tasks: [
    { id: "1", title: "Enviar propuesta", status: "completed", priority: "high" },
    { id: "2", title: "Llamar al medico", status: "pending", priority: "medium" },
    { id: "3", title: "Revisar presupuesto", status: "pending", priority: "high" },
    { id: "4", title: "Comprar regalo cumpleanos", status: "pending", priority: "low" },
    { id: "5", title: "Actualizar documentacion", status: "in_progress", priority: "medium" },
  ],
  suggestions: [
    { id: "1", text: "Revisar emails pendientes (5 sin leer)", source: "proactive", confidence: 0.92 },
    { id: "2", text: "Preparar informe semanal (vence manana)", source: "chronos", confidence: 0.88 },
    { id: "3", text: "Comprar leche (inventario bajo)", source: "domus", confidence: 0.95 },
  ],
  upcomingPurchases: ["Leche", "Pan", "Detergente"],
};

export function getAsistenteData(
  partial?: DeepPartial<AsistenteData>
): AsistenteData {
  return mergeWithDefaults(partial, defaultAsistenteData);
}

export const asistenteData = defaultAsistenteData;
