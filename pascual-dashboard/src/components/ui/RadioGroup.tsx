"use client";

import { createContext, useContext, ReactNode } from "react";

// ============================================================================
// RADIO GROUP - Grupo de radio buttons
// ============================================================================

interface RadioGroupContextValue {
  value: string;
  onChange: (value: string) => void;
  name: string;
  disabled?: boolean;
}

const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);

interface RadioGroupProps {
  /** Valor seleccionado */
  value: string;
  /** Callback cuando cambia la selección */
  onChange: (value: string) => void;
  /** Nombre del grupo (para formularios) */
  name: string;
  /** Etiqueta del grupo */
  label?: string;
  /** Orientación del grupo */
  orientation?: "horizontal" | "vertical";
  /** Deshabilitar todo el grupo */
  disabled?: boolean;
  /** Contenido (RadioItems) */
  children: ReactNode;
  /** Clase CSS adicional */
  className?: string;
}

export function RadioGroup({
  value,
  onChange,
  name,
  label,
  orientation = "vertical",
  disabled = false,
  children,
  className = "",
}: RadioGroupProps) {
  return (
    <RadioGroupContext.Provider value={{ value, onChange, name, disabled }}>
      <div className={className} role="radiogroup" aria-label={label}>
        {label && (
          <p className="font-mono text-xs text-zinc-400 uppercase tracking-wider mb-2">
            {label}
          </p>
        )}
        <div className={`flex ${orientation === "vertical" ? "flex-col gap-2" : "flex-row gap-4 flex-wrap"}`}>
          {children}
        </div>
      </div>
    </RadioGroupContext.Provider>
  );
}

// ============================================================================
// RADIO ITEM - Opción individual del grupo
// ============================================================================

interface RadioItemProps {
  /** Valor de esta opción */
  value: string;
  /** Etiqueta de la opción */
  label: string;
  /** Descripción adicional */
  description?: string;
  /** Deshabilitar esta opción */
  disabled?: boolean;
  /** Clase CSS adicional */
  className?: string;
}

export function RadioItem({
  value,
  label,
  description,
  disabled: itemDisabled = false,
  className = "",
}: RadioItemProps) {
  const context = useContext(RadioGroupContext);

  if (!context) {
    throw new Error("RadioItem must be used within a RadioGroup");
  }

  const { value: groupValue, onChange, name, disabled: groupDisabled } = context;
  const isChecked = groupValue === value;
  const isDisabled = groupDisabled || itemDisabled;

  return (
    <label
      className={`
        inline-flex items-start gap-3 p-2 rounded-sm
        ${isDisabled ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:bg-zinc-900"}
        ${isChecked ? "bg-zinc-900" : ""}
        transition-colors
        ${className}
      `}
    >
      <div className="relative flex-shrink-0 mt-0.5">
        <input
          type="radio"
          name={name}
          value={value}
          checked={isChecked}
          onChange={() => onChange(value)}
          disabled={isDisabled}
          className="sr-only peer"
        />
        {/* Outer circle */}
        <div
          className={`
            w-5 h-5 rounded-full border-2
            transition-colors duration-200
            ${isChecked
              ? "border-[#00d9ff] bg-zinc-900"
              : "border-zinc-600 bg-zinc-800"
            }
            ${!isDisabled && "peer-focus:ring-2 peer-focus:ring-[#00d9ff]/30"}
          `}
        />
        {/* Inner dot */}
        <div
          className={`
            absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
            w-2.5 h-2.5 rounded-full bg-[#00d9ff]
            transition-transform duration-200
            ${isChecked ? "scale-100" : "scale-0"}
          `}
        />
      </div>
      <div className="flex flex-col">
        <span className="font-mono text-sm text-white">{label}</span>
        {description && (
          <span className="font-mono text-xs text-zinc-500">{description}</span>
        )}
      </div>
    </label>
  );
}

// ============================================================================
// RADIO CARD - Variante de tarjeta para opciones más elaboradas
// ============================================================================

interface RadioCardProps {
  /** Valor de esta opción */
  value: string;
  /** Etiqueta de la opción */
  label: string;
  /** Descripción adicional */
  description?: string;
  /** Icono o elemento visual */
  icon?: ReactNode;
  /** Deshabilitar esta opción */
  disabled?: boolean;
  /** Clase CSS adicional */
  className?: string;
}

export function RadioCard({
  value,
  label,
  description,
  icon,
  disabled: itemDisabled = false,
  className = "",
}: RadioCardProps) {
  const context = useContext(RadioGroupContext);

  if (!context) {
    throw new Error("RadioCard must be used within a RadioGroup");
  }

  const { value: groupValue, onChange, name, disabled: groupDisabled } = context;
  const isChecked = groupValue === value;
  const isDisabled = groupDisabled || itemDisabled;

  return (
    <label
      className={`
        relative flex items-center gap-4 p-4 rounded-sm border
        ${isDisabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}
        ${isChecked
          ? "border-[#00d9ff] bg-[#00d9ff]/5"
          : "border-zinc-800 bg-zinc-900 hover:border-zinc-700"
        }
        transition-all duration-200
        ${className}
      `}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={isChecked}
        onChange={() => onChange(value)}
        disabled={isDisabled}
        className="sr-only"
      />
      {icon && (
        <div className={`text-2xl ${isChecked ? "text-[#00d9ff]" : "text-zinc-500"}`}>
          {icon}
        </div>
      )}
      <div className="flex-1">
        <span className={`font-mono text-sm ${isChecked ? "text-white" : "text-zinc-300"}`}>
          {label}
        </span>
        {description && (
          <p className="font-mono text-xs text-zinc-500 mt-0.5">{description}</p>
        )}
      </div>
      {/* Check indicator */}
      <div
        className={`
          w-5 h-5 rounded-full border-2 flex items-center justify-center
          transition-all duration-200
          ${isChecked
            ? "border-[#00d9ff] bg-[#00d9ff]"
            : "border-zinc-600"
          }
        `}
      >
        {isChecked && (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth="3">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </div>
    </label>
  );
}

export default RadioGroup;
