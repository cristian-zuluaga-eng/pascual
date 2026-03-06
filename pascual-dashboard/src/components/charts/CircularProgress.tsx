"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface CircularProgressProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  label?: string;
  showValue?: boolean;
}

export function CircularProgress({
  value,
  max = 100,
  size = 100,
  strokeWidth = 8,
  color = "#00d9ff",
  label,
  showValue = true,
}: CircularProgressProps) {
  const percentage = Math.min((value / max) * 100, 100);
  const data = [
    { value: percentage },
    { value: 100 - percentage },
  ];

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={size / 2 - strokeWidth}
            outerRadius={size / 2}
            startAngle={90}
            endAngle={-270}
            paddingAngle={0}
            dataKey="value"
            stroke="none"
          >
            <Cell fill={color} />
            <Cell fill="#262626" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {showValue && (
          <span
            className="font-mono font-bold"
            style={{ color, fontSize: size / 4 }}
          >
            {Math.round(percentage)}%
          </span>
        )}
        {label && (
          <span className="font-mono text-zinc-500" style={{ fontSize: size / 8 }}>
            {label}
          </span>
        )}
      </div>
    </div>
  );
}

interface DonutChartData {
  name: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  data: DonutChartData[];
  size?: number;
  strokeWidth?: number;
  centerLabel?: string;
  centerValue?: string;
}

export function DonutChart({
  data,
  size = 150,
  strokeWidth = 20,
  centerLabel,
  centerValue,
}: DonutChartProps) {
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={size / 2 - strokeWidth}
            outerRadius={size / 2}
            paddingAngle={2}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      {(centerLabel || centerValue) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {centerValue && (
            <span className="font-mono font-bold text-white" style={{ fontSize: size / 5 }}>
              {centerValue}
            </span>
          )}
          {centerLabel && (
            <span className="font-mono text-zinc-500" style={{ fontSize: size / 10 }}>
              {centerLabel}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
