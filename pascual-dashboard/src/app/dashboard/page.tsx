"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Section, SectionHeader } from "@/components/layout/MainContent";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { MessageInput } from "@/components/chat/MessageInput";
import { mockActivities } from "@/lib/api/mock/dashboard";
import { useGrowl } from "@/components/growl";
import { useDashboardConfig } from "@/lib/context/DashboardConfigContext";

export default function DashboardPage() {
  const { messages, isTyping, sendMessage } = useGrowl();
  const { config } = useDashboardConfig();
  const router = useRouter();

  // Redirigir a administración si Home está deshabilitado
  useEffect(() => {
    if (!config.views.home) {
      router.replace("/dashboard/administracion");
    }
  }, [config.views.home, router]);

  const handleSendMessage = (content: string) => {
    sendMessage(content, "main");
  };

  // Si Home está deshabilitado, no renderizar nada mientras redirige
  if (!config.views.home) {
    return null;
  }

  return (
    <div className="h-full flex flex-col gap-6">
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
