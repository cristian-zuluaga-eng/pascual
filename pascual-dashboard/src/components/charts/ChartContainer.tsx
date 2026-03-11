"use client";

import { useState, ReactNode } from "react";
import {
  TimeRangeSelector,
  TimeRange,
  TIME_RANGE_LABELS,
  expandDataForRange,
  formatLabelForRange,
} from "@/components/ui/TimeRangeSelector";

// Re-export types and helpers for backwards compatibility
export type { TimeRange };
export { TIME_RANGE_LABELS, expandDataForRange, formatLabelForRange };

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
            <p className="text-[10px] font-mono text-zinc-400 uppercase">{title}</p>
          )}
          {showTimeRange && (
            <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
          )}
        </div>
      )}
      {children(timeRange)}
    </div>
  );
}
