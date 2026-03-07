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
}

interface ChatWindowProps {
  messages: ChatMessage[];
  isTyping?: boolean;
}

export function ChatWindow({ messages, isTyping = false }: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <span className="text-[#00d9ff]">◎</span>
          <h3 className="font-mono text-sm font-bold">PASCUAL</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#39ff14] status-pulse" />
          <span className="text-xs font-mono text-zinc-500">Conectado</span>
        </div>
      </CardHeader>
      <CardBody className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        {isTyping && <TypingIndicator />}
        <div ref={messagesEndRef} />
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
      <div className="flex justify-center">
        <span className="text-xs font-mono text-zinc-600 bg-zinc-900 px-3 py-1 rounded-full">
          {message.content}
        </span>
      </div>
    );
  }

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`
          max-w-[80%] p-3 rounded-sm font-mono text-sm
          ${
            isUser
              ? "bg-cyan-950/30 border border-cyan-900 text-white"
              : "bg-zinc-900 border border-zinc-800 text-zinc-200"
          }
        `}
      >
        {!isUser && message.agentName && (
          <div className="flex items-center gap-2 text-xs text-[#00d9ff] mb-1">
            {message.agentIcon && <span>{message.agentIcon}</span>}
            <span>[{message.agentName}]</span>
          </div>
        )}
        <div className="whitespace-pre-wrap">{message.content}</div>
        <div
          className={`text-xs mt-2 ${isUser ? "text-cyan-700" : "text-zinc-600"}`}
        >
          {message.timestamp}
        </div>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="bg-zinc-900 border border-zinc-800 p-3 rounded-sm">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm">◉</span>
          <span className="text-xs text-[#00d9ff]">[Pascual]</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 bg-[#00d9ff] rounded-full animate-bounce [animation-delay:-0.3s]" />
          <span className="w-2 h-2 bg-[#00d9ff] rounded-full animate-bounce [animation-delay:-0.15s]" />
          <span className="w-2 h-2 bg-[#00d9ff] rounded-full animate-bounce" />
        </div>
      </div>
    </div>
  );
}
