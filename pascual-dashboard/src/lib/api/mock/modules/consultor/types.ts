// ============================================================================
// CONSULTOR - Tipos
// ============================================================================

import { ModuleBase } from "../../types/base";

export interface ConsultorMetrics {
  consultationsThisMonth: number;
  userSatisfaction: number;
  activePlans: number;
  followUpRate: number;
  recommendationSuccessRate: number;
}

export interface ExpertiseArea {
  id: string;
  name: string;
  icon: string;
  consultations: number;
  rating: number;
  lastConsultation: string;
}

export interface ActivePlan {
  id: string;
  name: string;
  progress: number;
  nextAction: string;
  area: string;
}

export interface ConsultorRecommendation {
  id: string;
  text: string;
  area: string;
  implemented: "yes" | "in_progress" | "pending";
  result?: "positive" | "neutral" | "negative";
  adherence?: number;
}

export interface ConsultorData extends ModuleBase {
  metrics: ConsultorMetrics;
  expertiseAreas: ExpertiseArea[];
  activePlans: ActivePlan[];
  recentRecommendations: ConsultorRecommendation[];
}
