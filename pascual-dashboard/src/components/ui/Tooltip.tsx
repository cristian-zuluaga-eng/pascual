"use client";

import { ReactNode, useState } from "react";

interface TooltipProps {
  children: ReactNode;
  content: string;
  position?: "top" | "bottom" | "left" | "right";
  delay?: number;
  inline?: boolean;
}

export function Tooltip({
  children,
  content,
  position = "top",
  delay = 200,
  inline = false,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const showTooltip = () => {
    const id = setTimeout(() => setIsVisible(true), delay);
    setTimeoutId(id);
  };

  const hideTooltip = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
    setIsVisible(false);
  };

  const getPositionClasses = () => {
    switch (position) {
      case "top":
        return "bottom-full left-1/2 -translate-x-1/2 mb-2";
      case "bottom":
        return "top-full left-1/2 -translate-x-1/2 mt-2";
      case "left":
        return "right-full top-1/2 -translate-y-1/2 mr-2";
      case "right":
        return "left-full top-1/2 -translate-y-1/2 ml-2";
      default:
        return "bottom-full left-1/2 -translate-x-1/2 mb-2";
    }
  };

  const getArrowClasses = () => {
    switch (position) {
      case "top":
        return "top-full left-1/2 -translate-x-1/2 border-t-zinc-800 border-x-transparent border-b-transparent";
      case "bottom":
        return "bottom-full left-1/2 -translate-x-1/2 border-b-zinc-800 border-x-transparent border-t-transparent";
      case "left":
        return "left-full top-1/2 -translate-y-1/2 border-l-zinc-800 border-y-transparent border-r-transparent";
      case "right":
        return "right-full top-1/2 -translate-y-1/2 border-r-zinc-800 border-y-transparent border-l-transparent";
      default:
        return "top-full left-1/2 -translate-x-1/2 border-t-zinc-800 border-x-transparent border-b-transparent";
    }
  };

  return (
    <div
      className={`relative ${inline ? "inline-flex" : ""}`}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
    >
      {children}
      {isVisible && content && (
        <div
          className={`absolute z-50 ${getPositionClasses()} pointer-events-none`}
        >
          <div className="relative bg-zinc-900 border border-zinc-800 rounded-sm px-2 py-1.5 shadow-lg max-w-[200px]">
            <p className="text-xs font-mono text-zinc-300 whitespace-normal">
              {content}
            </p>
            <div
              className={`absolute w-0 h-0 border-4 ${getArrowClasses()}`}
            />
          </div>
        </div>
      )}
    </div>
  );
}
