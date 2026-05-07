import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ArticleNavigationProps {
  prev: { categorySlug: string; slug: string; title: string } | null;
  next: { categorySlug: string; slug: string; title: string } | null;
}

export function ArticleNavigation({ prev, next }: ArticleNavigationProps) {
  return (
    <div className="mt-12 pt-6 border-t border-border grid grid-cols-2 gap-4">
      <div>
        {prev && (
          <Link
            href={`/docs/${prev.categorySlug}/${prev.slug}`}
            className="group flex flex-col items-start p-4 rounded-xl border border-border hover:border-brand-300 hover:bg-brand-50/50 dark:hover:bg-brand-500/5 transition"
          >
            <span className="flex items-center gap-1 text-xs text-muted-foreground mb-1 group-hover:text-brand-500 transition">
              <ChevronLeft className="w-3 h-3" />
              Précédent
            </span>
            <span className="text-sm font-medium text-foreground group-hover:text-brand-500 transition line-clamp-2">
              {prev.title}
            </span>
          </Link>
        )}
      </div>
      <div>
        {next && (
          <Link
            href={`/docs/${next.categorySlug}/${next.slug}`}
            className="group flex flex-col items-end p-4 rounded-xl border border-border hover:border-brand-300 hover:bg-brand-50/50 dark:hover:bg-brand-500/5 transition"
          >
            <span className="flex items-center gap-1 text-xs text-muted-foreground mb-1 group-hover:text-brand-500 transition">
              Suivant
              <ChevronRight className="w-3 h-3" />
            </span>
            <span className="text-sm font-medium text-foreground group-hover:text-brand-500 transition line-clamp-2 text-right">
              {next.title}
            </span>
          </Link>
        )}
      </div>
    </div>
  );
}
