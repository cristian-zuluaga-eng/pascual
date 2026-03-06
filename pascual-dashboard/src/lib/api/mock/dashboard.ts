import { ActivityItem } from "@/components/dashboard/ActivityFeed";
import { ChatMessage } from "@/components/chat/ChatWindow";

// Dashboard stats
export const mockDashboardStats = {
  activeAgents: {
    current: 4,
    total: 5,
    trend: { value: 25, positive: true },
  },
  pendingTasks: {
    value: 11,
    trend: { value: 8, positive: false },
  },
  cpuUsage: {
    value: 24,
    trend: { value: 5, positive: true },
  },
  memory: {
    value: 3.2,
    total: 16,
    trend: { value: 12, positive: false },
  },
};

// Activity feed
export const mockActivities: ActivityItem[] = [
  {
    id: "1",
    type: "agent",
    title: "Nexus completed research task",
    description: "Analyzed 15 documents",
    timestamp: "2m ago",
    agentName: "Nexus",
  },
  {
    id: "2",
    type: "security",
    title: "Security scan completed",
    description: "No threats detected",
    timestamp: "15m ago",
    agentName: "Sentinel",
  },
  {
    id: "3",
    type: "task",
    title: "New task assigned to Scout",
    description: "Calendar optimization",
    timestamp: "32m ago",
    agentName: "Scout",
  },
  {
    id: "4",
    type: "system",
    title: "System backup completed",
    timestamp: "1h ago",
  },
  {
    id: "5",
    type: "agent",
    title: "Oracle generated financial report",
    description: "Q4 analysis ready",
    timestamp: "2h ago",
    agentName: "Oracle",
  },
];

// Chat messages
export const mockMessages: ChatMessage[] = [
  {
    id: "1",
    role: "system",
    content: "Session started",
    timestamp: "10:00 AM",
  },
  {
    id: "2",
    role: "assistant",
    content: "Hello! I'm PASCUAL, your multi-agent AI assistant. How can I help you today?",
    timestamp: "10:00 AM",
    agentName: "Nexus",
  },
  {
    id: "3",
    role: "user",
    content: "Show me the current system status",
    timestamp: "10:02 AM",
  },
  {
    id: "4",
    role: "assistant",
    content: "All systems are operational.\n\n- CPU: 24% utilization\n- Memory: 3.2GB / 16GB\n- Active Agents: 4\n- Pending Tasks: 11",
    timestamp: "10:02 AM",
    agentName: "Nexus",
  },
];
