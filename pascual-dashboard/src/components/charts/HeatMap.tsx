"use client";

import { useState } from "react";
import {
  TimeRangeSelector,
  TimeRange,
} from "@/components/ui/TimeRangeSelector";

interface HeatMapCell {
  value: number;
  label?: string;
}

interface HeatMapProps {
  data: HeatMapCell[][];
  xLabels?: string[];
  yLabels?: string[];
  minColor?: string;
  maxColor?: string;
  cellSize?: number;
  gap?: number;
  showTimeRange?: boolean;
  title?: string;
  fullWidth?: boolean;
}

function interpolateColor(color1: string, color2: string, factor: number): string {
  const hex = (color: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 0, g: 0, b: 0 };
  };

  const c1 = hex(color1);
  const c2 = hex(color2);

  const r = Math.round(c1.r + factor * (c2.r - c1.r));
  const g = Math.round(c1.g + factor * (c2.g - c1.g));
  const b = Math.round(c1.b + factor * (c2.b - c1.b));

  return `rgb(${r}, ${g}, ${b})`;
}

export function HeatMap({
  data,
  xLabels,
  yLabels,
  minColor = "#171717",
  maxColor = "#00d9ff",
  cellSize = 24,
  gap = 2,
  showTimeRange = false,
  title,
  fullWidth = false,
}: HeatMapProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>("24h");

  // Expand data based on time range
  const getDataForRange = (range: TimeRange): HeatMapCell[][] => {
    switch (range) {
      case "24h":
        return data.slice(-7);
      case "7d":
        return data;
      case "1m":
        return [...data, ...data].slice(-14);
      case "1y":
        return [...data, ...data, ...data].slice(-21);
      default:
        return data;
    }
  };

  const chartData = showTimeRange ? getDataForRange(timeRange) : data;

  // Find min and max values
  const flatData = chartData.flat();
  const minValue = Math.min(...flatData.map((d) => d.value));
  const maxValue = Math.max(...flatData.map((d) => d.value));
  const range = maxValue - minValue || 1;

  return (
    <div className="font-mono">
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
      {/* X Labels */}
      {xLabels && (
        <div
          className={`flex mb-1 ${fullWidth ? "w-full" : ""}`}
          style={{ marginLeft: yLabels ? (fullWidth ? 28 : 40) : 0, gap }}
        >
          {xLabels.map((label, i) => (
            <div
              key={i}
              className={`text-zinc-400 text-[10px] text-center ${fullWidth ? "flex-1" : ""}`}
              style={fullWidth ? undefined : { width: cellSize }}
            >
              {label}
            </div>
          ))}
        </div>
      )}

      {/* Grid */}
      <div className={`flex flex-col ${fullWidth ? "w-full" : ""}`} style={{ gap }}>
        {chartData.map((row, rowIndex) => (
          <div key={rowIndex} className={`flex items-center ${fullWidth ? "w-full" : ""}`} style={{ gap }}>
            {/* Y Label */}
            {yLabels && (
              <div
                className={`text-zinc-400 text-[10px] text-right pr-1 flex-shrink-0 ${fullWidth ? "w-7" : "w-10 pr-2"}`}
              >
                {yLabels[rowIndex]}
              </div>
            )}

            {/* Cells */}
            {row.map((cell, colIndex) => {
              const factor = (cell.value - minValue) / range;
              const bgColor = interpolateColor(minColor, maxColor, factor);

              return (
                <div
                  key={colIndex}
                  className={`rounded-sm transition-all duration-200 hover:scale-105 cursor-pointer group relative ${fullWidth ? "flex-1" : ""}`}
                  style={{
                    width: fullWidth ? undefined : cellSize,
                    height: fullWidth ? 28 : cellSize,
                    backgroundColor: bgColor,
                    boxShadow: factor > 0.7 ? `0 0 8px ${maxColor}50` : "none",
                  }}
                  title={cell.label || `${cell.value}`}
                >
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-zinc-900 border border-zinc-800 rounded text-xs text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    {cell.label || cell.value}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
