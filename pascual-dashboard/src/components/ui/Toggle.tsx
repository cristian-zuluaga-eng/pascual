"use client";

import { InputHTMLAttributes, forwardRef } from "react";

// ============================================================================
// TOGGLE - Switch/Toggle button
// ============================================================================

interface ToggleProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  /** Estado del toggle */
  checked?: boolean;
  /** Callback cuando cambia el estado */
  onCheckedChange?: (checked: boolean) => void;
  /** Etiqueta del toggle */
  label?: string;
  /** Descripción adicional */
  description?: string;
  /** Tamaño del toggle */
  size?: "sm" | "md" | "lg";
  /** Variante de color cuando está activo */
  variant?: "default" | "success" | "danger" | "warning";
  /** Deshabilitar el toggle */
  disabled?: boolean;
}

const getSizeClasses = (size: "sm" | "md" | "lg") => {
  switch (size) {
    case "sm":
      return {
        track: "w-8 h-4",
        thumb: "w-3 h-3",
        translate: "translate-x-4",
      };
    case "lg":
      return {
        track: "w-14 h-7",
        thumb: "w-6 h-6",
        translate: "translate-x-7",
      };
    default:
      return {
        track: "w-11 h-6",
        thumb: "w-5 h-5",
        translate: "translate-x-5",
      };
  }
};

const getVariantColor = (variant: "default" | "success" | "danger" | "warning") => {
  switch (variant) {
    case "success":
      return "bg-[#39ff14]";
    case "danger":
      return "bg-[#ff006e]";
    case "warning":
      return "bg-amber-400";
    default:
      return "bg-[#00d9ff]";
  }
};

export const Toggle = forwardRef<HTMLInputElement, ToggleProps>(
  ({
    checked = false,
    onCheckedChange,
    label,
    description,
    size = "md",
    variant = "default",
    disabled = false,
    className = "",
    onChange,
    ...props
  }, ref) => {
    const sizeClasses = getSizeClasses(size);
    const variantColor = getVariantColor(variant);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e);
      onCheckedChange?.(e.target.checked);
    };

    return (
      <label className={`inline-flex items-start gap-3 ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"} ${className}`}>
        <div className="relative flex-shrink-0">
          <input
            ref={ref}
            type="checkbox"
            checked={checked}
            onChange={handleChange}
            disabled={disabled}
            className="sr-only peer"
            {...props}
          />
          {/* Track */}
          <div
            className={`
              ${sizeClasses.track}
              bg-zinc-700 rounded-full
              peer-checked:${variantColor}
              peer-focus:ring-2 peer-focus:ring-[#00d9ff]/30
              transition-colors duration-200
              ${checked ? variantColor : "bg-zinc-700"}
            `}
          />
          {/* Thumb */}
          <div
            className={`
              absolute top-0.5 left-0.5
              ${sizeClasses.thumb}
              bg-white rounded-full
              shadow-md
              transition-transform duration-200
              ${checked ? sizeClasses.translate : "translate-x-0"}
            `}
          />
        </div>
        {(label || description) && (
          <div className="flex flex-col">
            {label && (
              <span className="font-mono text-sm text-white">{label}</span>
            )}
            {description && (
              <span className="font-mono text-xs text-zinc-500">{description}</span>
            )}
          </div>
        )}
      </label>
    );
  }
);

Toggle.displayName = "Toggle";

export default Toggle;
