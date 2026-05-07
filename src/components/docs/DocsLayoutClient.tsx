"use client";

import { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { DocsSidebar } from "./DocsSidebar";
import { DocsTopNav } from "./DocsTopNav";
import { SearchModal } from "./SearchModal";
import type { NavCategory } from "@/types";

interface DocsLayoutClientProps {
  navigation: NavCategory[];
  children: React.ReactNode;
}

export function DocsLayoutClient({ navigation: initialNavigation, children }: DocsLayoutClientProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [navigation, setNavigation] = useState<NavCategory[]>(initialNavigation);
  const pathname = usePathname();

  const fetchNavigation = useCallback(async () => {
    try {
      const res = await fetch(`/api/navigation?t=${Date.now()}`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setNavigation(data);
      }
    } catch {
      // keep current navigation on error
    }
  }, []);

  // Refresh navigation on every page change
  useEffect(() => {
    fetchNavigation();
  }, [pathname, fetchNavigation]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar — hidden on mobile */}
      <div className="hidden lg:block">
        <DocsSidebar navigation={navigation} onSearchOpen={() => setSearchOpen(true)} />
      </div>

      {/* Mobile top nav */}
      <DocsTopNav navigation={navigation} onSearchOpen={() => setSearchOpen(true)} />

      {/* Main content */}
      <main className="lg:pl-[260px] pt-14 lg:pt-0">
        <div className="max-w-[760px] mx-auto px-6 lg:px-10 py-10">
          {children}
        </div>
      </main>

      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
