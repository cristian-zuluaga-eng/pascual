"use client";

import { useState } from "react";
import {
  Line,
  LineChart as RechartsLineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
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
  [key: string]: string | number;
}

interface LineChartProps {
  data: DataPoint[];
  dataKey?: string;
  height?: number;
  color?: string;
  showAxis?: boolean;
  showTooltip?: boolean;
  showTimeRange?: boolean;
  title?: string;
}

export function LineChart({
  data,
  dataKey = "value",
  height = 120,
  color = "#00d9ff",
  showAxis = true,
  showTooltip = true,
  showTimeRange = false,
  title,
}: LineChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>("24h");

  // Apply time range transformation if enabled
  const chartData = showTimeRange
    ? expandDataForRange(data.map(d => d.value), timeRange).map((value, index) => ({
        name: formatLabelForRange(index, timeRange),
        value,
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
        <RechartsLineChart data={chartData}>
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={1.5}
            dot={false}
            activeDot={{
              r: 4,
              fill: color,
              stroke: "#0a0a0a",
              strokeWidth: 2,
            }}
          />
          {showAxis && (
            <>
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#a1a1aa", fontSize: 10 }}
                dy={10}
                height={20}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#a1a1aa", fontSize: 10 }}
                width={30}
              />
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
              itemStyle={{ color }}
              formatter={(value) => [`${value}`, ""]}
              labelFormatter={() => ""}
            />
          )}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
}

interface SparklineProps {
  data: number[];
  color?: string;
  height?: number;
}

export function Sparkline({
  data,
  color = "#00d9ff",
  height = 30,
}: SparklineProps) {
  const chartData = data.map((value, index) => ({
    name: index.toString(),
    value,
  }));

  return (
    <LineChart
      data={chartData}
      height={height}
      color={color}
      showAxis={false}
      showTooltip={false}
    />
  );
}
