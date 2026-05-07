export const dynamic = "force-dynamic";

import { sql } from "@vercel/postgres";
import Link from "next/link";
import { FileText, FolderOpen, Eye, PlusCircle } from "lucide-react";

async function getStats() {
  try {
    const [articles, categories, published, votes] = await Promise.all([
      sql`SELECT COUNT(*)::int as count FROM articles`,
      sql`SELECT COUNT(*)::int as count FROM categories`,
      sql`SELECT COUNT(*)::int as count FROM articles WHERE published = true`,
      sql`SELECT COUNT(*)::int as count FROM helpfulness_votes`,
    ]);
    return {
      articles: articles.rows[0].count,
      categories: categories.rows[0].count,
      published: published.rows[0].count,
      votes: votes.rows[0].count,
    };
  } catch {
    return { articles: 0, categories: 0, published: 0, votes: 0 };
  }
}

async function getRecentArticles() {
  try {
    const { rows } = await sql`
      SELECT a.id, a.title, a.published, a.updated_at, c.title as category_title
      FROM articles a
      JOIN categories c ON a.category_id = c.id
      ORDER BY a.updated_at DESC
      LIMIT 5
    `;
    return rows;
  } catch {
    return [];
  }
}

export default async function AdminDashboard() {
  const [stats, recent] = await Promise.all([getStats(), getRecentArticles()]);

  const statCards = [
    { label: "Articles total", value: stats.articles, icon: FileText, color: "text-blue-500" },
    { label: "Publiés", value: stats.published, icon: Eye, color: "text-green-500" },
    { label: "Catégories", value: stats.categories, icon: FolderOpen, color: "text-purple-500" },
    { label: "Votes reçus", value: stats.votes, icon: Eye, color: "text-orange-500" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Tableau de bord</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Bienvenue dans l&apos;interface d&apos;administration Design Elite.
          </p>
        </div>
        <Link
          href="/admin/articles/new"
          className="flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-sm font-medium transition"
        >
          <PlusCircle className="w-4 h-4" />
          Nouvel article
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center gap-3 mb-2">
                <Icon className={`w-5 h-5 ${card.color}`} />
                <span className="text-sm text-muted-foreground">{card.label}</span>
              </div>
              <div className="text-3xl font-bold text-foreground">{card.value}</div>
            </div>
          );
        })}
      </div>

      {/* Recent articles */}
      <div className="bg-card border border-border rounded-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="font-semibold text-foreground">Articles récents</h2>
          <Link href="/admin/articles" className="text-sm text-brand-500 hover:text-brand-600">
            Voir tout →
          </Link>
        </div>
        <div className="divide-y divide-border">
          {recent.length === 0 ? (
            <div className="px-5 py-8 text-center text-muted-foreground text-sm">
              Aucun article pour le moment.{" "}
              <Link href="/admin/articles/new" className="text-brand-500 hover:underline">
                Créer le premier →
              </Link>
            </div>
          ) : (
            recent.map((article) => (
              <div key={article.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <div className="text-sm font-medium text-foreground">{article.title}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{article.category_title}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    article.published
                      ? "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400"
                      : "bg-muted text-muted-foreground"
                  }`}>
                    {article.published ? "Publié" : "Brouillon"}
                  </span>
                  <Link
                    href={`/admin/articles/${article.id}/edit`}
                    className="text-xs text-brand-500 hover:text-brand-600"
                  >
                    Modifier
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
