"use client";

import { ReactNode, useEffect, useRef, useCallback, useState } from "react";

// ============================================================================
// MODAL - Componente base reutilizable para ventanas emergentes
// ============================================================================

type ModalSize = "sm" | "md" | "lg" | "xl" | "full";

interface ModalProps {
  /** Controla si el modal está visible */
  isOpen: boolean;
  /** Callback cuando se cierra el modal */
  onClose: () => void;
  /** Contenido del modal */
  children: ReactNode;
  /** Tamaño del modal */
  size?: ModalSize;
  /** Cerrar al hacer click en el overlay */
  closeOnOverlayClick?: boolean;
  /** Cerrar al presionar Escape */
  closeOnEscape?: boolean;
  /** Mostrar botón de cerrar en la esquina */
  showCloseButton?: boolean;
  /** Clase CSS adicional para el contenedor del modal */
  className?: string;
  /** Clase CSS adicional para el overlay */
  overlayClassName?: string;
  /** Título del modal para accesibilidad */
  ariaLabelledBy?: string;
  /** Descripción del modal para accesibilidad */
  ariaDescribedBy?: string;
}

const getSizeClasses = (size: ModalSize) => {
  switch (size) {
    case "sm":
      return "max-w-sm";
    case "md":
      return "max-w-md";
    case "lg":
      return "max-w-lg";
    case "xl":
      return "max-w-xl";
    case "full":
      return "max-w-[90vw] max-h-[90vh]";
    default:
      return "max-w-md";
  }
};

// Selector para elementos focusables
const FOCUSABLE_SELECTOR =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

export function Modal({
  isOpen,
  onClose,
  children,
  size = "md",
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showCloseButton = false,
  className = "",
  overlayClassName = "",
  ariaLabelledBy,
  ariaDescribedBy,
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Focus trap: obtener elementos focusables
  const getFocusableElements = useCallback(() => {
    if (!modalRef.current) return [];
    return Array.from(
      modalRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
    ).filter((el) => !el.hasAttribute("disabled") && el.offsetParent !== null);
  }, []);

  // Focus trap: manejar Tab y Shift+Tab
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && closeOnEscape) {
        onClose();
        return;
      }

      if (e.key !== "Tab") return;

      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        // Shift+Tab: si estamos en el primero, ir al último
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab: si estamos en el último, ir al primero
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    },
    [closeOnEscape, onClose, getFocusableElements]
  );

  // Manejar apertura y cierre del modal
  useEffect(() => {
    if (isOpen) {
      // Guardar elemento activo anterior
      previousActiveElement.current = document.activeElement as HTMLElement;

      // Bloquear scroll del body
      document.body.style.overflow = "hidden";

      // Agregar event listener para teclado
      document.addEventListener("keydown", handleKeyDown);

      // Focus en el primer elemento focusable después de renderizar
      requestAnimationFrame(() => {
        const focusableElements = getFocusableElements();
        if (focusableElements.length > 0) {
          focusableElements[0].focus();
        } else {
          // Si no hay elementos focusables, enfocar el modal mismo
          modalRef.current?.focus();
        }
      });
    } else {
      // Restaurar scroll del body
      document.body.style.overflow = "";

      // Restaurar focus al elemento anterior
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    }

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, handleKeyDown, getFocusableElements]);

  if (!isOpen) return null;

  const handleOverlayClick = () => {
    if (closeOnOverlayClick) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay/Backdrop */}
      <div
        className={`absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in ${overlayClassName}`}
        onClick={handleOverlayClick}
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={ariaLabelledBy}
        aria-describedby={ariaDescribedBy}
        tabIndex={-1}
        className={`
          relative w-full mx-4 animate-scale-in outline-none
          ${getSizeClasses(size)}
          ${className}
        `}
      >
        {/* Close Button */}
        {showCloseButton && (
          <button
            onClick={onClose}
            className="absolute top-3 right-3 z-10 p-1.5 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-sm transition-colors"
            aria-label="Cerrar modal"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}

        {/* Content */}
        {children}
      </div>
    </div>
  );
}

// ============================================================================
// MODAL HEADER
// ============================================================================

interface ModalHeaderProps {
  children: ReactNode;
  /** Mostrar botón de cerrar */
  showClose?: boolean;
  /** Callback al cerrar */
  onClose?: () => void;
  className?: string;
  /** ID para aria-labelledby */
  id?: string;
}

export function ModalHeader({
  children,
  showClose = false,
  onClose,
  className = "",
  id,
}: ModalHeaderProps) {
  return (
    <div
      id={id}
      className={`flex items-center justify-between p-4 border-b border-zinc-800 ${className}`}
    >
      <div className="flex-1">{children}</div>
      {showClose && onClose && (
        <button
          onClick={onClose}
          className="p-1.5 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-sm transition-colors ml-4"
          aria-label="Cerrar modal"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}
    </div>
  );
}

// ============================================================================
// MODAL BODY
// ============================================================================

interface ModalBodyProps {
  children: ReactNode;
  className?: string;
  /** ID para aria-describedby */
  id?: string;
}

export function ModalBody({ children, className = "", id }: ModalBodyProps) {
  return (
    <div id={id} className={`p-4 ${className}`}>
      {children}
    </div>
  );
}

// ============================================================================
// MODAL FOOTER
// ============================================================================

interface ModalFooterProps {
  children: ReactNode;
  className?: string;
}

export function ModalFooter({ children, className = "" }: ModalFooterProps) {
  return (
    <div
      className={`flex items-center justify-end gap-3 p-4 border-t border-zinc-800 bg-zinc-900/50 ${className}`}
    >
      {children}
    </div>
  );
}

// ============================================================================
// HOOK - useModal para manejo de estado
// ============================================================================

/**
 * Hook para manejar el estado de un modal
 *
 * @example
 * ```tsx
 * const { isOpen, open, close, toggle } = useModal();
 *
 * return (
 *   <>
 *     <Button onClick={open}>Abrir Modal</Button>
 *     <Modal isOpen={isOpen} onClose={close}>
 *       <ModalHeader showClose onClose={close}>
 *         <h2>Título</h2>
 *       </ModalHeader>
 *       <ModalBody>Contenido</ModalBody>
 *       <ModalFooter>
 *         <Button onClick={close}>Cerrar</Button>
 *       </ModalFooter>
 *     </Modal>
 *   </>
 * );
 * ```
 */
export function useModal(initialState = false) {
  const [isOpen, setIsOpen] = useState(initialState);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  return {
    isOpen,
    open,
    close,
    toggle,
  };
}

export default Modal;
