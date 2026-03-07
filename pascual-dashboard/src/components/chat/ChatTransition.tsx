"use client";

import { useEffect, useState, useRef, createContext, useContext, ReactNode } from "react";
import { usePathname } from "next/navigation";

interface ChatTransitionState {
  isAnimating: boolean;
  direction: "compact" | "expand" | null;
  showGrowlAfterAnimation: boolean;
}

// Context for chat transition state
interface ChatTransitionContextType {
  isAnimating: boolean;
  direction: "compact" | "expand" | null;
  showMinimizedGrowl: boolean;
  isOnDashboard: boolean;
}

const ChatTransitionContext = createContext<ChatTransitionContextType>({
  isAnimating: false,
  direction: null,
  showMinimizedGrowl: false,
  isOnDashboard: true,
});

export function ChatTransitionProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [state, setState] = useState<ChatTransitionState>({
    isAnimating: false,
    direction: null,
    showGrowlAfterAnimation: false,
  });
  const previousPathRef = useRef<string | null>(null);
  const isInitializedRef = useRef(false);

  const isDashboardHome = pathname === "/dashboard";

  useEffect(() => {
    // First render - just store the initial path
    if (!isInitializedRef.current) {
      previousPathRef.current = pathname;
      isInitializedRef.current = true;
      return;
    }

    const wasOnDashboard = previousPathRef.current === "/dashboard";

    // Update ref for next comparison
    previousPathRef.current = pathname;

    let timer: ReturnType<typeof setTimeout> | null = null;

    // Leaving dashboard home -> compact animation
    if (wasOnDashboard && !isDashboardHome) {
      // Use requestAnimationFrame to batch the state update
      requestAnimationFrame(() => {
        setState({
          isAnimating: true,
          direction: "compact",
          showGrowlAfterAnimation: true,
        });
      });

      timer = setTimeout(() => {
        setState(prev => ({
          ...prev,
          isAnimating: false,
          direction: null,
        }));
      }, 600);
    }

    // Returning to dashboard home -> expand animation
    if (!wasOnDashboard && isDashboardHome) {
      requestAnimationFrame(() => {
        setState({
          isAnimating: true,
          direction: "expand",
          showGrowlAfterAnimation: false,
        });
      });

      timer = setTimeout(() => {
        setState({
          isAnimating: false,
          direction: null,
          showGrowlAfterAnimation: false,
        });
      }, 600);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [pathname, isDashboardHome]);

  return (
    <ChatTransitionContext.Provider
      value={{
        isAnimating: state.isAnimating,
        direction: state.direction,
        showMinimizedGrowl: state.showGrowlAfterAnimation && !isDashboardHome,
        isOnDashboard: isDashboardHome,
      }}
    >
      {children}
    </ChatTransitionContext.Provider>
  );
}

export function useChatTransitionContext() {
  return useContext(ChatTransitionContext);
}

// Floating animation element that shows during transition
export function ChatTransitionOverlay() {
  const { isAnimating, direction } = useChatTransitionContext();

  if (!isAnimating) return null;

  return (
    <div
      className={`
        fixed z-[100] bg-zinc-950 border border-zinc-800 rounded-sm shadow-2xl overflow-hidden
        pointer-events-none
        ${direction === "compact" ? "animate-chat-compact" : "animate-chat-expand"}
      `}
    >
      {/* Simplified chat preview during animation */}
      <div className="flex items-center gap-3 px-4 py-3 bg-zinc-900 border-b border-zinc-800">
        <span className="text-[#00d9ff] text-xl animate-robot-idle">◉</span>
        <div>
          <h3 className="font-mono text-sm font-bold text-white">Pascual</h3>
          <p className="font-mono text-[10px] text-zinc-500">Asistente del ecosistema</p>
        </div>
      </div>
      <div className="p-4 min-h-[100px] bg-zinc-950">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm">◉</span>
          <span className="font-mono text-[10px] text-zinc-500">Pascual</span>
        </div>
        <div className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2">
          <p className="font-mono text-[13px] text-zinc-300">Hola, soy Pascual...</p>
        </div>
      </div>
    </div>
  );
}
