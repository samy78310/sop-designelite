"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import type { NavCategory } from "@/types";

interface DocsSidebarProps {
  navigation: NavCategory[];
  onSearchOpen?: () => void;
}

export function DocsSidebar({ navigation, onSearchOpen }: DocsSidebarProps) {
  const pathname = usePathname();
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    () => {
      const initial = new Set<string>();
      // Expand all by default
      navigation.forEach((cat) => initial.add(cat.id));
      return initial;
    }
  );

  const toggleCategory = (id: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <aside className="fixed top-0 left-0 h-full w-[260px] bg-background border-r border-border flex flex-col z-20">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-border flex-shrink-0">
        <div className="w-7 h-7 bg-brand-500 rounded-md flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-xs">DE</span>
        </div>
        <span className="font-semibold text-foreground text-[15px]">Design Elite</span>
      </div>

      {/* Search */}
      <div className="px-3 py-3 flex-shrink-0">
        <button
          onClick={onSearchOpen}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-muted/50 hover:bg-muted text-muted-foreground text-sm transition group"
        >
          <Search className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="flex-1 text-left">Rechercher...</span>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-background border border-border text-muted-foreground">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto sidebar-scroll px-3 pb-6">
        {navigation.map((category) => {
          const isExpanded = expandedCategories.has(category.id);
          const hasActiveArticle = category.articles.some(
            (a) => pathname === `/docs/${category.slug}/${a.slug}`
          );

          return (
            <div key={category.id} className="mb-1">
              <button
                onClick={() => toggleCategory(category.id)}
                className={cn(
                  "w-full flex items-center justify-between px-2 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider transition",
                  hasActiveArticle
                    ? "text-brand-500"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span>{category.title}</span>
                <ChevronDown
                  className={cn(
                    "w-3.5 h-3.5 transition-transform",
                    isExpanded ? "" : "-rotate-90"
                  )}
                />
              </button>

              {isExpanded && (
                <ul className="mt-0.5 space-y-0.5">
                  {category.articles.map((article) => {
                    const href = `/docs/${category.slug}/${article.slug}`;
                    const isActive = pathname === href;

                    return (
                      <li key={article.id}>
                        <Link
                          href={href}
                          className={cn(
                            "block px-3 py-1.5 rounded-md text-sm transition",
                            isActive
                              ? "bg-brand-50 dark:bg-brand-500/10 text-brand-500 font-medium"
                              : "text-muted-foreground hover:text-foreground hover:bg-muted"
                          )}
                        >
                          {article.title}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
