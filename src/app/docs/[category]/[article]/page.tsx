export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { getArticle, getAdjacentArticles } from "@/lib/db";
import { ArticleContent } from "@/components/docs/ArticleContent";
import { HelpfulnessVote } from "@/components/docs/HelpfulnessVote";
import { ArticleNavigation } from "@/components/docs/ArticleNavigation";
import { formatDate } from "@/lib/utils";
import type { Metadata } from "next";

interface ArticlePageProps {
  params: {
    category: string;
    article: string;
  };
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const article = await getArticle(params.category, params.article);
  if (!article) return { title: "Not found" };
  return {
    title: `${article.title} — Design Elite`,
    description: article.description,
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const [article, adjacent] = await Promise.all([
    getArticle(params.category, params.article),
    getAdjacentArticles(params.category, params.article),
  ]);

  if (!article) notFound();

  return (
    <article>
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-6">
        <span className="hover:text-foreground transition cursor-default">{article.category_title}</span>
        <span>/</span>
        <span className="text-foreground">{article.title}</span>
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-[2rem] font-bold text-foreground leading-tight mb-3">
          {article.title}
        </h1>
        {article.description && (
          <p className="text-lg text-muted-foreground leading-relaxed">
            {article.description}
          </p>
        )}
        <div className="flex items-center gap-3 mt-4 text-xs text-muted-foreground">
          <span>Mis à jour le {formatDate(article.updated_at)}</span>
        </div>
      </div>

      <hr className="border-border mb-8" />

      {/* Content */}
      <ArticleContent content={article.content} />

      {/* Helpfulness vote */}
      <HelpfulnessVote articleId={article.id} />

      {/* Prev / Next */}
      <ArticleNavigation prev={adjacent.prev} next={adjacent.next} />
    </article>
  );
}
