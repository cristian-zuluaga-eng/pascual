"use client";

import { Card, CardHeader, CardBody } from "../ui/Card";

export interface ActivityItem {
  id: string;
  type: "agent" | "security" | "system" | "task";
  title: string;
  description?: string;
  timestamp: string;
  agentName?: string;
}

interface ActivityFeedProps {
  activities: ActivityItem[];
  maxItems?: number;
  className?: string;
}

const getTypeIcon = (type: ActivityItem["type"]) => {
  switch (type) {
    case "agent":
      return "◎";
    case "security":
      return "⛊";
    case "system":
      return "⟨⟩";
    case "task":
      return "☑";
    default:
      return "●";
  }
};

const getTypeColor = (type: ActivityItem["type"]) => {
  switch (type) {
    case "agent":
      return "text-[#00d9ff]";
    case "security":
      return "text-[#ff006e]";
    case "system":
      return "text-[#39ff14]";
    case "task":
      return "text-[#ffaa00]";
    default:
      return "text-zinc-500";
  }
};

export function ActivityFeed({ activities, maxItems = 10, className = "" }: ActivityFeedProps) {
  const displayActivities = activities.slice(0, maxItems);

  return (
    <Card className={`flex flex-col ${className}`}>
      <CardHeader>
        <h3 className="font-mono text-sm font-bold">Recent Activity</h3>
        <span className="text-xs font-mono text-zinc-500">
          {activities.length} events
        </span>
      </CardHeader>
      <CardBody className="p-0 flex-1 overflow-auto min-h-0">
        <div className="divide-y divide-zinc-800">
          {displayActivities.map((activity) => (
            <ActivityRow key={activity.id} activity={activity} />
          ))}
        </div>
        {activities.length > maxItems && (
          <div className="p-3 text-center">
            <button className="text-xs font-mono text-[#00d9ff] hover:text-white transition-colors">
              View all {activities.length} events
            </button>
          </div>
        )}
      </CardBody>
    </Card>
  );
}

function ActivityRow({ activity }: { activity: ActivityItem }) {
  return (
    <div className="flex items-start gap-3 p-3 hover:bg-zinc-900/50 transition-colors">
      <span className={`text-lg ${getTypeColor(activity.type)}`}>
        {getTypeIcon(activity.type)}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-mono text-sm text-white truncate">
            {activity.title}
          </p>
          {activity.agentName && (
            <span className="text-xs font-mono text-zinc-500">
              [{activity.agentName}]
            </span>
          )}
        </div>
        {activity.description && (
          <p className="font-mono text-xs text-zinc-500 mt-0.5 truncate">
            {activity.description}
          </p>
        )}
      </div>
      <span className="font-mono text-xs text-zinc-600 whitespace-nowrap">
        {activity.timestamp}
      </span>
    </div>
  );
}

interface CompactActivityFeedProps {
  activities: ActivityItem[];
  maxItems?: number;
}

export function CompactActivityFeed({
  activities,
  maxItems = 5,
}: CompactActivityFeedProps) {
  const displayActivities = activities.slice(0, maxItems);

  return (
    <div className="space-y-2">
      {displayActivities.map((activity) => (
        <div
          key={activity.id}
          className="flex items-center gap-2 text-xs font-mono"
        >
          <span className={getTypeColor(activity.type)}>
            {getTypeIcon(activity.type)}
          </span>
          <span className="text-zinc-300 truncate flex-1">
            {activity.title}
          </span>
          <span className="text-zinc-600">{activity.timestamp}</span>
        </div>
      ))}
    </div>
  );
}
