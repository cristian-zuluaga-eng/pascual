"use client";

import { ReactNode, useState, useCallback } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "./Modal";
import { Button } from "./Button";

// ============================================================================
// CONFIRM DIALOG - Ventana de confirmación usando Modal base
// ============================================================================

type ConfirmVariant = "default" | "danger" | "warning" | "success";

interface ConfirmDialogProps {
  /** Controla si el dialog está visible */
  isOpen: boolean;
  /** Callback cuando se cierra el dialog (cancelar o click fuera) */
  onClose: () => void;
  /** Callback cuando se confirma la acción */
  onConfirm: () => void;
  /** Título del dialog */
  title: string;
  /** Mensaje o descripción de la acción */
  message: string | ReactNode;
  /** Texto del botón de confirmación */
  confirmText?: string;
  /** Texto del botón de cancelar */
  cancelText?: string;
  /** Variante visual (afecta el color del botón de confirmación) */
  variant?: ConfirmVariant;
  /** Icono opcional a mostrar */
  icon?: ReactNode;
  /** Deshabilitar el botón de confirmar */
  confirmDisabled?: boolean;
  /** Estado de carga del botón de confirmar */
  confirmLoading?: boolean;
  /** Cerrar al hacer click fuera del dialog */
  closeOnOverlayClick?: boolean;
}

const getVariantConfig = (variant: ConfirmVariant) => {
  switch (variant) {
    case "danger":
      return {
        buttonVariant: "danger" as const,
        iconColor: "text-[#ff006e]",
        iconBg: "bg-rose-950/50",
        defaultIcon: "⚠",
      };
    case "warning":
      return {
        buttonVariant: "secondary" as const,
        iconColor: "text-amber-400",
        iconBg: "bg-amber-950/50",
        defaultIcon: "⚡",
      };
    case "success":
      return {
        buttonVariant: "primary" as const,
        iconColor: "text-[#39ff14]",
        iconBg: "bg-emerald-950/50",
        defaultIcon: "✓",
      };
    default:
      return {
        buttonVariant: "primary" as const,
        iconColor: "text-[#00d9ff]",
        iconBg: "bg-cyan-950/50",
        defaultIcon: "?",
      };
  }
};

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  variant = "default",
  icon,
  confirmDisabled = false,
  confirmLoading = false,
  closeOnOverlayClick = true,
}: ConfirmDialogProps) {
  const config = getVariantConfig(variant);

  const handleConfirm = () => {
    if (!confirmDisabled && !confirmLoading) {
      onConfirm();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      closeOnOverlayClick={closeOnOverlayClick}
    >
      <div className="bg-zinc-950 border border-zinc-700 rounded-sm shadow-2xl">
        <ModalHeader showClose onClose={onClose} className="border-b-0 pb-0">
          <div className="flex items-center gap-3">
            {/* Icon */}
            <div className={`p-2.5 rounded-sm ${config.iconBg}`}>
              <span className={`text-xl ${config.iconColor}`}>
                {icon || config.defaultIcon}
              </span>
            </div>
            <h2 className="font-mono text-lg font-bold text-white">{title}</h2>
          </div>
        </ModalHeader>

        <ModalBody className="pt-2">
          <div className="font-mono text-sm text-zinc-400 leading-relaxed">
            {message}
          </div>
        </ModalBody>

        <ModalFooter className="bg-transparent">
          <Button
            variant="ghost"
            onClick={onClose}
            className="flex-1"
          >
            {cancelText}
          </Button>
          <Button
            variant={config.buttonVariant}
            onClick={handleConfirm}
            disabled={confirmDisabled}
            loading={confirmLoading}
            className="flex-1"
          >
            {confirmText}
          </Button>
        </ModalFooter>
      </div>
    </Modal>
  );
}

// ============================================================================
// HOOK - useConfirmDialog para manejo de estado
// ============================================================================

interface UseConfirmDialogOptions {
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void;
}

interface ConfirmDialogState {
  isOpen: boolean;
  title: string;
  message: string | ReactNode;
  variant: ConfirmVariant;
  confirmText: string;
  cancelText: string;
  icon?: ReactNode;
}

/**
 * Hook para manejar el estado del ConfirmDialog
 *
 * @example
 * ```tsx
 * const { dialogProps, confirm, close } = useConfirmDialog();
 *
 * const handleDelete = () => {
 *   confirm({
 *     title: "Eliminar elemento",
 *     message: "¿Estás seguro de que deseas eliminar este elemento?",
 *     variant: "danger",
 *     confirmText: "Eliminar",
 *     onConfirm: async () => {
 *       await deleteItem();
 *       close();
 *     },
 *   });
 * };
 *
 * return (
 *   <>
 *     <Button onClick={handleDelete}>Eliminar</Button>
 *     <ConfirmDialog {...dialogProps} />
 *   </>
 * );
 * ```
 */
export function useConfirmDialog() {
  const [state, setState] = useState<ConfirmDialogState>({
    isOpen: false,
    title: "",
    message: "",
    variant: "default",
    confirmText: "Confirmar",
    cancelText: "Cancelar",
  });

  const [loading, setLoading] = useState(false);
  const [callbacks, setCallbacks] = useState<UseConfirmDialogOptions>({});

  const confirm = useCallback((options: Partial<ConfirmDialogState> & UseConfirmDialogOptions) => {
    const { onConfirm, onCancel, ...dialogOptions } = options;

    setState({
      isOpen: true,
      title: dialogOptions.title || "Confirmar acción",
      message: dialogOptions.message || "¿Estás seguro de que deseas continuar?",
      variant: dialogOptions.variant || "default",
      confirmText: dialogOptions.confirmText || "Confirmar",
      cancelText: dialogOptions.cancelText || "Cancelar",
      icon: dialogOptions.icon,
    });

    setCallbacks({ onConfirm, onCancel });
  }, []);

  const close = useCallback(() => {
    setState(prev => ({ ...prev, isOpen: false }));
    setLoading(false);
    callbacks.onCancel?.();
  }, [callbacks]);

  const handleConfirm = useCallback(async () => {
    if (callbacks.onConfirm) {
      setLoading(true);
      try {
        await callbacks.onConfirm();
      } finally {
        setLoading(false);
      }
    }
    setState(prev => ({ ...prev, isOpen: false }));
  }, [callbacks]);

  const dialogProps: ConfirmDialogProps = {
    isOpen: state.isOpen,
    onClose: close,
    onConfirm: handleConfirm,
    title: state.title,
    message: state.message,
    variant: state.variant,
    confirmText: state.confirmText,
    cancelText: state.cancelText,
    icon: state.icon,
    confirmLoading: loading,
  };

  return {
    dialogProps,
    confirm,
    close,
    isOpen: state.isOpen,
  };
}

export default ConfirmDialog;
