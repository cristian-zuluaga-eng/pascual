"use client";

import { useGrowl, GrowlMessage } from "./GrowlContext";
import { useEffect, useState, useRef } from "react";
import { PascualInput } from "@/components/pascual";

export function GrowlContainer() {
  const { messages, removeMessage, sendToPascual, clearMessages } = useGrowl();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-open when new messages arrive
  useEffect(() => {
    if (messages.length > 0 && !isOpen) {
      setIsOpen(true);
      setIsMinimized(false);
    }
  }, [messages.length, isOpen]);

  // Listen for events that should open the chat
  useEffect(() => {
    const handleOpen = () => {
      setIsOpen(true);
      setIsMinimized(false);
    };

    window.addEventListener("pascual:openChat", handleOpen);
    return () => {
      window.removeEventListener("pascual:openChat", handleOpen);
    };
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    clearMessages();
  };

  const handleMinimize = () => {
    setIsMinimized(true);
  };

  const handleRestore = () => {
    setIsMinimized(false);
  };

  if (!isOpen) return null;

  // Minimized state - small floating button
  if (isMinimized) {
    return (
      <button
        onClick={handleRestore}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-zinc-900 border border-[#00d9ff]/30 rounded-sm shadow-lg hover:border-[#00d9ff]/50 transition-all"
      >
        <span className="text-[#00d9ff] text-lg">◉</span>
        <span className="font-mono text-sm text-white">Pascual</span>
        {messages.filter(m => !m.isTyping).length > 0 && (
          <span className="flex items-center justify-center w-5 h-5 bg-[#00d9ff] rounded-full font-mono text-[10px] text-black font-bold">
            {messages.filter(m => !m.isTyping).length}
          </span>
        )}
      </button>
    );
  }

  // Full chat window
  return (
    <div className="fixed bottom-6 right-6 z-50 w-[420px] flex flex-col bg-zinc-950 border border-zinc-800 rounded-sm shadow-2xl overflow-hidden">
      {/* Header - clickable to minimize */}
      <div
        onClick={handleMinimize}
        className="flex items-center justify-between px-4 py-3 bg-zinc-900 border-b border-zinc-800 cursor-pointer hover:bg-zinc-800/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-[#00d9ff] text-xl animate-robot-idle">◉</span>
          <div>
            <h3 className="font-mono text-sm font-bold text-white">Pascual</h3>
            <p className="font-mono text-[10px] text-zinc-500">Asistente del ecosistema</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <span
            className="p-2 text-zinc-500"
            title="Minimizar"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </span>
          <button
            onClick={(e) => { e.stopPropagation(); handleClose(); }}
            className="p-2 text-zinc-500 hover:text-[#ff006e] hover:bg-zinc-800 rounded-sm transition-colors"
            title="Cerrar"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 max-h-[400px] min-h-[200px] overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <span className="text-4xl mb-3 animate-robot-idle">◉</span>
            <p className="font-mono text-sm text-zinc-400">¿En qué puedo ayudarte?</p>
            <p className="font-mono text-[10px] text-zinc-600 mt-1">Escribe un mensaje para comenzar</p>
          </div>
        ) : (
          messages.map((message) => (
            <GrowlMessageBubble key={message.id} message={message} />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 border-t border-zinc-800 bg-zinc-900/50">
        <PascualInput context="growl-chat" />
      </div>
    </div>
  );
}

interface GrowlMessageBubbleProps {
  message: GrowlMessage;
}

function GrowlMessageBubble({ message }: GrowlMessageBubbleProps) {
  const isUser = message.type === "user";
  const isTyping = message.isTyping;

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[85%] ${isUser ? "order-1" : ""}`}>
        {/* Agent header for assistant messages */}
        {!isUser && message.agentName && !isTyping && (
          <div className="flex items-center gap-2 mb-1 ml-1">
            <span className="text-sm">{message.agentIcon}</span>
            <span className="font-mono text-[10px] text-zinc-500">{message.agentName}</span>
            <span className="font-mono text-[10px] text-zinc-600">{message.timestamp}</span>
          </div>
        )}

        <div
          className={`
            px-3 py-2 rounded-lg font-mono text-sm
            ${isUser
              ? "bg-[#00d9ff]/20 border border-[#00d9ff]/30 text-white rounded-br-sm"
              : "bg-zinc-800 border border-zinc-700 text-zinc-200 rounded-bl-sm"
            }
          `}
        >
          {isTyping ? (
            <div className="flex items-center gap-1.5 py-1">
              <span className="w-2 h-2 bg-[#00d9ff] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-2 h-2 bg-[#00d9ff] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-2 h-2 bg-[#00d9ff] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          ) : (
            <p className="leading-relaxed text-[13px]">{message.content}</p>
          )}
        </div>

        {/* User timestamp */}
        {isUser && (
          <p className="text-right font-mono text-[10px] text-zinc-600 mt-1 mr-1">{message.timestamp}</p>
        )}
      </div>
    </div>
  );
}

export default GrowlContainer;
