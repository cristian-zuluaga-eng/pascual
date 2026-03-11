"use client";

/**
 * TimeRangeSelector Component
 *
 * Selector de rango de tiempo reutilizable para gráficos y dashboards.
 * Elimina la duplicación de este patrón en múltiples componentes.
 */

export type TimeRange = "24h" | "7d" | "1m" | "1y";

export const TIME_RANGE_LABELS: Record<TimeRange, string> = {
  "24h": "24H",
  "7d": "7D",
  "1m": "1M",
  "1y": "1Y",
};

interface TimeRangeSelectorProps {
  value: TimeRange;
  onChange: (range: TimeRange) => void;
  size?: "sm" | "md";
  className?: string;
}

export function TimeRangeSelector({
  value,
  onChange,
  size = "sm",
  className = "",
}: TimeRangeSelectorProps) {
  const sizeClasses = {
    sm: "px-1.5 py-0.5 text-[9px]",
    md: "px-2 py-1 text-[10px]",
  };

  return (
    <div className={`flex gap-0.5 ${className}`} role="group" aria-label="Selector de rango de tiempo">
      {(Object.keys(TIME_RANGE_LABELS) as TimeRange[]).map((range) => (
        <button
          key={range}
          onClick={() => onChange(range)}
          aria-pressed={value === range}
          className={`${sizeClasses[size]} font-mono rounded-sm transition-colors ${
            value === range
              ? "bg-zinc-700 text-white"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          {TIME_RANGE_LABELS[range]}
        </button>
      ))}
    </div>
  );
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Expande datos base según el rango de tiempo seleccionado
 * Útil para simular datos históricos a partir de datos actuales
 */
export function expandDataForRange<T>(baseData: T[], range: TimeRange): T[] {
  switch (range) {
    case "24h":
      return baseData.slice(-10);
    case "7d":
      return [...baseData, ...baseData.slice(0, 5)].slice(-15);
    case "1m":
      return [...baseData, ...baseData, ...baseData].slice(-30);
    case "1y":
      return [...baseData, ...baseData, ...baseData, ...baseData].slice(-40);
    default:
      return baseData;
  }
}

/**
 * Formatea etiquetas de eje según el rango de tiempo
 */
export function formatLabelForRange(index: number, range: TimeRange): string {
  switch (range) {
    case "24h":
      return `${index}h`;
    case "7d":
      return `D${index + 1}`;
    case "1m":
      return `W${Math.floor(index / 7) + 1}`;
    case "1y":
      return `M${index + 1}`;
    default:
      return `${index}`;
  }
}
