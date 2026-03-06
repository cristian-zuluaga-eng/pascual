"use client";

import { ReactNode } from 'react';
import TopNav from '@/components/layout/TopNav';

export default function MainLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0a0f1a]">
      <TopNav />
      <main className="max-w-[1400px] mx-auto px-6 py-6">
        {children}
      </main>
    </div>
  );
}