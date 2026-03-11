// ============================================================================
// CONSULTOR - Mock Data
// ============================================================================

import { DeepPartial, mergeWithDefaults } from "../../types/base";
import { ConsultorData } from "./types";

const defaultConsultorData: ConsultorData = {
  id: "consultor",
  name: "Consultor",
  icon: "📚",
  lema: "Conocimiento especializado, vision integral",
  description: "Orquestador Multidisciplinario de Conocimiento",
  status: "active",
  lastSync: "por consulta",
  quickActions: [
    { id: "finance", label: "Finanzas", icon: "💰", prompt: "Pascual, necesito asesoria financiera sobre [tema]" },
    { id: "parenting", label: "Crianza", icon: "👶", prompt: "Pascual, consulta sobre crianza: [situacion]" },
    { id: "business", label: "Emprendimiento", icon: "🚀", prompt: "Pascual, asesoria para mi emprendimiento: [tema]" },
    { id: "career", label: "Carrera", icon: "💼", prompt: "Pascual, orientacion profesional sobre [tema]" },
  ],
  recentMessages: [],
  metrics: {
    consultationsThisMonth: 89,
    userSatisfaction: 4.7,
    activePlans: 5,
    followUpRate: 68,
    recommendationSuccessRate: 82,
  },
  expertiseAreas: [
    { id: "1", name: "Financiero", icon: "💰", consultations: 34, rating: 4.8, lastConsultation: "Optimizar ahorro" },
    { id: "2", name: "Crianza", icon: "👶", consultations: 12, rating: 4.9, lastConsultation: "Rutinas de sueno" },
    { id: "3", name: "Emprendimiento", icon: "🚀", consultations: 23, rating: 4.6, lastConsultation: "Pitch deck" },
    { id: "4", name: "Carrera", icon: "💼", consultations: 15, rating: 4.7, lastConsultation: "Negociacion salarial" },
    { id: "5", name: "Bienestar", icon: "🧘", consultations: 5, rating: 4.8, lastConsultation: "Plan de ejercicios" },
  ],
  activePlans: [
    { id: "1", name: "Plan Ahorro Emergencia", progress: 78, nextAction: "Revisar presupuesto", area: "Financiero" },
    { id: "2", name: "Desarrollo Profesional", progress: 45, nextAction: "Actualizar CV", area: "Carrera" },
    { id: "3", name: "Bienestar Integral", progress: 92, nextAction: "Checkup medico", area: "Bienestar" },
  ],
  recentRecommendations: [
    { id: "1", text: "Considera diversificar tu portafolio de inversiones", area: "Financiero", implemented: "yes", result: "positive" },
    { id: "2", text: "Establecer rutina de ejercicio 3x semana", area: "Bienestar", implemented: "in_progress", adherence: 67 },
    { id: "3", text: "Actualizar LinkedIn con nuevas certificaciones", area: "Carrera", implemented: "pending" },
  ],
};

export function getConsultorData(
  partial?: DeepPartial<ConsultorData>
): ConsultorData {
  return mergeWithDefaults(partial, defaultConsultorData);
}

export const consultorData = defaultConsultorData;
