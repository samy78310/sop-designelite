"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { Moon, Sun, Search, Menu, X } from "lucide-react";
import { useState } from "react";
import type { NavCategory } from "@/types";
import { DocsSidebar } from "./DocsSidebar";

interface DocsTopNavProps {
  navigation: NavCategory[];
  onSearchOpen?: () => void;
}

export function DocsTopNav({ navigation, onSearchOpen }: DocsTopNavProps) {
  const { theme, setTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-30 h-14 bg-background/95 backdrop-blur border-b border-border flex items-center px-4 lg:hidden">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-md hover:bg-muted text-muted-foreground mr-3"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <div className="flex items-center gap-2 flex-1">
          <div className="w-6 h-6 bg-brand-500 rounded flex items-center justify-center">
            <span className="text-white font-bold text-[10px]">DE</span>
          </div>
          <span className="font-semibold text-foreground text-sm">Design Elite</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onSearchOpen}
            className="p-2 rounded-md hover:bg-muted text-muted-foreground"
          >
            <Search className="w-4 h-4" />
          </button>
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-md hover:bg-muted text-muted-foreground"
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Desktop top-right controls - shown on large screens only in the main area */}
      <div className="hidden lg:flex fixed top-3 right-4 z-30 items-center gap-2">
        <button
          onClick={onSearchOpen}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground text-sm transition"
        >
          <Search className="w-3.5 h-3.5" />
          <span className="hidden xl:inline">Rechercher</span>
          <kbd className="hidden xl:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-muted border border-border ml-1">
            ⌘K
          </kbd>
        </button>
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="p-2 rounded-lg border border-border hover:bg-muted text-muted-foreground transition"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>

      {/* Mobile sidebar overlay */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 w-[260px] lg:hidden">
            <DocsSidebar
              navigation={navigation}
              onSearchOpen={() => {
                setMobileMenuOpen(false);
                onSearchOpen?.();
              }}
            />
          </div>
        </>
      )}
    </>
  );
}
