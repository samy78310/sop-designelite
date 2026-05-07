"use client";

import { SessionProvider, useSession } from "next-auth/react";
import { AdminSidebar } from "./AdminSidebar";
import type { Session } from "next-auth";

interface AdminLayoutClientProps {
  children: React.ReactNode;
  session: Session | null;
}

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();

  // Loading state — show nothing yet
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Not authenticated — show login page without sidebar
  if (!session) {
    return <>{children}</>;
  }

  // Authenticated — show full admin layout with sidebar
  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar />
      <main className="flex-1" style={{ paddingLeft: "240px" }}>
        <div className="max-w-5xl mx-auto px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}

export function AdminLayoutClient({ children, session }: AdminLayoutClientProps) {
  return (
    <SessionProvider session={session}>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </SessionProvider>
  );
}
