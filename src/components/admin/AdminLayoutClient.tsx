"use client";

import { SessionProvider } from "next-auth/react";
import { AdminSidebar } from "./AdminSidebar";
import type { Session } from "next-auth";

interface AdminLayoutClientProps {
  children: React.ReactNode;
  session: Session | null;
}

export function AdminLayoutClient({ children, session }: AdminLayoutClientProps) {
  if (!session) {
    return (
      <SessionProvider>
        {children}
      </SessionProvider>
    );
  }

  return (
    <SessionProvider session={session}>
      <div className="min-h-screen bg-background flex">
        <AdminSidebar />
        <main className="flex-1 pl-[240px]">
          <div className="max-w-5xl mx-auto px-8 py-8">
            {children}
          </div>
        </main>
      </div>
    </SessionProvider>
  );
}
