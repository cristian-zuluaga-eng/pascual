"use client";

import { InputHTMLAttributes, forwardRef, useState, useRef, useEffect } from "react";

// ============================================================================
// SLIDER - Control deslizante para valores numéricos
// ============================================================================

interface SliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "onChange"> {
  /** Valor actual */
  value: number;
  /** Callback cuando cambia el valor */
  onChange: (value: number) => void;
  /** Valor mínimo */
  min?: number;
  /** Valor máximo */
  max?: number;
  /** Incremento por paso */
  step?: number;
  /** Etiqueta del slider */
  label?: string;
  /** Mostrar el valor actual */
  showValue?: boolean;
  /** Formato del valor mostrado */
  formatValue?: (value: number) => string;
  /** Variante de color */
  variant?: "default" | "success" | "danger" | "warning";
  /** Mostrar marcas en los pasos */
  showTicks?: boolean;
  /** Etiquetas para los extremos */
  minLabel?: string;
  maxLabel?: string;
  /** Deshabilitar el slider */
  disabled?: boolean;
}

const getVariantColor = (variant: "default" | "success" | "danger" | "warning") => {
  switch (variant) {
    case "success":
      return { track: "bg-[#39ff14]", thumb: "border-[#39ff14]", glow: "shadow-[0_0_10px_rgba(57,255,20,0.5)]" };
    case "danger":
      return { track: "bg-[#ff006e]", thumb: "border-[#ff006e]", glow: "shadow-[0_0_10px_rgba(255,0,110,0.5)]" };
    case "warning":
      return { track: "bg-amber-400", thumb: "border-amber-400", glow: "shadow-[0_0_10px_rgba(251,191,36,0.5)]" };
    default:
      return { track: "bg-[#00d9ff]", thumb: "border-[#00d9ff]", glow: "shadow-[0_0_10px_rgba(0,217,255,0.5)]" };
  }
};

