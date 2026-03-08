"use client";

import { useGrowl, ChatMessage } from "./GrowlContext";
import { useEffect, useState, useRef } from "react";
import { PascualInput } from "@/components/pascual";
import { useChatTransitionContext } from "@/components/chat/ChatTransition";
import { RobotIcon } from "@/components/ui/Icons";
import { useDashboardConfig } from "@/lib/context/DashboardConfigContext";

export function GrowlContainer() {
  const { messages, isTyping, clearMessages } = useGrowl();
  const { showMinimizedGrowl, isAnimating, isOnDashboard } = useChatTransitionContext();
  const { config } = useDashboardConfig();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [manuallyOpened, setManuallyOpened] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle transition: when leaving dashboard, show minimized button
  useEffect(() => {
    if (showMinimizedGrowl && !isOnDashboard) {
      setIsOpen(true);
      setIsMinimized(true);
      setManuallyOpened(false);
    }
  }, [showMinimizedGrowl, isOnDashboard]);

  // When returning to dashboard, always close the growl (chat is in main view)
  useEffect(() => {
    if (isOnDashboard) {
      setIsOpen(false);
      setIsMinimized(false);
      setManuallyOpened(false);
    }
  }, [isOnDashboard]);

  // Auto-open when new growl messages arrive (only if not on dashboard)
  useEffect(() => {
    const hasGrowlMessages = messages.some(m => m.source === "growl");
    if (hasGrowlMessages && !isOnDashboard) {
      setIsOpen(true);
      setIsMinimized(false);
      setManuallyOpened(true);
    }
  }, [messages, isOnDashboard]);

  // Listen for events that should open the chat
  useEffect(() => {
    const handleOpen = () => {
      setIsOpen(true);
      setIsMinimized(false);
      setManuallyOpened(true);
    };

    window.addEventListener("pascual:openChat", handleOpen);
    return () => {
      window.removeEventListener("pascual:openChat", handleOpen);
    };
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    setManuallyOpened(false);
  };

  const handleMinimize = () => {
    setIsMinimized(true);
  };

  const handleRestore = () => {
    setIsMinimized(false);
    setManuallyOpened(true);
  };

  // Don't render if chat emergente is disabled
  if (!config.views.chatEmergente) return null;
  // Don't render during animation or if on dashboard (unless manually opened)
  if (isAnimating) return null;
  if (!isOpen) return null;
  if (isOnDashboard && !manuallyOpened) return null;

  // Minimized state - small floating button
  if (isMinimized) {
    return (
      <button
        onClick={handleRestore}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-zinc-900 border border-[#00d9ff]/30 rounded-sm shadow-lg hover:border-[#00d9ff]/50 transition-all cursor-pointer"
      >
        <span className="text-[#00d9ff]">
          <RobotIcon size={20} />
        </span>
        <span className="font-mono text-sm text-white">Pascual</span>
        {messages.length > 0 && (
          <span className="flex items-center justify-center w-5 h-5 bg-[#00d9ff] rounded-full font-mono text-[10px] text-black font-bold">
            {messages.length}
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
          <span className="text-[#00d9ff]">
            <RobotIcon size={24} />
          </span>
          <div>
            <h3 className="font-mono text-sm font-bold text-white">Pascual</h3>
            <p className="font-mono text-[10px] text-zinc-500">Asistente del ecosistema</p>
          </div>
        </div>
        <span
          className="p-2 text-zinc-500"
          title="Minimizar"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </span>
      </div>

      {/* Messages Area */}
      <div className="flex-1 max-h-[400px] min-h-[200px] overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <span className="text-[#00d9ff] mb-3">
              <RobotIcon size={48} />
            </span>
            <p className="font-mono text-sm text-zinc-400">¿En qué puedo ayudarte?</p>
            <p className="font-mono text-[10px] text-zinc-600 mt-1">Escribe un mensaje para comenzar</p>
          </div>
        ) : (
          messages.map((message) => (
            <GrowlMessageBubble key={message.id} message={message} />
          ))
        )}
        {isTyping && (
          <div className="flex justify-start">
            <div className="max-w-[85%]">
              <div className="flex items-center gap-2 mb-1 ml-1">
                <span className="text-[#00d9ff]">
                  <RobotIcon size={14} />
                </span>
                <span className="font-mono text-[10px] text-zinc-500">Pascual</span>
              </div>
              <div className="px-3 py-2 rounded-lg font-mono text-sm bg-zinc-800 border border-zinc-700 text-zinc-200 rounded-bl-sm">
                <div className="flex items-center gap-1.5 py-1">
                  <span className="w-2 h-2 bg-[#00d9ff] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 bg-[#00d9ff] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 bg-[#00d9ff] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          </div>
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
  message: ChatMessage;
}

function GrowlMessageBubble({ message }: GrowlMessageBubbleProps) {
  const isUser = message.type === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[85%] ${isUser ? "order-1" : ""}`}>
        {/* Agent header for assistant messages */}
        {!isUser && message.agentName && (
          <div className="flex items-center gap-2 mb-1 ml-1">
            {message.agentName === "Pascual" ? (
              <span className="text-[#00d9ff]">
                <RobotIcon size={14} />
              </span>
            ) : (
              <span className="text-sm">{message.agentIcon || "◉"}</span>
            )}
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
          <p className="leading-relaxed text-[13px]">{message.content}</p>
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
