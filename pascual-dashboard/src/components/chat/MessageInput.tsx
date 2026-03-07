"use client";

import { useState, KeyboardEvent } from "react";

// Icons - matching PascualInput style
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

interface MessageInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function MessageInput({
  onSend,
  disabled = false,
  placeholder = "Háblale a Pascual...",
}: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage("");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-3 bg-zinc-950 border-t border-zinc-800">
      <div
        className={`
          flex items-center gap-3
          bg-zinc-900 border rounded-sm px-3 py-2.5
          transition-all duration-300
          ${isFocused ? "border-[#00d9ff]/50 shadow-[0_0_15px_rgba(0,217,255,0.1)]" : "border-zinc-800"}
          ${disabled ? "opacity-50" : ""}
        `}
      >
        <span className="text-[#00d9ff]">
          <RobotIcon />
        </span>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 bg-transparent font-mono text-sm text-white placeholder:text-zinc-600 outline-none disabled:cursor-not-allowed"
        />
        <button
          onClick={handleSend}
          disabled={disabled || !message.trim()}
          className={`
            flex items-center gap-2 px-3 py-1.5 rounded-sm font-mono text-xs
            transition-all duration-200
            ${message.trim() && !disabled
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

interface VoiceButtonProps {
  isListening: boolean;
  onToggle: () => void;
}

export function VoiceButton({ isListening, onToggle }: VoiceButtonProps) {
  return (
    <button
      onClick={onToggle}
      className={`
        w-10 h-10 rounded-full
        flex items-center justify-center
        transition-all duration-200
        ${
          isListening
            ? "bg-[#ff006e] text-white shadow-neo-pink animate-pulse"
            : "bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800"
        }
      `}
    >
      {isListening ? "◉" : "◎"}
    </button>
  );
}