export const Slider = forwardRef<HTMLInputElement, SliderProps>(
  ({
    value,
    onChange,
    min = 0,
    max = 100,
    step = 1,
    label,
    showValue = true,
    formatValue = (v) => String(v),
    variant = "default",
    showTicks = false,
    minLabel,
    maxLabel,
    disabled = false,
    className = "",
    ...props
  }, ref) => {
    const colors = getVariantColor(variant);
    const percentage = ((value - min) / (max - min)) * 100;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(Number(e.target.value));
    };

    // Calcular ticks si están habilitados
    const ticks = showTicks ? Array.from({ length: Math.floor((max - min) / step) + 1 }, (_, i) => min + i * step) : [];

    return (
      <div className={`w-full ${className}`}>
        {/* Header: Label + Value */}
        {(label || showValue) && (
          <div className="flex items-center justify-between mb-2">
            {label && (
              <label className="font-mono text-xs text-zinc-400 uppercase tracking-wider">
                {label}
              </label>
            )}
            {showValue && (
              <span className={`font-mono text-sm font-bold ${colors.track.replace("bg-", "text-")}`}>
                {formatValue(value)}
              </span>
            )}
          </div>
        )}

        {/* Slider container */}
        <div className={`relative ${disabled ? "opacity-50" : ""}`}>
          {/* Track background */}
          <div className="absolute top-1/2 -translate-y-1/2 w-full h-2 bg-zinc-800 rounded-full" />

          {/* Track fill */}
          <div
            className={`absolute top-1/2 -translate-y-1/2 h-2 rounded-full ${colors.track}`}
            style={{ width: `${percentage}%` }}
          />

          {/* Input range */}
          <input
            ref={ref}
            type="range"
            value={value}
            onChange={handleChange}
            min={min}
            max={max}
            step={step}
            disabled={disabled}
            className={`
              relative w-full h-2 appearance-none bg-transparent cursor-pointer
              disabled:cursor-not-allowed
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:w-5
              [&::-webkit-slider-thumb]:h-5
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-zinc-950
              [&::-webkit-slider-thumb]:border-2
              [&::-webkit-slider-thumb]:${colors.thumb}
              [&::-webkit-slider-thumb]:${colors.glow}
              [&::-webkit-slider-thumb]:transition-all
              [&::-webkit-slider-thumb]:duration-200
              [&::-webkit-slider-thumb]:hover:scale-110
              [&::-moz-range-thumb]:appearance-none
              [&::-moz-range-thumb]:w-5
              [&::-moz-range-thumb]:h-5
              [&::-moz-range-thumb]:rounded-full
              [&::-moz-range-thumb]:bg-zinc-950
              [&::-moz-range-thumb]:border-2
              [&::-moz-range-thumb]:border-[#00d9ff]
              focus:outline-none
            `}
            {...props}
          />

          {/* Ticks */}
          {showTicks && ticks.length <= 11 && (
            <div className="absolute top-full mt-1 w-full flex justify-between px-[10px]">
              {ticks.map((tick) => (
                <div key={tick} className="flex flex-col items-center">
                  <div className="w-px h-1.5 bg-zinc-700" />
                  <span className="font-mono text-[9px] text-zinc-600 mt-0.5">{tick}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Min/Max labels */}
        {(minLabel || maxLabel) && !showTicks && (
          <div className="flex justify-between mt-1">
            <span className="font-mono text-[10px] text-zinc-600">{minLabel || min}</span>
            <span className="font-mono text-[10px] text-zinc-600">{maxLabel || max}</span>
          </div>
        )}
      </div>
    );
  }
);

Slider.displayName = "Slider";

// ============================================================================
// RANGE SLIDER - Slider con dos valores (rango)
// ============================================================================

interface RangeSliderProps {
  /** Valor mínimo seleccionado */
  minValue: number;
  /** Valor máximo seleccionado */
  maxValue: number;
  /** Callback cuando cambian los valores */
  onChange: (minValue: number, maxValue: number) => void;
  /** Valor mínimo permitido */
  min?: number;
  /** Valor máximo permitido */
  max?: number;
  /** Incremento por paso */
  step?: number;
  /** Etiqueta del slider */
  label?: string;
  /** Mostrar los valores actuales */
  showValue?: boolean;
  /** Formato de los valores mostrados */
  formatValue?: (value: number) => string;
  /** Variante de color */
  variant?: "default" | "success" | "danger" | "warning";
  /** Deshabilitar el slider */
  disabled?: boolean;
  /** Clase CSS adicional */
  className?: string;
}

export function RangeSlider({
  minValue,
  maxValue,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  label,
  showValue = true,
  formatValue = (v) => String(v),
  variant = "default",
  disabled = false,
  className = "",
}: RangeSliderProps) {
  const colors = getVariantColor(variant);
  const minPercentage = ((minValue - min) / (max - min)) * 100;
  const maxPercentage = ((maxValue - min) / (max - min)) * 100;

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMin = Math.min(Number(e.target.value), maxValue - step);
    onChange(newMin, maxValue);
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMax = Math.max(Number(e.target.value), minValue + step);
    onChange(minValue, newMax);
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Header */}
      {(label || showValue) && (
        <div className="flex items-center justify-between mb-2">
          {label && (
            <label className="font-mono text-xs text-zinc-400 uppercase tracking-wider">
              {label}
            </label>
          )}
          {showValue && (
            <span className={`font-mono text-sm font-bold ${colors.track.replace("bg-", "text-")}`}>
              {formatValue(minValue)} - {formatValue(maxValue)}
            </span>
          )}
        </div>
      )}

      {/* Slider container */}
      <div className={`relative h-5 ${disabled ? "opacity-50" : ""}`}>
        {/* Track background */}
        <div className="absolute top-1/2 -translate-y-1/2 w-full h-2 bg-zinc-800 rounded-full" />

        {/* Track fill (between thumbs) */}
        <div
          className={`absolute top-1/2 -translate-y-1/2 h-2 ${colors.track}`}
          style={{
            left: `${minPercentage}%`,
            width: `${maxPercentage - minPercentage}%`,
          }}
        />

        {/* Min input */}
        <input
          type="range"
          value={minValue}
          onChange={handleMinChange}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          className="absolute w-full h-2 appearance-none bg-transparent cursor-pointer pointer-events-none
            [&::-webkit-slider-thumb]:pointer-events-auto
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-5
            [&::-webkit-slider-thumb]:h-5
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-zinc-950
            [&::-webkit-slider-thumb]:border-2
            [&::-webkit-slider-thumb]:border-[#00d9ff]
            [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(0,217,255,0.5)]
            [&::-webkit-slider-thumb]:cursor-pointer
            [&::-webkit-slider-thumb]:relative
            [&::-webkit-slider-thumb]:z-10"
        />

        {/* Max input */}
        <input
          type="range"
          value={maxValue}
          onChange={handleMaxChange}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          className="absolute w-full h-2 appearance-none bg-transparent cursor-pointer pointer-events-none
            [&::-webkit-slider-thumb]:pointer-events-auto
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-5
            [&::-webkit-slider-thumb]:h-5
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-zinc-950
            [&::-webkit-slider-thumb]:border-2
            [&::-webkit-slider-thumb]:border-[#00d9ff]
            [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(0,217,255,0.5)]
            [&::-webkit-slider-thumb]:cursor-pointer
            [&::-webkit-slider-thumb]:relative
            [&::-webkit-slider-thumb]:z-10"
        />
      </div>

      {/* Min/Max labels */}
      <div className="flex justify-between mt-1">
        <span className="font-mono text-[10px] text-zinc-600">{min}</span>
        <span className="font-mono text-[10px] text-zinc-600">{max}</span>
      </div>
    </div>
  );
}

export default Slider;
