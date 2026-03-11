// ============================================================================
// AUDIOVISUAL - Mock Data
// ============================================================================

import { DeepPartial, mergeWithDefaults } from "../../types/base";
import { AudiovisualData } from "./types";

const defaultAudiovisualData: AudiovisualData = {
  id: "audiovisual",
  name: "Audiovisual",
  icon: "🎬",
  lema: "La forma perfecta para cada mensaje",
  description: "Orquestador Multimedia Integral",
  status: "active",
  lastSync: "por demanda",
  quickActions: [
    { id: "image", label: "Crear imagen", icon: "🖼️", prompt: "Pascual, genera una imagen de [descripcion]" },
    { id: "video", label: "Generar video", icon: "🎬", prompt: "Pascual, crea un video explicativo sobre [tema]" },
    { id: "audio", label: "Audio/Voz", icon: "🎵", prompt: "Pascual, genera audio narrado de [texto]" },
    { id: "text", label: "Texto creativo", icon: "📝", prompt: "Pascual, escribe [tipo de contenido] sobre [tema]" },
  ],
  recentMessages: [],
  metrics: {
    assetsGenerated: 156,
    inQueue: 3,
    avgQuality: 87,
    storageUsed: "2.3 GB",
    assetReuseRate: 34,
    brandCoherenceScore: 94,
  },
  productionQueue: [
    { id: "1", title: "Banner promocional", type: "image", status: "processing", progress: 67, priority: "high", estimatedTime: "2 min" },
    { id: "2", title: "Narracion explicativa", type: "audio", status: "queued", priority: "high" },
    { id: "3", title: "Video tutorial", type: "video", status: "queued", priority: "medium" },
  ],
  recentAssets: [
    {
      id: "1",
      name: "Logo principal",
      type: "image",
      usageCount: 45,
      createdAt: "hace 2d",
      details: {
        requestedBy: "Nexus",
        requestedByIcon: "⚡",
        prompt: "Genera un logo minimalista para el dashboard de Pascual con estetica neo-punk",
        dimensions: "1024x1024",
        fileSize: "245 KB",
        format: "SVG",
        tags: ["logo", "branding", "principal"],
        lastUsed: "hace 1h",
        quality: 98,
      },
    },
    {
      id: "2",
      name: "Banner hero",
      type: "image",
      usageCount: 23,
      createdAt: "hace 3d",
      details: {
        requestedBy: "Scout",
        requestedByIcon: "🔍",
        prompt: "Banner promocional para landing page con gradientes cyan y rosa",
        dimensions: "1920x600",
        fileSize: "1.2 MB",
        format: "PNG",
        tags: ["banner", "hero", "landing"],
        lastUsed: "hace 4h",
        quality: 94,
      },
    },
    {
      id: "3",
      name: "Jingle intro",
      type: "audio",
      usageCount: 12,
      createdAt: "hace 1w",
      details: {
        requestedBy: "Asistente",
        requestedByIcon: "👤",
        prompt: "Jingle corto de 5 segundos para notificaciones del asistente",
        duration: "5s",
        fileSize: "120 KB",
        format: "MP3",
        tags: ["jingle", "notificacion", "intro"],
        lastUsed: "hace 2d",
        quality: 92,
      },
    },
    {
      id: "4",
      name: "Script promo",
      type: "text",
      usageCount: 8,
      createdAt: "hace 1w",
      details: {
        requestedBy: "Consultor",
        requestedByIcon: "🎓",
        prompt: "Script para video promocional de servicios de consultoria financiera",
        fileSize: "4 KB",
        format: "TXT",
        tags: ["script", "promo", "finanzas"],
        lastUsed: "hace 3d",
        quality: 96,
      },
    },
    {
      id: "5",
      name: "Video explicativo",
      type: "video",
      usageCount: 5,
      createdAt: "hace 2w",
      details: {
        requestedBy: "Sentinel",
        requestedByIcon: "🛡️",
        prompt: "Video tutorial de 60 segundos explicando las medidas de seguridad del sistema",
        dimensions: "1920x1080",
        duration: "60s",
        fileSize: "45 MB",
        format: "MP4",
        tags: ["tutorial", "seguridad", "explicativo"],
        lastUsed: "hace 1w",
        quality: 88,
      },
    },
    {
      id: "6",
      name: "Icono notificacion",
      type: "image",
      usageCount: 67,
      createdAt: "hace 3w",
      details: {
        requestedBy: "Pascual",
        requestedByIcon: "🧠",
        prompt: "Set de iconos para notificaciones del sistema en estilo neo-punk",
        dimensions: "64x64",
        fileSize: "12 KB",
        format: "SVG",
        tags: ["icono", "notificacion", "UI"],
        lastUsed: "hace 30m",
        quality: 95,
      },
    },
  ],
  libraryStats: {
    images: { count: 89, size: "1.2 GB" },
    videos: { count: 23, size: "800 MB" },
    audio: { count: 34, size: "200 MB" },
    text: { count: 67, size: "50 MB" },
    mostUsed: "logo-main.svg (45x)",
  },
  brandCoherence: {
    colorPalette: true,
    typography: true,
    logoUsage: true,
    toneOfVoice: true,
  },
};

export function getAudiovisualData(
  partial?: DeepPartial<AudiovisualData>
): AudiovisualData {
  return mergeWithDefaults(partial, defaultAudiovisualData);
}

export const audiovisualData = defaultAudiovisualData;
