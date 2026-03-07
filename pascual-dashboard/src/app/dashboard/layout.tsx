"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { MainContent } from "@/components/layout/MainContent";
import { GrowlProvider, GrowlContainer } from "@/components/growl";
import { ChatTransitionProvider, ChatTransitionOverlay } from "@/components/chat/ChatTransition";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <GrowlProvider>
      <ChatTransitionProvider>
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <div className="flex flex-col flex-1 overflow-hidden">
            <Header />
            <MainContent>{children}</MainContent>
          </div>
          <GrowlContainer />
          <ChatTransitionOverlay />
        </div>
      </ChatTransitionProvider>
    </GrowlProvider>
  );
}
