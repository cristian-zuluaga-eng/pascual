"use client";

import { useState, useRef } from "react";

// Icons
const RobotIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="animate-robot-idle"
  >
    <rect x="3" y="11" width="18" height="10" rx="2" />
    <circle cx="12" cy="5" r="2" />
    <path d="M12 7v4" />
    <circle cx="8" cy="16" r="1.5" fill="currentColor" />
    <circle cx="16" cy="16" r="1.5" fill="currentColor" />
  </svg>
);

const SendIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 2L11 13" />
    <path d="M22 2L15 22L11 13L2 9L22 2Z" />
  </svg>
);

interface PascualInputProps {
  placeholder?: string;
  variant?: "default" | "expanded";
  context?: string;
  onSend?: (message: string) => void;
  className?: string;
  autoFocus?: boolean;
}

export function PascualInput({
  placeholder = "Háblale a Pascual...",
  variant = "default",
  context,
  onSend,
  className = "",
  autoFocus = false,
}: PascualInputProps) {
  const [message, setMessage] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (!message.trim()) return;

    window.dispatchEvent(new CustomEvent("pascual:message", {
      detail: {
        message: message.trim(),
        context,
        timestamp: new Date().toISOString(),
      }
    }));

    if (onSend) {
      onSend(message.trim());
    }

    setMessage("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Notify growl system that user is typing (to pause timeout)
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    // Dispatch typing event to pause growl timeouts
    window.dispatchEvent(new CustomEvent("pascual:typing"));
  };

  if (variant === "expanded") {
    return (
      <div className={`${className}`}>
        <div
          className={`
            flex items-start gap-3
            bg-zinc-900 border rounded-sm px-4 py-3
            transition-all duration-300
            ${isFocused ? "border-[#00d9ff]/50 shadow-[0_0_15px_rgba(0,217,255,0.1)]" : "border-zinc-800"}
          `}
        >
          <span className="text-[#00d9ff] mt-1">
            <RobotIcon />
          </span>
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            placeholder={placeholder}
            value={message}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            autoFocus={autoFocus}
            className="flex-1 bg-transparent font-mono text-sm text-white placeholder:text-zinc-600 outline-none min-h-[60px] resize-none"
          />
          <button
            onClick={handleSend}
            disabled={!message.trim()}
            className={`
              flex items-center gap-2 px-3 py-1.5 rounded-sm font-mono text-xs
              transition-all duration-200
              ${message.trim()
                ? "text-[#00d9ff] hover:bg-[#00d9ff]/20 cursor-pointer"
                : "text-zinc-700 cursor-not-allowed"
              }
            `}
          >
            <span>Enviar</span>
            <SendIcon />
          </button>
        </div>
      </div>
    );
  }

  // Default: single line input with button inside
  return (
    <div className={`${className}`}>
      <div
        className={`
          flex items-center gap-3
          bg-zinc-900 border rounded-sm px-3 py-2.5
          transition-all duration-300
          ${isFocused ? "border-[#00d9ff]/50 shadow-[0_0_15px_rgba(0,217,255,0.1)]" : "border-zinc-800"}
        `}
      >
        <span className="text-[#00d9ff]">
          <RobotIcon />
        </span>
        <input
          ref={inputRef as React.RefObject<HTMLInputElement>}
          type="text"
          placeholder={placeholder}
          value={message}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          autoFocus={autoFocus}
          className="flex-1 bg-transparent font-mono text-sm text-white placeholder:text-zinc-600 outline-none"
        />
        <button
          onClick={handleSend}
          disabled={!message.trim()}
          className={`
            flex items-center gap-2 px-3 py-1.5 rounded-sm font-mono text-xs
            transition-all duration-200
            ${message.trim()
              ? "text-[#00d9ff] hover:bg-[#00d9ff]/20 cursor-pointer"
              : "text-zinc-700 cursor-not-allowed"
            }
          `}
        >
          <span>Enviar</span>
          <SendIcon />
        </button>
      </div>
    </div>
  );
}

// Compact button that expands into input
export function PascualInputButton({
  label = "New Task",
  placeholder = "Háblale a Pascual...",
  context,
  className = "",
}: {
  label?: string;
  placeholder?: string;
  context?: string;
  className?: string;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [message, setMessage] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const handleSend = () => {
    if (!message.trim()) return;

    window.dispatchEvent(new CustomEvent("pascual:message", {
      detail: {
        message: message.trim(),
        context,
        timestamp: new Date().toISOString(),
      }
    }));

    setMessage("");
    setIsExpanded(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    if (e.key === "Escape") {
      setIsExpanded(false);
      setMessage("");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    window.dispatchEvent(new CustomEvent("pascual:typing"));
  };

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className={`
          flex items-center gap-2 px-4 py-2
          bg-[#00d9ff]/10 border border-[#00d9ff]/30 rounded-sm
          font-mono text-sm text-[#00d9ff]
          hover:bg-[#00d9ff]/20 hover:border-[#00d9ff]/50
          transition-all duration-200
          ${className}
        `}
      >
        <span>+</span>
        <span>{label}</span>
      </button>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div
        className={`
          flex items-center gap-3
          bg-zinc-900 border rounded-sm px-3 py-2.5 min-w-[400px]
          transition-all duration-300
          ${isFocused ? "border-[#00d9ff]/50 shadow-[0_0_15px_rgba(0,217,255,0.1)]" : "border-zinc-800"}
        `}
      >
        <span className="text-[#00d9ff]">
          <RobotIcon />
        </span>
        <input
          type="text"
          placeholder={placeholder}
          value={message}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          autoFocus
          className="flex-1 bg-transparent font-mono text-sm text-white placeholder:text-zinc-500 outline-none"
        />
        <button
          onClick={handleSend}
          disabled={!message.trim()}
          className={`
            flex items-center gap-2 px-3 py-1.5 rounded-sm font-mono text-xs
            transition-all duration-200
            ${message.trim()
              ? "text-[#00d9ff] hover:bg-[#00d9ff]/20 cursor-pointer"
              : "text-zinc-700 cursor-not-allowed"
            }
          `}
        >
          <span>Enviar</span>
          <SendIcon />
        </button>
      </div>
      <button
        onClick={() => { setIsExpanded(false); setMessage(""); }}
        className="p-2 text-zinc-500 hover:text-white transition-colors"
      >
        ✕
      </button>
    </div>
  );
}

export default PascualInput;
