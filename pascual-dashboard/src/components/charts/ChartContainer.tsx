"use client";

import { useState, ReactNode } from "react";

export type TimeRange = "24h" | "7d" | "1m" | "1y";

export const TIME_RANGE_LABELS: Record<TimeRange, string> = {
  "24h": "24H",
  "7d": "7D",
  "1m": "1M",
  "1y": "1Y",
};

interface ChartContainerProps {
  title?: string;
  children: (timeRange: TimeRange) => ReactNode;
  showTimeRange?: boolean;
  defaultTimeRange?: TimeRange;
  className?: string;
}

export function ChartContainer({
  title,
  children,
  showTimeRange = false,
  defaultTimeRange = "24h",
  className = "",
}: ChartContainerProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>(defaultTimeRange);

  return (
    <div className={className}>
      {(title || showTimeRange) && (
        <div className="flex items-center justify-between mb-2">
          {title && (
            <p className="text-[10px] font-mono text-zinc-500 uppercase">{title}</p>
          )}
          {showTimeRange && (
            <div className="flex gap-0.5">
              {(Object.keys(TIME_RANGE_LABELS) as TimeRange[]).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-1.5 py-0.5 text-[9px] font-mono rounded-sm transition-colors ${
                    timeRange === range
                      ? "bg-zinc-700 text-white"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  {TIME_RANGE_LABELS[range]}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
      {children(timeRange)}
    </div>
  );
}

// Helper function to expand data based on time range
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

// Helper to format labels based on time range
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
