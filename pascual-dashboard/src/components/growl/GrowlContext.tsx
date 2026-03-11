"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  ReactNode,
} from "react";
import { generateId } from "@/lib/utils/id";
import type { AgentId } from "@/lib/api/adapters";

// ============================================================================
// TIPOS
// ============================================================================

export interface ChatMessage {
  id: string;
  type: "user" | "assistant" | "system";
  content: string;
  agentId?: string;
  agentName?: string;
  agentIcon?: string;
  timestamp: string;
  isTyping?: boolean;
  isStreaming?: boolean;
  source: "main" | "growl";
}

interface StreamEvent {
  type: "start" | "chunk" | "done" | "error";
  content?: string;
  error?: string;
  adapter?: string;
  metadata?: {
    tokensGenerated?: number;
    timeElapsed?: number;
  };
}

interface PascualChatContextType {
  messages: ChatMessage[];
  isTyping: boolean;
  isStreaming: boolean;
  sendMessage: (content: string, source?: "main" | "growl") => void;
  sendToAgent: (
    agentId: string,
    agentName: string,
    agentIcon: string,
    userMessage: string
  ) => void;
  clearMessages: () => void;
  cancelStream: () => void;
}

// ============================================================================
// CONTEXT
// ============================================================================

const PascualChatContext = createContext<PascualChatContextType | undefined>(
  undefined
);

// ============================================================================
// HELPERS
// ============================================================================

const getTimestamp = () =>
  new Date().toLocaleTimeString("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
  });

// Mapeo de agentes de módulos del dashboard a agentes reales
const MODULE_TO_AGENT: Record<string, AgentId> = {
  asistente: "pascual",
  nexus: "nexus",
  sentinel: "warden",
  scout: "hunter",
  audiovisual: "pascual",
  consultor: "pascual",
  gambito: "nexus",
  condor360: "nexus",
  picasso: "pascual",
};

// ============================================================================
// PROVIDER
// ============================================================================

