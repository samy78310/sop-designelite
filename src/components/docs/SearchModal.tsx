"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, X, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SearchResult } from "@/types";

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
}

export function SearchModal({ open, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery("");
      setResults([]);
      setSelectedIndex(0);
    }
  }, [open]);

  const search = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data.results || []);
      setSelectedIndex(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => search(query), 200);
    return () => clearTimeout(timer);
  }, [query, search]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && results[selectedIndex]) {
      const r = results[selectedIndex];
      router.push(`/docs/${r.category_slug}/${r.slug}`);
      onClose();
    }
  };

  if (!open) return null;

  // Group results by category
  const grouped = results.reduce<Record<string, SearchResult[]>>((acc, r) => {
    if (!acc[r.category_title]) acc[r.category_title] = [];
    acc[r.category_title].push(r);
    return acc;
  }, {});

  let flatIndex = 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4 search-backdrop bg-black/40"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-2xl bg-card border border-border rounded-xl shadow-2xl overflow-hidden animate-slide-in">
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border">
          <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Rechercher dans la documentation..."
            className="flex-1 bg-transparent text-foreground text-sm outline-none placeholder:text-muted-foreground"
          />
          {loading && (
            <div className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          )}
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-muted text-muted-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto">
          {query && !loading && results.length === 0 && (
            <div className="py-12 text-center text-muted-foreground text-sm">
              Aucun résultat pour &quot;{query}&quot;
            </div>
          )}

          {!query && (
            <div className="py-8 text-center text-muted-foreground text-sm">
              Commencez à taper pour rechercher...
            </div>
          )}

          {Object.entries(grouped).map(([categoryTitle, categoryResults]) => (
            <div key={categoryTitle}>
              <div className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground bg-muted/50">
                {categoryTitle}
              </div>
              {categoryResults.map((result) => {
                const isSelected = flatIndex === selectedIndex;
                const currentIndex = flatIndex++;
                return (
                  <button
                    key={result.id}
                    onClick={() => {
                      router.push(`/docs/${result.category_slug}/${result.slug}`);
                      onClose();
                    }}
                    onMouseEnter={() => setSelectedIndex(currentIndex)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 text-left transition",
                      isSelected ? "bg-brand-50 dark:bg-brand-500/10" : "hover:bg-muted"
                    )}
                  >
                    <ArrowRight className={cn(
                      "w-3.5 h-3.5 flex-shrink-0",
                      isSelected ? "text-brand-500" : "text-muted-foreground"
                    )} />
                    <div>
                      <div className={cn(
                        "text-sm font-medium",
                        isSelected ? "text-brand-500" : "text-foreground"
                      )}>
                        {result.title}
                      </div>
                      {result.description && (
                        <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                          {result.description}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 px-4 py-2.5 border-t border-border text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded border border-border bg-muted font-mono text-[10px]">↑↓</kbd>
            Naviguer
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded border border-border bg-muted font-mono text-[10px]">↵</kbd>
            Ouvrir
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded border border-border bg-muted font-mono text-[10px]">Esc</kbd>
            Fermer
          </span>
        </div>
      </div>
    </div>
  );
}
