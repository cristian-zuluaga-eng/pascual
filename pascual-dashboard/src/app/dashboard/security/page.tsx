"use client";

import { PageHeader, Section, SectionHeader, Grid } from "@/components/layout/MainContent";
import { Card, CardHeader, CardBody, StatCard } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { BarChart } from "@/components/charts/BarChart";
import { LineChart } from "@/components/charts/LineChart";
import { CircularProgress, DonutChart } from "@/components/charts/CircularProgress";
import { HeatMap } from "@/components/charts/HeatMap";
import {
  mockSecurityEvents,
  mockThreatCategories,
  mockSystemUsageData,
  mockResourceAllocation,
  mockAuditLogs,
  mockHeatmapData,
  dayLabels,
  hourLabels,
  mockSecurityStats,
  mockPerformanceMetrics,
} from "@/lib/api/mock/security";

const securityEvents = mockSecurityEvents;
const threatCategories = mockThreatCategories;
const systemUsageData = mockSystemUsageData;
const resourceAllocation = mockResourceAllocation;
const auditLogs = mockAuditLogs;
const heatmapData = mockHeatmapData;

export default function SecurityPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Security Center"
        description="Monitor system security and audit logs"
      />

      {/* Security Stats */}
      <Section>
        <Grid cols={4}>
          <StatCard
            title="Threat Level"
            value="Low"
            variant="success"
            icon={<span className="text-lg">⛊</span>}
          />
          <StatCard
            title="Events Today"
            value="86"
            trend={{ value: 12, positive: false }}
            variant="info"
            icon={<span className="text-lg">◉</span>}
          />
          <StatCard
            title="Blocked Attempts"
            value="3"
            trend={{ value: 50, positive: true }}
            variant="danger"
            icon={<span className="text-lg">✕</span>}
          />
          <StatCard
            title="Uptime"
            value="99.9%"
            variant="success"
            icon={<span className="text-lg">↑</span>}
          />
        </Grid>
      </Section>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Charts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Security Events Timeline */}
          <Section>
            <SectionHeader title="Security Events (24h)" />
            <Card>
              <CardBody className="p-3">
                <LineChart data={securityEvents} height={100} color="#ff006e" />
              </CardBody>
            </Card>
          </Section>

          {/* Activity Heatmap */}
          <Section>
            <SectionHeader title="Activity Heatmap (7 days)" />
            <Card>
              <CardBody>
                <HeatMap
                  data={heatmapData}
                  xLabels={hourLabels}
                  yLabels={dayLabels}
                  maxColor="#00d9ff"
                  cellSize={20}
                  gap={2}
                />
              </CardBody>
            </Card>
          </Section>

          {/* Audit Log */}
          <Section>
            <SectionHeader
              title="Audit Log"
              action={
                <button className="text-xs font-mono text-[#00d9ff] hover:text-white transition-colors">
                  Export
                </button>
              }
            />
            <Card>
              <CardBody className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-zinc-800">
                        <th className="text-left text-xs font-mono text-zinc-500 uppercase p-3">
                          Time
                        </th>
                        <th className="text-left text-xs font-mono text-zinc-500 uppercase p-3">
                          Action
                        </th>
                        <th className="text-left text-xs font-mono text-zinc-500 uppercase p-3">
                          User
                        </th>
                        <th className="text-left text-xs font-mono text-zinc-500 uppercase p-3">
                          IP
                        </th>
                        <th className="text-left text-xs font-mono text-zinc-500 uppercase p-3">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {auditLogs.map((log) => (
                        <tr
                          key={log.id}
                          className="border-b border-zinc-800/50 hover:bg-zinc-900/50"
                        >
                          <td className="p-3 font-mono text-xs text-zinc-400">
                            {log.timestamp}
                          </td>
                          <td className="p-3 font-mono text-sm text-white">
                            {log.action}
                          </td>
                          <td className="p-3 font-mono text-sm text-zinc-300">
                            {log.user}
                          </td>
                          <td className="p-3 font-mono text-xs text-zinc-500">
                            {log.ip}
                          </td>
                          <td className="p-3">
                            <Badge
                              variant={
                                log.status === "success"
                                  ? "success"
                                  : log.status === "blocked"
                                    ? "danger"
                                    : "warning"
                              }
                            >
                              {log.status.toUpperCase()}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardBody>
            </Card>
          </Section>
        </div>

        {/* Right: Stats */}
        <div className="space-y-6">
          {/* Security Score */}
          <Section>
            <SectionHeader title="Security Score" />
            <Card>
              <CardBody className="flex flex-col items-center py-4">
                <CircularProgress
                  value={92}
                  size={120}
                  strokeWidth={10}
                  color="#39ff14"
                  label="Score"
                />
                <p className="mt-2 text-xs font-mono text-zinc-400">
                  System well protected
                </p>
              </CardBody>
            </Card>
          </Section>

          {/* System Usage */}
          <Section>
            <SectionHeader title="System Usage (24h)" />
            <Card>
              <CardBody className="p-3">
                <LineChart data={systemUsageData} height={100} color="#00d9ff" />
              </CardBody>
            </Card>
          </Section>

          {/* Threat Categories */}
          <Section>
            <SectionHeader title="Event Categories" />
            <Card>
              <CardBody>
                <BarChart
                  data={threatCategories}
                  height={200}
                  horizontal
                />
              </CardBody>
            </Card>
          </Section>

          {/* Resource Allocation */}
          <Section>
            <SectionHeader title="Resource Allocation" />
            <Card>
              <CardBody className="flex items-center justify-center py-4">
                <DonutChart
                  data={resourceAllocation}
                  size={140}
                  strokeWidth={20}
                  centerValue="100%"
                  centerLabel="Allocated"
                />
              </CardBody>
            </Card>
          </Section>

          {/* Performance */}
          <Section>
            <SectionHeader title="Performance" />
            <div className="grid grid-cols-2 gap-3">
              <Card>
                <CardBody className="flex flex-col items-center py-3">
                  <CircularProgress
                    value={85}
                    size={70}
                    color="#39ff14"
                    label="Uptime"
                  />
                </CardBody>
              </Card>
              <Card>
                <CardBody className="flex flex-col items-center py-3">
                  <CircularProgress
                    value={67}
                    size={70}
                    color="#00d9ff"
                    label="Efficiency"
                  />
                </CardBody>
              </Card>
            </div>
          </Section>

          {/* Quick Actions */}
          <Section>
            <SectionHeader title="Quick Actions" />
            <Card>
              <CardBody className="space-y-2">
                <button className="w-full p-3 text-left font-mono text-sm text-zinc-300 hover:text-white hover:bg-zinc-900 rounded-sm transition-colors">
                  ⛊ Run Security Scan
                </button>
                <button className="w-full p-3 text-left font-mono text-sm text-zinc-300 hover:text-white hover:bg-zinc-900 rounded-sm transition-colors">
                  ⟳ Update Firewall Rules
                </button>
                <button className="w-full p-3 text-left font-mono text-sm text-zinc-300 hover:text-white hover:bg-zinc-900 rounded-sm transition-colors">
                  ◈ Generate Report
                </button>
                <button className="w-full p-3 text-left font-mono text-sm text-zinc-300 hover:text-white hover:bg-zinc-900 rounded-sm transition-colors">
                  ⚑ Configure Alerts
                </button>
              </CardBody>
            </Card>
          </Section>
        </div>
      </div>
    </div>
  );
}
