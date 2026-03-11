"use client";

import { useRef, useEffect } from "react";
import { Card, CardHeader, CardBody } from "../ui/Card";

export interface ChatMessage {
  id: string;
  role?: "user" | "assistant" | "system";
  type?: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  agentName?: string;
  agentIcon?: string;
  source?: "main" | "growl";
  isStreaming?: boolean;
}

interface ChatWindowProps {
  messages: ChatMessage[];
  isTyping?: boolean;
}

// Eliminar la variable no usada
// const messagesContainerRef = useRef<HTMLDivElement>(null);

export function ChatWindow({ messages, isTyping = false }: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <span className="text-[#00d9ff]" aria-hidden="true">◎</span>
          <h3 className="font-mono text-sm font-bold">PASCUAL</h3>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full bg-[#39ff14] status-pulse"
            aria-hidden="true"
          />
          <span className="text-xs font-mono text-zinc-400">Conectado</span>
        </div>
      </CardHeader>
      <CardBody className="flex-1 overflow-y-auto p-0">
        <div
          className="p-4 space-y-4"
          role="log"
          aria-live="polite"
          aria-atomic="false"
          aria-label="Historial de conversación con Pascual"
        >
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
          {isTyping && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>
      </CardBody>
    </Card>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  // Support both 'role' and 'type' for compatibility
  const messageType = message.role || message.type;
  const isUser = messageType === "user";
  const isSystem = messageType === "system";

  if (isSystem) {
    return (
      <div className="flex justify-center" role="status">
        <span className="text-xs font-mono text-zinc-500 bg-zinc-900 px-3 py-1 rounded-full">
          {message.content}
        </span>
      </div>
    );
  }

  return (
    <div
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
      role="article"
      aria-label={`Mensaje de ${isUser ? "ti" : message.agentName || "Pascual"}`}
    >
      <div
        className={`
          max-w-[80%] p-3 rounded-sm font-mono text-sm
          ${
            isUser
              ? "bg-cyan-950/30 border border-cyan-900 text-white"
              : "bg-zinc-900 border border-zinc-800 text-zinc-200"
          }
          ${message.isStreaming ? "animate-pulse" : ""}
        `}
      >
        {!isUser && message.agentName && (
          <div className="flex items-center gap-2 text-xs text-[#00d9ff] mb-1">
            {message.agentIcon && <span aria-hidden="true">{message.agentIcon}</span>}
            <span>[{message.agentName}]</span>
          </div>
        )}
        <div className="whitespace-pre-wrap">{message.content}</div>
        <div
          className={`text-xs mt-2 ${isUser ? "text-cyan-600" : "text-zinc-500"}`}
        >
          <time>{message.timestamp}</time>
        </div>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex justify-start" role="status" aria-label="Pascual está escribiendo">
      <div className="bg-zinc-900 border border-zinc-800 p-3 rounded-sm">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm" aria-hidden="true">◉</span>
          <span className="text-xs text-[#00d9ff]">[Pascual]</span>
        </div>
        <div className="flex items-center gap-1" aria-hidden="true">
          <span className="w-2 h-2 bg-[#00d9ff] rounded-full animate-bounce [animation-delay:-0.3s]" />
          <span className="w-2 h-2 bg-[#00d9ff] rounded-full animate-bounce [animation-delay:-0.15s]" />
          <span className="w-2 h-2 bg-[#00d9ff] rounded-full animate-bounce" />
        </div>
        <span className="sr-only">Pascual está escribiendo...</span>
      </div>
    </div>
  );
}
