"use client";

import { PageHeader, Section, SectionHeader, Grid } from "@/components/layout/MainContent";
import { Card, CardHeader, CardBody, CardFooter, StatCard } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { LineChart } from "@/components/charts/LineChart";
import { BarChart } from "@/components/charts/BarChart";
import { CircularProgress } from "@/components/charts/CircularProgress";

const deploymentData = [
  { name: "Mon", value: 3 },
  { name: "Tue", value: 5 },
  { name: "Wed", value: 2 },
  { name: "Thu", value: 7 },
  { name: "Fri", value: 4 },
  { name: "Sat", value: 1 },
  { name: "Sun", value: 0 },
];

const codeQualityData = [
  { name: "Coverage", value: 78, color: "#39ff14" },
  { name: "Maintainability", value: 85, color: "#00d9ff" },
  { name: "Reliability", value: 92, color: "#ffaa00" },
  { name: "Security", value: 88, color: "#ff006e" },
];

interface Pipeline {
  id: string;
  name: string;
  branch: string;
  status: "success" | "running" | "failed" | "pending";
  duration: string;
  timestamp: string;
}

const pipelines: Pipeline[] = [
  {
    id: "1",
    name: "main-deploy",
    branch: "main",
    status: "success",
    duration: "3m 24s",
    timestamp: "10m ago",
  },
  {
    id: "2",
    name: "feature-auth",
    branch: "feature/auth-update",
    status: "running",
    duration: "1m 45s",
    timestamp: "Running",
  },
  {
    id: "3",
    name: "hotfix-api",
    branch: "hotfix/api-fix",
    status: "failed",
    duration: "2m 12s",
    timestamp: "25m ago",
  },
  {
    id: "4",
    name: "develop-test",
    branch: "develop",
    status: "pending",
    duration: "-",
    timestamp: "Queued",
  },
];

interface CodeReview {
  id: string;
  title: string;
  author: string;
  status: "approved" | "changes_requested" | "pending";
  comments: number;
  filesChanged: number;
}

const codeReviews: CodeReview[] = [
  {
    id: "1",
    title: "Add authentication middleware",
    author: "Forge",
    status: "approved",
    comments: 3,
    filesChanged: 5,
  },
  {
    id: "2",
    title: "Optimize database queries",
    author: "Nexus",
    status: "pending",
    comments: 7,
    filesChanged: 12,
  },
  {
    id: "3",
    title: "Fix security vulnerability",
    author: "Sentinel",
    status: "changes_requested",
    comments: 5,
    filesChanged: 2,
  },
];

interface Issue {
  id: string;
  title: string;
  priority: "critical" | "high" | "medium" | "low";
  type: "bug" | "feature" | "enhancement";
  assignee?: string;
}

const issues: Issue[] = [
  {
    id: "BUG-142",
    title: "Memory leak in agent process",
    priority: "critical",
    type: "bug",
    assignee: "Forge",
  },
  {
    id: "FEAT-89",
    title: "Add voice command support",
    priority: "high",
    type: "feature",
    assignee: "Scout",
  },
  {
    id: "ENH-234",
    title: "Improve dashboard performance",
    priority: "medium",
    type: "enhancement",
  },
  {
    id: "BUG-156",
    title: "Fix chart rendering issue",
    priority: "low",
    type: "bug",
  },
];

