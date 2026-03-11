"use client";

import { useState, useEffect } from "react";

/**
 * Hook para detectar preferencia de movimiento reducido del usuario
 *
 * Respeta la configuración de accesibilidad del sistema operativo
 * para reducir o eliminar animaciones según las preferencias del usuario.
 *
 * @returns true si el usuario prefiere movimiento reducido
 *
 * @example
 * ```tsx
 * function AnimatedComponent() {
 *   const prefersReducedMotion = useReducedMotion();
 *
 *   return (
 *     <div className={prefersReducedMotion ? "" : "animate-bounce"}>
 *       Contenido
 *     </div>
 *   );
 * }
 * ```
 */
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // SSR safe: solo ejecutar en el cliente
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    // Establecer estado inicial
    setPrefersReducedMotion(mediaQuery.matches);

    // Escuchar cambios en la preferencia
    const handler = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener("change", handler);

    return () => {
      mediaQuery.removeEventListener("change", handler);
    };
  }, []);

  return prefersReducedMotion;
}

/**
 * Hook para pausar animaciones cuando el elemento no está visible
 *
 * Útil para optimizar performance pausando animaciones fuera del viewport.
 *
 * @param ref - Ref del elemento a observar
 * @returns true si el elemento está visible en el viewport
 *
 * @example
 * ```tsx
 * function AnimatedCard() {
 *   const ref = useRef<HTMLDivElement>(null);
 *   const isVisible = useIsVisible(ref);
 *
 *   return (
 *     <div ref={ref} className={isVisible ? "animate-pulse" : ""}>
 *       Contenido
 *     </div>
 *   );
 * }
 * ```
 */
export function useIsVisible(ref: React.RefObject<Element>): boolean {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      {
        threshold: 0.1, // 10% del elemento visible
      }
    );

    observer.observe(ref.current);

    return () => {
      observer.disconnect();
    };
  }, [ref]);

  return isVisible;
}

/**
 * Hook combinado para animaciones optimizadas
 *
 * Combina reducedMotion y visibilidad para decidir si animar.
 *
 * @param ref - Ref del elemento a observar
 * @returns true si se debe mostrar la animación
 */
export function useShouldAnimate(ref: React.RefObject<Element>): boolean {
  const prefersReducedMotion = useReducedMotion();
  const isVisible = useIsVisible(ref);

  // No animar si: prefiere reducir movimiento O no está visible
  return !prefersReducedMotion && isVisible;
}

export default useReducedMotion;
