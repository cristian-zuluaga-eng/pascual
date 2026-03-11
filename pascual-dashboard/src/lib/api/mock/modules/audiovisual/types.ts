// ============================================================================
// AUDIOVISUAL - Tipos
// ============================================================================

import { ModuleBase, Priority } from "../../types/base";

export interface AudiovisualMetrics {
  assetsGenerated: number;
  inQueue: number;
  avgQuality: number;
  storageUsed: string;
  assetReuseRate: number;
  brandCoherenceScore: number;
}

export interface ProductionItem {
  id: string;
  title: string;
  type: "image" | "video" | "audio" | "text";
  status: "processing" | "queued" | "completed" | "failed";
  progress?: number;
  priority: Priority;
  estimatedTime?: string;
}

export interface Asset {
  id: string;
  name: string;
  type: "image" | "video" | "audio" | "text";
  thumbnail?: string;
  usageCount: number;
  createdAt: string;
  details?: {
    requestedBy?: string;
    requestedByIcon?: string;
    prompt?: string;
    dimensions?: string;
    duration?: string;
    fileSize?: string;
    format?: string;
    tags?: string[];
    lastUsed?: string;
    quality?: number;
  };
}

export interface AssetLibraryStats {
  images: { count: number; size: string };
  videos: { count: number; size: string };
  audio: { count: number; size: string };
  text: { count: number; size: string };
  mostUsed: string;
}

export interface AudiovisualData extends ModuleBase {
  metrics: AudiovisualMetrics;
  productionQueue: ProductionItem[];
  recentAssets: Asset[];
  libraryStats: AssetLibraryStats;
  brandCoherence: { colorPalette: boolean; typography: boolean; logoUsage: boolean; toneOfVoice: boolean };
}