export default function DevelopmentPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Development"
        description="CI/CD pipelines and code quality metrics"
      />

      {/* Stats */}
      <Section>
        <Grid cols={4}>
          <StatCard
            title="Deployments Today"
            value="12"
            trend={{ value: 20, positive: true }}
            variant="success"
            icon={<span className="text-lg">⟨/⟩</span>}
          />
          <StatCard
            title="Build Success Rate"
            value="94%"
            trend={{ value: 3, positive: true }}
            variant="info"
            icon={<span className="text-lg">✓</span>}
          />
          <StatCard
            title="Open Issues"
            value="23"
            trend={{ value: 5, positive: false }}
            variant="warning"
            icon={<span className="text-lg">⚑</span>}
          />
          <StatCard
            title="Code Coverage"
            value="78%"
            trend={{ value: 2, positive: true }}
            variant="success"
            icon={<span className="text-lg">◎</span>}
          />
        </Grid>
      </Section>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Pipelines and Charts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Pipelines */}
          <Section>
            <SectionHeader
              title="CI/CD Pipelines"
              action={
                <button className="text-xs font-mono text-[#00d9ff] hover:text-white transition-colors">
                  View All
                </button>
              }
            />
            <div className="space-y-2">
              {pipelines.map((pipeline) => (
                <PipelineCard key={pipeline.id} pipeline={pipeline} />
              ))}
            </div>
          </Section>

          {/* Deployment Chart */}
          <Section>
            <SectionHeader title="Deployments (7 days)" />
            <Card>
              <CardBody>
                <BarChart data={deploymentData} height={200} color="#00d9ff" />
              </CardBody>
            </Card>
          </Section>

          {/* Code Reviews */}
          <Section>
            <SectionHeader title="Code Reviews" />
            <Card>
              <CardBody className="p-0">
                <div className="divide-y divide-zinc-800">
                  {codeReviews.map((review) => (
                    <div
                      key={review.id}
                      className="p-4 hover:bg-zinc-900/50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-mono text-sm text-white">
                            {review.title}
                          </p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="font-mono text-xs text-[#00d9ff]">
                              {review.author}
                            </span>
                            <span className="font-mono text-xs text-zinc-600">
                              {review.filesChanged} files
                            </span>
                            <span className="font-mono text-xs text-zinc-600">
                              {review.comments} comments
                            </span>
                          </div>
                        </div>
                        <Badge
                          variant={
                            review.status === "approved"
                              ? "success"
                              : review.status === "changes_requested"
                                ? "danger"
                                : "warning"
                          }
                        >
                          {review.status.replace("_", " ").toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </Section>
        </div>

        {/* Right: Quality and Issues */}
        <div className="space-y-6">
          {/* Code Quality */}
          <Section>
            <SectionHeader title="Code Quality" />
            <Card>
              <CardBody>
                <BarChart
                  data={codeQualityData}
                  height={200}
                  horizontal
                />
              </CardBody>
            </Card>
          </Section>

          {/* Test Coverage */}
          <Section>
            <SectionHeader title="Test Coverage" />
            <Card>
              <CardBody className="flex justify-center py-6">
                <CircularProgress
                  value={78}
                  size={120}
                  strokeWidth={10}
                  color="#39ff14"
                  label="Coverage"
                />
              </CardBody>
            </Card>
          </Section>

          {/* Issues */}
          <Section>
            <SectionHeader
              title="Open Issues"
              action={
                <button className="text-xs font-mono text-[#00d9ff] hover:text-white transition-colors">
                  View All
                </button>
              }
            />
            <Card>
              <CardBody className="p-0">
                <div className="divide-y divide-zinc-800">
                  {issues.map((issue) => (
                    <IssueRow key={issue.id} issue={issue} />
                  ))}
                </div>
              </CardBody>
            </Card>
          </Section>
        </div>
      </div>
    </div>
  );
}

function PipelineCard({ pipeline }: { pipeline: Pipeline }) {
  const getStatusColor = () => {
    switch (pipeline.status) {
      case "success":
        return "text-[#39ff14]";
      case "running":
        return "text-[#00d9ff] animate-pulse";
      case "failed":
        return "text-[#ff006e]";
      case "pending":
        return "text-zinc-500";
    }
  };

  const getStatusIcon = () => {
    switch (pipeline.status) {
      case "success":
        return "✓";
      case "running":
        return "⟳";
      case "failed":
        return "✕";
      case "pending":
        return "○";
    }
  };

  return (
    <Card>
      <CardBody>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className={`text-xl ${getStatusColor()}`}>
              {getStatusIcon()}
            </span>
            <div>
              <p className="font-mono text-sm font-bold text-white">
                {pipeline.name}
              </p>
              <p className="font-mono text-xs text-zinc-500">{pipeline.branch}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-mono text-sm text-zinc-300">{pipeline.duration}</p>
            <p className="font-mono text-xs text-zinc-600">{pipeline.timestamp}</p>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

function IssueRow({ issue }: { issue: Issue }) {
  const getPriorityColor = () => {
    switch (issue.priority) {
      case "critical":
        return "text-[#ff006e]";
      case "high":
        return "text-[#ffaa00]";
      case "medium":
        return "text-[#00d9ff]";
      case "low":
        return "text-zinc-500";
    }
  };

  const getTypeIcon = () => {
    switch (issue.type) {
      case "bug":
        return "⚠";
      case "feature":
        return "★";
      case "enhancement":
        return "↑";
    }
  };

  return (
    <div className="p-3 hover:bg-zinc-900/50 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={getPriorityColor()}>{getTypeIcon()}</span>
          <div>
            <p className="font-mono text-sm text-white">{issue.title}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="font-mono text-xs text-zinc-600">{issue.id}</span>
              {issue.assignee && (
                <span className="font-mono text-xs text-[#00d9ff]">
                  @{issue.assignee}
                </span>
              )}
            </div>
          </div>
        </div>
        <Badge
          variant={
            issue.priority === "critical"
              ? "danger"
              : issue.priority === "high"
                ? "warning"
                : "default"
          }
        >
          {issue.priority.toUpperCase()}
        </Badge>
      </div>
    </div>
  );
}
