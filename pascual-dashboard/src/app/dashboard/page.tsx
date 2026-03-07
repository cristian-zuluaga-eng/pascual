"use client";

import { StatCard } from "@/components/ui/Card";
import { Grid, Section, SectionHeader } from "@/components/layout/MainContent";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { MessageInput } from "@/components/chat/MessageInput";
import { mockActivities } from "@/lib/api/mock/dashboard";
import { useGrowl } from "@/components/growl";

export default function DashboardPage() {
  const { messages, isTyping, sendMessage } = useGrowl();

  const handleSendMessage = (content: string) => {
    sendMessage(content, "main");
  };

  return (
    <div className="h-full flex flex-col gap-6">
      {/* Quick Stats */}
      <Section>
        <Grid cols={4}>
          <StatCard
            title="Agentes Activos"
            value="8 / 9"
            trend={{ value: 25, positive: true }}
            variant="info"
            icon={<span className="text-lg">◎</span>}
          />
          <StatCard
            title="Tareas Pendientes"
            value="11"
            trend={{ value: 8, positive: false }}
            variant="warning"
            icon={<span className="text-lg">☰</span>}
          />
          <StatCard
            title="Uso de CPU"
            value="24%"
            trend={{ value: 5, positive: true }}
            variant="success"
            icon={<span className="text-lg">⟨⟩</span>}
          />
          <StatCard
            title="Memoria"
            value="3.2 GB"
            trend={{ value: 12, positive: false }}
            variant="danger"
            icon={<span className="text-lg">◈</span>}
          />
        </Grid>
      </Section>

      {/* Main content grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
        {/* Left: Chat */}
        <div className="lg:col-span-2 flex flex-col min-h-0">
          {/* Chat Section */}
          <Section className="flex-1 flex flex-col min-h-0">
            <SectionHeader title="Chat con PASCUAL" />
            <div className="flex-1 flex flex-col bg-zinc-950 border border-zinc-800 rounded-sm min-h-0">
              <div className="flex-1 overflow-hidden min-h-0">
                <ChatWindow messages={messages} isTyping={isTyping} />
              </div>
              <MessageInput onSend={handleSendMessage} />
            </div>
          </Section>
        </div>

        {/* Right: Activity Feed */}
        <div className="flex flex-col min-h-0 h-full">
          <ActivityFeed activities={mockActivities} className="flex-1 min-h-0" />
        </div>
      </div>
    </div>
  );
}
