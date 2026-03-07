"use client";

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";

export interface ChatMessage {
  id: string;
  type: "user" | "assistant" | "system";
  content: string;
  agentId?: string;
  agentName?: string;
  agentIcon?: string;
  timestamp: string;
  isTyping?: boolean;
  source: "main" | "growl";
}

interface PascualChatContextType {
  messages: ChatMessage[];
  isTyping: boolean;
  sendMessage: (content: string, source?: "main" | "growl") => void;
  sendToAgent: (agentId: string, agentName: string, agentIcon: string, userMessage: string) => void;
  clearMessages: () => void;
}

const PascualChatContext = createContext<PascualChatContextType | undefined>(undefined);

export function GrowlProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    // Initial welcome message
    {
      id: "welcome-1",
      type: "assistant",
      content: "Hola, soy Pascual, tu asistente del ecosistema. ¿En qué puedo ayudarte hoy?",
      agentName: "Pascual",
      agentIcon: "◉",
      timestamp: new Date().toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" }),
      source: "main",
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const generateId = () => `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const getTimestamp = () => new Date().toLocaleTimeString("es-CO", {
    hour: "2-digit",
    minute: "2-digit"
  });

  const sendMessage = useCallback((content: string, source: "main" | "growl" = "main") => {
    // Add user message
    const userMessage: ChatMessage = {
      id: generateId(),
      type: "user",
      content,
      agentName: "Tú",
      timestamp: getTimestamp(),
      source,
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    // Simulate Pascual response after delay
    setTimeout(() => {
      setIsTyping(false);

      const response = generatePascualResponse(content);
      const assistantMessage: ChatMessage = {
        id: generateId(),
        type: "assistant",
        content: response,
        agentName: "Pascual",
        agentIcon: "◉",
        timestamp: getTimestamp(),
        source,
      };

      setMessages(prev => [...prev, assistantMessage]);
    }, 1200 + Math.random() * 800);
  }, []);

  const sendToAgent = useCallback((
    agentId: string,
    agentName: string,
    agentIcon: string,
    userMessage: string
  ) => {
    // Add user message to chat
    const userMsg: ChatMessage = {
      id: generateId(),
      type: "user",
      content: `[Para ${agentName}]: ${userMessage}`,
      agentName: "Tú",
      timestamp: getTimestamp(),
      source: "growl",
    };

    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    // Simulate agent response after delay
    setTimeout(() => {
      setIsTyping(false);

      const response = generateAgentResponse(agentId, agentName, userMessage);
      const assistantMessage: ChatMessage = {
        id: generateId(),
        type: "assistant",
        content: response,
        agentId,
        agentName,
        agentIcon,
        timestamp: getTimestamp(),
        source: "growl",
      };

      setMessages(prev => [...prev, assistantMessage]);
    }, 1500 + Math.random() * 1000);
  }, []);

  const clearMessages = useCallback(() => {
    // Keep only the welcome message
    setMessages([{
      id: "welcome-1",
      type: "assistant",
      content: "Hola, soy Pascual, tu asistente del ecosistema. ¿En qué puedo ayudarte hoy?",
      agentName: "Pascual",
      agentIcon: "◉",
      timestamp: getTimestamp(),
      source: "main",
    }]);
  }, []);

  // Listen for pascual:message events from PascualInput components (growl inputs)
  useEffect(() => {
    const handlePascualMessage = (event: CustomEvent<{ message: string; context?: string }>) => {
      const { message } = event.detail;
      sendMessage(message, "growl");
    };

    window.addEventListener("pascual:message", handlePascualMessage as EventListener);
    return () => {
      window.removeEventListener("pascual:message", handlePascualMessage as EventListener);
    };
  }, [sendMessage]);

  return (
    <PascualChatContext.Provider value={{
      messages,
      isTyping,
      sendMessage,
      sendToAgent,
      clearMessages,
    }}>
      {children}
    </PascualChatContext.Provider>
  );
}

// Keep the original hook name for compatibility
export function useGrowl() {
  const context = useContext(PascualChatContext);
  if (!context) {
    throw new Error("useGrowl must be used within a GrowlProvider");
  }
  return context;
}

// Alias for clearer naming
export const usePascualChat = useGrowl;

// Simulated responses based on agent type
function generateAgentResponse(agentId: string, agentName: string, userMessage: string): string {
  const responses: Record<string, string[]> = {
    asistente: [
      "He agregado eso a tu lista de tareas pendientes. Te recordaré más tarde.",
      "Entendido. He organizado tu agenda para hoy considerando esa solicitud.",
      "Listo. Domus ya está coordinando eso con el sistema doméstico.",
      "Tu solicitud ha sido procesada. Chronos te enviará un recordatorio.",
    ],
    nexus: [
      "Analizando el código... He detectado algunos patrones que podemos optimizar.",
      "El PR está listo para review. He ejecutado los tests y todo pasa correctamente.",
      "He creado un branch con la implementación sugerida. Puedes revisarlo cuando quieras.",
      "La arquitectura propuesta cumple con los estándares. Procederé con la implementación.",
    ],
    sentinel: [
      "Escaneo de seguridad completado. No se detectaron amenazas críticas.",
      "He actualizado las reglas del firewall según tu solicitud.",
      "Auditoría de accesos generada. Te envío el reporte completo.",
      "Sistema de backup ejecutado exitosamente. Recovery point actualizado.",
    ],
    scout: [
      "Búsqueda completada. He encontrado 15 resultados relevantes.",
      "Tendencia agregada a monitoreo. Te notificaré de cambios importantes.",
      "Datos extraídos y sintetizados. El reporte está listo.",
      "He actualizado el feed con la información más reciente.",
    ],
    audiovisual: [
      "Imagen generada y guardada en la biblioteca. Puedes editarla si necesitas ajustes.",
      "El video está en cola de producción. Tiempo estimado: 5 minutos.",
      "Audio narrado listo. He mantenido coherencia con tu tono de marca.",
      "Contenido creado siguiendo las guías de brand. Revisa si necesitas cambios.",
    ],
    consultor: [
      "Basado en tu situación, te recomiendo considerar estas opciones...",
      "He analizado los datos y preparado un plan personalizado para ti.",
      "Mi recomendación profesional sería enfocarte primero en...",
      "Excelente pregunta. Aquí tienes mi análisis detallado.",
    ],
    gambito: [
      "Análisis completado. He identificado 3 oportunidades con valor esperado positivo.",
      "Modelo actualizado con los últimos datos. Precisión actual: 72%.",
      "El bankroll está optimizado. Kelly sugiere un stake del 2.3%.",
      "Partido analizado. La predicción tiene confianza media-alta.",
    ],
    condor360: [
      "Señal de mercado detectada. NVDA muestra momentum positivo.",
      "Portafolio analizado. Sugiero rebalancear hacia más defensivo.",
      "Análisis fundamental completado. Los ratios están dentro de parámetros.",
      "Sentimiento del mercado: Bullish. VIX en niveles bajos.",
    ],
    optimus: [
      "Auditoría UX completada. Core Web Vitals dentro de objetivos.",
      "Nuevo componente diseñado siguiendo el design system.",
      "Accesibilidad verificada. WCAG 2.1 AA compliant.",
      "Performance optimizada. LCP mejorado en 200ms.",
    ],
  };

  const agentResponses = responses[agentId] || [
    `Entendido. Procesando tu solicitud sobre: "${userMessage.substring(0, 50)}..."`,
    "He recibido tu mensaje y estoy trabajando en ello.",
    "Solicitud procesada exitosamente.",
  ];

  return agentResponses[Math.floor(Math.random() * agentResponses.length)];
}

// Simulated responses from Pascual (main orchestrator)
function generatePascualResponse(userMessage: string): string {
  const lowerMessage = userMessage.toLowerCase();

  if (lowerMessage.includes("tarea") || lowerMessage.includes("task")) {
    return "He registrado tu solicitud. La tarea será asignada al agente más apropiado según su naturaleza.";
  }

  if (lowerMessage.includes("ayuda") || lowerMessage.includes("help")) {
    return "Estoy aquí para ayudarte. Puedo coordinar tareas entre los 9 agentes del ecosistema, gestionar tu agenda, analizar datos y mucho más. ¿Qué necesitas?";
  }

  if (lowerMessage.includes("estado") || lowerMessage.includes("status")) {
    return "Todos los sistemas operando normalmente. 8 de 9 agentes activos. No hay alertas críticas pendientes.";
  }

  if (lowerMessage.includes("hola") || lowerMessage.includes("hi") || lowerMessage.includes("hey")) {
    return "¡Hola! ¿En qué puedo ayudarte hoy? Tengo acceso a los 9 agentes del ecosistema PASCUAL.";
  }

  const defaultResponses = [
    "Entendido. He procesado tu solicitud y estoy coordinando con los agentes necesarios.",
    "Recibido. Voy a delegar esto al agente especializado correspondiente.",
    "Tu mensaje ha sido registrado. Te mantendré informado del progreso.",
    "Perfecto. He iniciado el proceso y te notificaré cuando haya resultados.",
    "Mensaje recibido. Estoy analizando la mejor forma de proceder con tu solicitud.",
  ];

  return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
}

// Type exports for backwards compatibility
export type GrowlMessage = ChatMessage;
export type ChatHistoryEntry = ChatMessage;
