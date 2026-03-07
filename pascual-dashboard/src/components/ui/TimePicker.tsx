"use client";

import { useState, useRef, useEffect } from "react";

// ============================================================================
// TIME PICKER - Selector de hora
// ============================================================================

interface TimePickerProps {
  /** Valor actual (formato HH:MM) */
  value: string;
  /** Callback cuando cambia el valor */
  onChange: (value: string) => void;
  /** Etiqueta del campo */
  label?: string;
  /** Placeholder */
  placeholder?: string;
  /** Formato de 24 horas o 12 horas */
  format?: "24h" | "12h";
  /** Incremento de minutos */
  minuteStep?: number;
  /** Hora mínima permitida (HH:MM) */
  minTime?: string;
  /** Hora máxima permitida (HH:MM) */
  maxTime?: string;
  /** Deshabilitar el campo */
  disabled?: boolean;
  /** Mensaje de error */
  error?: string;
  /** Clase CSS adicional */
  className?: string;
}

export function TimePicker({
  value,
  onChange,
  label,
  placeholder = "HH:MM",
  format = "24h",
  minuteStep = 5,
  minTime,
  maxTime,
  disabled = false,
  error,
  className = "",
}: TimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [internalValue, setInternalValue] = useState(value);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parsear valor actual
  const parseTime = (time: string) => {
    const [hours, minutes] = time.split(":").map(Number);
    return { hours: hours || 0, minutes: minutes || 0 };
  };

  const { hours, minutes } = parseTime(value);

  // Generar opciones de horas
  const hourOptions = format === "24h"
    ? Array.from({ length: 24 }, (_, i) => i)
    : Array.from({ length: 12 }, (_, i) => i + 1);

  // Generar opciones de minutos
  const minuteOptions = Array.from({ length: 60 / minuteStep }, (_, i) => i * minuteStep);

  // Formatear número con ceros
  const pad = (n: number) => n.toString().padStart(2, "0");

  // Manejar selección de hora
  const handleHourSelect = (hour: number) => {
    const newValue = `${pad(hour)}:${pad(minutes)}`;
    onChange(newValue);
  };

  // Manejar selección de minutos
  const handleMinuteSelect = (minute: number) => {
    const newValue = `${pad(hours)}:${pad(minute)}`;
    onChange(newValue);
    setIsOpen(false);
  };

  // Manejar input directo
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInternalValue(newValue);

    // Validar formato
    if (/^\d{2}:\d{2}$/.test(newValue)) {
      const [h, m] = newValue.split(":").map(Number);
      if (h >= 0 && h < 24 && m >= 0 && m < 60) {
        onChange(newValue);
      }
    }
  };

  // Cerrar al click fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sincronizar valor interno
  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {label && (
        <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider mb-1">
          {label}
        </label>
      )}

      {/* Input */}
      <div className="relative">
        <input
          type="text"
          value={internalValue}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            w-full px-3 py-2 pr-10
            bg-zinc-900 border rounded-sm
            text-white font-mono text-sm
            placeholder:text-zinc-600
            focus:outline-none focus:border-[#00d9ff] focus:shadow-[0_0_10px_rgba(0,217,255,0.2)]
            transition-all duration-200
            ${error ? "border-[#ff006e]" : "border-zinc-800"}
            ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
          `}
        />
        {/* Clock icon */}
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-[#00d9ff] transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </button>
      </div>

      {error && (
        <p className="mt-1 text-xs font-mono text-[#ff006e]">{error}</p>
      )}

      {/* Dropdown */}
      {isOpen && !disabled && (
        <div className="absolute z-50 mt-1 w-full bg-zinc-900 border border-zinc-700 rounded-sm shadow-xl animate-scale-in">
          <div className="flex">
            {/* Hours column */}
            <div className="flex-1 border-r border-zinc-800">
              <div className="px-2 py-1.5 bg-zinc-800 border-b border-zinc-700">
                <span className="font-mono text-[10px] text-zinc-400 uppercase">Hora</span>
              </div>
              <div className="max-h-48 overflow-y-auto scrollbar-thin">
                {hourOptions.map((hour) => (
                  <button
                    key={hour}
                    onClick={() => handleHourSelect(hour)}
                    className={`
                      w-full px-3 py-1.5 text-left font-mono text-sm
                      transition-colors
                      ${hours === hour
                        ? "bg-[#00d9ff]/20 text-[#00d9ff]"
                        : "text-zinc-300 hover:bg-zinc-800"
                      }
                    `}
                  >
                    {pad(hour)}
                  </button>
                ))}
              </div>
            </div>

            {/* Minutes column */}
            <div className="flex-1">
              <div className="px-2 py-1.5 bg-zinc-800 border-b border-zinc-700">
                <span className="font-mono text-[10px] text-zinc-400 uppercase">Minuto</span>
              </div>
              <div className="max-h-48 overflow-y-auto scrollbar-thin">
                {minuteOptions.map((minute) => (
                  <button
                    key={minute}
                    onClick={() => handleMinuteSelect(minute)}
                    className={`
                      w-full px-3 py-1.5 text-left font-mono text-sm
                      transition-colors
                      ${minutes === minute
                        ? "bg-[#00d9ff]/20 text-[#00d9ff]"
                        : "text-zinc-300 hover:bg-zinc-800"
                      }
                    `}
                  >
                    {pad(minute)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Quick actions */}
          <div className="flex gap-1 p-2 border-t border-zinc-800 bg-zinc-800/50">
            <button
              onClick={() => {
                const now = new Date();
                onChange(`${pad(now.getHours())}:${pad(now.getMinutes())}`);
                setIsOpen(false);
              }}
              className="flex-1 px-2 py-1 font-mono text-[10px] text-zinc-400 hover:text-[#00d9ff] bg-zinc-800 hover:bg-zinc-700 rounded-sm transition-colors"
            >
              Ahora
            </button>
            <button
              onClick={() => {
                onChange("00:00");
                setIsOpen(false);
              }}
              className="flex-1 px-2 py-1 font-mono text-[10px] text-zinc-400 hover:text-[#00d9ff] bg-zinc-800 hover:bg-zinc-700 rounded-sm transition-colors"
            >
              Medianoche
            </button>
            <button
              onClick={() => {
                onChange("12:00");
                setIsOpen(false);
              }}
              className="flex-1 px-2 py-1 font-mono text-[10px] text-zinc-400 hover:text-[#00d9ff] bg-zinc-800 hover:bg-zinc-700 rounded-sm transition-colors"
            >
              Mediodía
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// TIME RANGE PICKER - Selector de rango de horas
// ============================================================================

interface TimeRangePickerProps {
  /** Hora de inicio */
  startTime: string;
  /** Hora de fin */
  endTime: string;
  /** Callback cuando cambia el rango */
  onChange: (startTime: string, endTime: string) => void;
  /** Etiqueta del campo */
  label?: string;
  /** Incremento de minutos */
  minuteStep?: number;
  /** Deshabilitar el campo */
  disabled?: boolean;
  /** Clase CSS adicional */
  className?: string;
}

export function TimeRangePicker({
  startTime,
  endTime,
  onChange,
  label,
  minuteStep = 15,
  disabled = false,
  className = "",
}: TimeRangePickerProps) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider mb-2">
          {label}
        </label>
      )}
      <div className="flex items-center gap-2">
        <TimePicker
          value={startTime}
          onChange={(value) => onChange(value, endTime)}
          placeholder="Inicio"
          minuteStep={minuteStep}
          disabled={disabled}
          className="flex-1"
        />
        <span className="font-mono text-zinc-500">→</span>
        <TimePicker
          value={endTime}
          onChange={(value) => onChange(startTime, value)}
          placeholder="Fin"
          minuteStep={minuteStep}
          disabled={disabled}
          className="flex-1"
        />
      </div>
    </div>
  );
}

export default TimePicker;