export function GrowlProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-1",
      type: "assistant",
      content:
        "Hola, soy Pascual, tu asistente del ecosistema. ¿En qué puedo ayudarte hoy?",
      agentName: "Pascual",
      agentIcon: "◉",
      timestamp: getTimestamp(),
      source: "main",
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);

  // AbortController para cancelar streams
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Consume el stream SSE del API
   */
  const consumeStream = useCallback(
    async (
      agentId: AgentId,
      prompt: string,
      messageId: string,
      agentName: string,
      agentIcon: string,
      source: "main" | "growl"
    ) => {
      abortControllerRef.current = new AbortController();
      let fullContent = "";

      try {
        const response = await fetch("/api/chat/stream", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ agentId, prompt }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error("No response body");
        }

        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const text = decoder.decode(value, { stream: true });
          const lines = text.split("\n").filter((line) => line.startsWith("data: "));

          for (const line of lines) {
            try {
              const jsonStr = line.replace("data: ", "");
              const event: StreamEvent = JSON.parse(jsonStr);

              if (event.type === "chunk" && event.content) {
                fullContent += event.content;

                // Actualizar mensaje con contenido parcial
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === messageId
                      ? { ...msg, content: fullContent, isStreaming: true }
                      : msg
                  )
                );
              } else if (event.type === "done") {
                // Finalizar streaming
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === messageId
                      ? { ...msg, content: fullContent, isStreaming: false }
                      : msg
                  )
                );
              } else if (event.type === "error" || event.error) {
                throw new Error(event.error || "Stream error");
              }
            } catch (parseError) {
              // Ignorar errores de parsing (pueden ser chunks incompletos)
              if (parseError instanceof SyntaxError) continue;
              throw parseError;
            }
          }
        }
      } catch (error) {
        if ((error as Error).name === "AbortError") {
          // Stream cancelado por el usuario
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === messageId
                ? {
                    ...msg,
                    content: fullContent + " [cancelado]",
                    isStreaming: false,
                  }
                : msg
            )
          );
        } else {
          // Error real - mostrar mensaje de error
          console.error("[GrowlContext] Stream error:", error);
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === messageId
                ? {
                    ...msg,
                    content:
                      fullContent ||
                      "Lo siento, hubo un error al procesar tu solicitud. Por favor intenta de nuevo.",
                    isStreaming: false,
                  }
                : msg
            )
          );
        }
      } finally {
        setIsTyping(false);
        setIsStreaming(false);
        abortControllerRef.current = null;
      }
    },
    []
  );

  /**
   * Envía mensaje al agente principal (Pascual)
   */
  const sendMessage = useCallback(
    (content: string, source: "main" | "growl" = "main") => {
      // Agregar mensaje del usuario
      const userMessage: ChatMessage = {
        id: generateId("user"),
        type: "user",
        content,
        agentName: "Tú",
        timestamp: getTimestamp(),
        source,
      };

      // Crear placeholder para respuesta
      const assistantMessageId = generateId("assistant");
      const assistantMessage: ChatMessage = {
        id: assistantMessageId,
        type: "assistant",
        content: "",
        agentName: "Pascual",
        agentIcon: "◉",
        timestamp: getTimestamp(),
        isStreaming: true,
        source,
      };

      setMessages((prev) => [...prev, userMessage, assistantMessage]);
      setIsTyping(true);
      setIsStreaming(true);

      // Iniciar streaming
      consumeStream("pascual", content, assistantMessageId, "Pascual", "◉", source);
    },
    [consumeStream]
  );

  /**
   * Envía mensaje a un agente específico
   */
  const sendToAgent = useCallback(
    (
      moduleId: string,
      agentName: string,
      agentIcon: string,
      userMessage: string
    ) => {
      // Agregar mensaje del usuario
      const userMsg: ChatMessage = {
        id: generateId("user"),
        type: "user",
        content: `[Para ${agentName}]: ${userMessage}`,
        agentName: "Tú",
        timestamp: getTimestamp(),
        source: "growl",
      };

      // Crear placeholder para respuesta
      const assistantMessageId = generateId("assistant");
      const assistantMessage: ChatMessage = {
        id: assistantMessageId,
        type: "assistant",
        content: "",
        agentId: moduleId,
        agentName,
        agentIcon,
        timestamp: getTimestamp(),
        isStreaming: true,
        source: "growl",
      };

      setMessages((prev) => [...prev, userMsg, assistantMessage]);
      setIsTyping(true);
      setIsStreaming(true);

      // Mapear módulo a agente real
      const realAgentId = MODULE_TO_AGENT[moduleId] || "pascual";

      // Iniciar streaming
      consumeStream(
        realAgentId,
        userMessage,
        assistantMessageId,
        agentName,
        agentIcon,
        "growl"
      );
    },
    [consumeStream]
  );

  /**
   * Cancelar stream en curso
   */
  const cancelStream = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  /**
   * Limpiar mensajes
   */
  const clearMessages = useCallback(() => {
    cancelStream();
    setMessages([
      {
        id: "welcome-1",
        type: "assistant",
        content:
          "Hola, soy Pascual, tu asistente del ecosistema. ¿En qué puedo ayudarte hoy?",
        agentName: "Pascual",
        agentIcon: "◉",
        timestamp: getTimestamp(),
        source: "main",
      },
    ]);
  }, [cancelStream]);

  // Escuchar eventos de PascualInput
  useEffect(() => {
    const handlePascualMessage = (
      event: CustomEvent<{ message: string; context?: string }>
    ) => {
      const { message } = event.detail;
      sendMessage(message, "growl");
    };

    window.addEventListener("pascual:message", handlePascualMessage as EventListener);
    return () => {
      window.removeEventListener(
        "pascual:message",
        handlePascualMessage as EventListener
      );
    };
  }, [sendMessage]);

  return (
    <PascualChatContext.Provider
      value={{
        messages,
        isTyping,
        isStreaming,
        sendMessage,
        sendToAgent,
        clearMessages,
        cancelStream,
      }}
    >
      {children}
    </PascualChatContext.Provider>
  );
}

// ============================================================================
// HOOKS
// ============================================================================

export function useGrowl() {
  const context = useContext(PascualChatContext);
  if (!context) {
    throw new Error("useGrowl must be used within a GrowlProvider");
  }
  return context;
}

// Alias for clearer naming
export const usePascualChat = useGrowl;

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type GrowlMessage = ChatMessage;
export type ChatHistoryEntry = ChatMessage;
