// Security events timeline
export const mockSecurityEvents = [
  { name: "00:00", value: 5 },
  { name: "04:00", value: 3 },
  { name: "08:00", value: 12 },
  { name: "12:00", value: 18 },
  { name: "16:00", value: 25 },
  { name: "20:00", value: 15 },
  { name: "Now", value: 8 },
];

// Threat categories
export const mockThreatCategories = [
  { name: "Scan", value: 45, color: "#00d9ff" },
  { name: "Auth", value: 28, color: "#ff006e" },
  { name: "API", value: 15, color: "#39ff14" },
  { name: "Other", value: 12, color: "#ffaa00" },
];

// System usage data
export const mockSystemUsageData = [
  { name: "00:00", value: 20 },
  { name: "04:00", value: 15 },
  { name: "08:00", value: 35 },
  { name: "12:00", value: 55 },
  { name: "16:00", value: 70 },
  { name: "20:00", value: 45 },
  { name: "Now", value: 42 },
];

// Resource allocation
export const mockResourceAllocation = [
  { name: "Agents", value: 45, color: "#00d9ff" },
  { name: "Tasks", value: 30, color: "#ff006e" },
  { name: "System", value: 25, color: "#39ff14" },
];

// Security stats
export const mockSecurityStats = {
  threatLevel: "Low",
  eventsToday: 86,
  eventsTrend: { value: 12, positive: false },
  blockedAttempts: 3,
  blockedTrend: { value: 50, positive: true },
  uptime: 99.9,
  securityScore: 92,
};

// Audit logs
export interface AuditLog {
  id: string;
  action: string;
  user: string;
  ip: string;
  timestamp: string;
  status: "success" | "blocked" | "warning";
}

export const mockAuditLogs: AuditLog[] = [
  {
    id: "1",
    action: "User login",
    user: "admin",
    ip: "192.168.1.1",
    timestamp: "10:45:23",
    status: "success",
  },
  {
    id: "2",
    action: "API key generated",
    user: "system",
    ip: "internal",
    timestamp: "10:32:15",
    status: "success",
  },
  {
    id: "3",
    action: "Failed login attempt",
    user: "unknown",
    ip: "203.0.113.42",
    timestamp: "10:28:00",
    status: "blocked",
  },
  {
    id: "4",
    action: "Permission change",
    user: "admin",
    ip: "192.168.1.1",
    timestamp: "10:15:30",
    status: "success",
  },
  {
    id: "5",
    action: "Agent activation",
    user: "system",
    ip: "internal",
    timestamp: "09:58:12",
    status: "success",
  },
];

// Generate heatmap data for activity by hour/day
export interface HeatMapCell {
  value: number;
  label?: string;
}

export const generateHeatmapData = (): HeatMapCell[][] => {
  const days = 7;
  const hours = 24;
  const data: HeatMapCell[][] = [];

  for (let d = 0; d < days; d++) {
    const row: HeatMapCell[] = [];
    for (let h = 0; h < hours; h++) {
      // Simulate activity patterns
      let baseValue = Math.random() * 30;
      // Higher activity during work hours
      if (h >= 9 && h <= 17) baseValue += 40;
      // Lower on weekends
      if (d >= 5) baseValue *= 0.5;
      row.push({
        value: Math.round(baseValue),
        label: `Day ${d + 1}, Hour ${h}: ${Math.round(baseValue)} events`,
      });
    }
    data.push(row);
  }
  return data;
};

export const mockHeatmapData = generateHeatmapData();
export const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
export const hourLabels = Array.from({ length: 24 }, (_, i) => (i % 6 === 0 ? `${i}h` : ""));

// Performance metrics
export const mockPerformanceMetrics = {
  uptime: 85,
  efficiency: 67,
};
