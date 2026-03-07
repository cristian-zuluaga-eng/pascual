"use client";

import { ReactNode, useEffect } from "react";

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
}: ModalProps) {
  // Manejar tecla Escape
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, closeOnEscape, onClose]);

  // Bloquear scroll del body cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

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
        role="dialog"
        aria-modal="true"
        className={`
          relative w-full mx-4 animate-scale-in
          ${getSizeClasses(size)}
          ${className}
        `}
      >
        {/* Close Button */}
        {showCloseButton && (
          <button
            onClick={onClose}
            className="absolute top-3 right-3 z-10 p-1.5 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-sm transition-colors"
            aria-label="Cerrar"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
}

export function ModalHeader({ children, showClose = false, onClose, className = "" }: ModalHeaderProps) {
  return (
    <div className={`flex items-center justify-between p-4 border-b border-zinc-800 ${className}`}>
      <div className="flex-1">{children}</div>
      {showClose && onClose && (
        <button
          onClick={onClose}
          className="p-1.5 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-sm transition-colors ml-4"
          aria-label="Cerrar"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
}

export function ModalBody({ children, className = "" }: ModalBodyProps) {
  return (
    <div className={`p-4 ${className}`}>
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
    <div className={`flex items-center justify-end gap-3 p-4 border-t border-zinc-800 bg-zinc-900/50 ${className}`}>
      {children}
    </div>
  );
}

// ============================================================================
// HOOK - useModal para manejo de estado
// ============================================================================

import { useState, useCallback } from "react";

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
  const toggle = useCallback(() => setIsOpen(prev => !prev), []);

  return {
    isOpen,
    open,
    close,
    toggle,
  };
}

export default Modal;
