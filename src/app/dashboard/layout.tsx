'use client';

import SidebarNav from '@/components/atoms/dashboard/Sidebar';
import { SessionProvider } from 'next-auth/react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <div className="flex min-h-screen bg-gray-100">
        <SidebarNav />
        <main className="flex-1 p-6 md:p-8 ml-64">
          {children}
        </main>
      </div>
    </SessionProvider>
  );
}