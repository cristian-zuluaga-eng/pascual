"use client";

import { useState, KeyboardEvent } from "react";

interface MessageInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function MessageInput({
  onSend,
  disabled = false,
  placeholder = "Type a message...",
}: MessageInputProps) {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage("");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex items-end gap-2 p-3 bg-zinc-950 border-t border-zinc-800">
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        rows={1}
        className="
          flex-1 px-3 py-2
          bg-zinc-900 border border-zinc-800 rounded-sm
          text-white font-mono text-sm
          placeholder:text-zinc-600
          focus:outline-none focus:border-[#00d9ff]
          resize-none
          disabled:opacity-50 disabled:cursor-not-allowed
        "
        style={{ minHeight: "40px", maxHeight: "120px" }}
      />
      <button
        onClick={handleSend}
        disabled={disabled || !message.trim()}
        className="
          px-4 py-2 h-10
          btn-neo rounded-sm
          disabled:opacity-50 disabled:cursor-not-allowed
        "
      >
        SEND
      </button>
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
