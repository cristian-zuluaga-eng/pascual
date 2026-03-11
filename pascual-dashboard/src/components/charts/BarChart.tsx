"use client";

import { useState } from "react";
import {
  Bar,
  BarChart as RechartsBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from "recharts";
import {
  TimeRangeSelector,
  TimeRange,
  expandDataForRange,
  formatLabelForRange,
} from "@/components/ui/TimeRangeSelector";

interface DataPoint {
  name: string;
  value: number;
  color?: string;
}

interface BarChartProps {
  data: DataPoint[];
  height?: number;
  color?: string;
  showAxis?: boolean;
  showTooltip?: boolean;
  horizontal?: boolean;
  showTimeRange?: boolean;
  title?: string;
}

export function BarChart({
  data,
  height = 200,
  color = "#00d9ff",
  showAxis = true,
  showTooltip = true,
  horizontal = false,
  showTimeRange = false,
  title,
}: BarChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>("24h");

  // Apply time range transformation if enabled
  const chartData = showTimeRange
    ? expandDataForRange(data.map(d => d.value), timeRange).map((value, index) => ({
        name: formatLabelForRange(index, timeRange),
        value,
        color: data[index % data.length]?.color,
      }))
    : data;

  return (
    <div className="w-full h-full font-mono">
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
      <ResponsiveContainer width="100%" height={height}>
        <RechartsBarChart
          data={chartData}
          layout={horizontal ? "vertical" : "horizontal"}
        >
          {showAxis && (
            <>
              {horizontal ? (
                <>
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "#a1a1aa", fontSize: 10 }} />
                  <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#a1a1aa", fontSize: 10 }} width={60} />
                </>
              ) : (
                <>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#a1a1aa", fontSize: 10 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "#a1a1aa", fontSize: 10 }} width={30} />
                </>
              )}
            </>
          )}
          {showTooltip && (
            <Tooltip
              contentStyle={{
                backgroundColor: "#18181b",
                borderColor: "#3f3f46",
                borderWidth: 1,
                borderRadius: 2,
                color: "#e4e4e7",
                fontFamily: "monospace",
                fontSize: "12px",
                boxShadow: `0 0 10px ${color}33`,
              }}
              cursor={{ fill: "rgba(255,255,255,0.05)" }}
            />
          )}
          <Bar dataKey="value" radius={[2, 2, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color || color} />
            ))}
          </Bar>
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}
