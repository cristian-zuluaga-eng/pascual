"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { MainContent } from "@/components/layout/MainContent";
import { GrowlProvider, GrowlContainer } from "@/components/growl";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <GrowlProvider>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <Header />
          <MainContent>{children}</MainContent>
        </div>
        <GrowlContainer />
      </div>
    </GrowlProvider>
  );
}
