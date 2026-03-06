"use client";

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";

export interface GrowlMessage {
  id: string;
  type: "user" | "assistant" | "system";
  content: string;
  agentId?: string;
  agentName?: string;
  agentIcon?: string;
  timestamp: string;
  isTyping?: boolean;
}

export interface ChatHistoryEntry {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  agentName?: string;
  agentIcon?: string;
  source: "chat" | "growl";
}

interface GrowlContextType {
  messages: GrowlMessage[];
  chatHistory: ChatHistoryEntry[];
  addMessage: (message: Omit<GrowlMessage, "id" | "timestamp">) => string;
  removeMessage: (id: string) => void;
  clearMessages: () => void;
  sendToAgent: (agentId: string, agentName: string, agentIcon: string, userMessage: string) => void;
  sendToPascual: (userMessage: string, context?: string) => void;
  addToChatHistory: (entry: Omit<ChatHistoryEntry, "id" | "timestamp">) => void;
}

const GrowlContext = createContext<GrowlContextType | undefined>(undefined);

export function GrowlProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<GrowlMessage[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatHistoryEntry[]>([]);

  const generateId = () => `growl-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const addMessage = useCallback((message: Omit<GrowlMessage, "id" | "timestamp">) => {
    const id = generateId();
    const timestamp = new Date().toLocaleTimeString("es-CO", {
      hour: "2-digit",
      minute: "2-digit"
    });

    const newMessage: GrowlMessage = {
      ...message,
      id,
      timestamp,
    };

    setMessages(prev => [...prev, newMessage]);
    return id;
  }, []);

  const removeMessage = useCallback((id: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== id));
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const addToChatHistory = useCallback((entry: Omit<ChatHistoryEntry, "id" | "timestamp">) => {
    const id = generateId();
    const timestamp = new Date().toLocaleTimeString("es-CO", {
      hour: "2-digit",
      minute: "2-digit"
    });

    setChatHistory(prev => [...prev, { ...entry, id, timestamp }]);
  }, []);

  const sendToAgent = useCallback((
    agentId: string,
    agentName: string,
    agentIcon: string,
    userMessage: string
  ) => {
    // Add user message to growl
    addMessage({
      type: "user",
      content: userMessage,
      agentId,
      agentName,
      agentIcon,
    });

    // Add to chat history
    addToChatHistory({
      role: "user",
      content: `[Para ${agentName}]: ${userMessage}`,
      agentName,
      agentIcon,
      source: "growl",
    });

    // Show typing indicator
    const typingId = addMessage({
      type: "assistant",
      content: "",
      agentId,
      agentName,
      agentIcon,
      isTyping: true,
    });

    // Simulate agent response after delay
    setTimeout(() => {
      removeMessage(typingId);

      const response = generateAgentResponse(agentId, agentName, userMessage);

      addMessage({
        type: "assistant",
        content: response,
        agentId,
        agentName,
        agentIcon,
      });

      addToChatHistory({
        role: "assistant",
        content: response,
        agentName,
        agentIcon,
        source: "growl",
      });
    }, 1500 + Math.random() * 1000);
  }, [addMessage, removeMessage, addToChatHistory]);

  const sendToPascual = useCallback((userMessage: string, context?: string) => {
    // Add user message to growl
    addMessage({
      type: "user",
      content: userMessage,
      agentName: "Pascual",
      agentIcon: "◉",
    });

    // Add to chat history
    addToChatHistory({
      role: "user",
      content: userMessage,
      agentName: "Pascual",
      agentIcon: "◉",
      source: "growl",
    });

    // Show typing indicator
    const typingId = addMessage({
      type: "assistant",
      content: "",
      agentName: "Pascual",
      agentIcon: "◉",
      isTyping: true,
    });

    // Simulate Pascual response after delay
    setTimeout(() => {
      removeMessage(typingId);

      const response = generatePascualResponse(userMessage, context);

      addMessage({
        type: "assistant",
        content: response,
        agentName: "Pascual",
        agentIcon: "◉",
      });

      addToChatHistory({
        role: "assistant",
        content: response,
        agentName: "Pascual",
        agentIcon: "◉",
        source: "growl",
      });
    }, 1200 + Math.random() * 800);
  }, [addMessage, removeMessage, addToChatHistory]);

  // Listen for pascual:message events from PascualInput components
  useEffect(() => {
    const handlePascualMessage = (event: CustomEvent<{ message: string; context?: string }>) => {
      const { message, context } = event.detail;
      sendToPascual(message, context);
    };

    window.addEventListener("pascual:message", handlePascualMessage as EventListener);
    return () => {
      window.removeEventListener("pascual:message", handlePascualMessage as EventListener);
    };
  }, [sendToPascual]);

  return (
    <GrowlContext.Provider value={{
      messages,
      chatHistory,
      addMessage,
      removeMessage,
      clearMessages,
      sendToAgent,
      sendToPascual,
      addToChatHistory,
    }}>
      {children}
    </GrowlContext.Provider>
  );
}

export function useGrowl() {
  const context = useContext(GrowlContext);
  if (!context) {
    throw new Error("useGrowl must be used within a GrowlProvider");
  }
  return context;
}

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
function generatePascualResponse(userMessage: string, context?: string): string {
  const lowerMessage = userMessage.toLowerCase();

  if (context === "tasks") {
    return [
      "Entendido. He creado la tarea y la he asignado al agente más adecuado. Puedes ver el progreso en el tablero Kanban.",
      "Tarea registrada. Nexus se encargará de coordinar su ejecución. Te notificaré cuando haya actualizaciones.",
      "He agregado eso a la cola de tareas. Prioridad asignada automáticamente basada en tu historial.",
      "Tarea creada exitosamente. El agente correspondiente comenzará a trabajar en ella pronto.",
    ][Math.floor(Math.random() * 4)];
  }

  if (context === "agents") {
    return [
      "He enviado tu solicitud al agente. Pronto recibirás una respuesta con los resultados.",
      "Mensaje enviado. El agente está procesando tu solicitud en este momento.",
      "Recibido. He delegado esta tarea al sub-agente especializado correspondiente.",
    ][Math.floor(Math.random() * 3)];
  }

  if (lowerMessage.includes("tarea") || lowerMessage.includes("task")) {
    return "He registrado tu solicitud. La tarea será asignada al agente más apropiado según su naturaleza.";
  }

  if (lowerMessage.includes("ayuda") || lowerMessage.includes("help")) {
    return "Estoy aquí para ayudarte. Puedo coordinar tareas entre los 9 agentes del ecosistema, gestionar tu agenda, analizar datos y mucho más. ¿Qué necesitas?";
  }

  if (lowerMessage.includes("estado") || lowerMessage.includes("status")) {
    return "Todos los sistemas operando normalmente. 8 de 9 agentes activos. No hay alertas críticas pendientes.";
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
