export const dynamic = "force-dynamic";

import { getAllArticlesAdmin, getAllCategories } from "@/lib/db";
import Link from "next/link";
import { PlusCircle, Pencil } from "lucide-react";
import { DeleteArticleButton } from "@/components/admin/DeleteArticleButton";

export default async function AdminArticlesPage({
  searchParams,
}: {
  searchParams: { category?: string };
}) {
  const [allArticles, categories] = await Promise.all([
    getAllArticlesAdmin(),
    getAllCategories(),
  ]);

  const categoryFilter = searchParams.category;
  const articles = categoryFilter
    ? allArticles.filter((a) => a.category_id === categoryFilter)
    : allArticles;

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold text-foreground">Articles</h1>
        <Link
          href="/admin/articles/new"
          className="flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-sm font-medium transition"
        >
          <PlusCircle className="w-4 h-4" />
          Nouvel article
        </Link>
      </div>

      {/* Category filter tabs */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1 flex-wrap">
        <Link
          href="/admin/articles"
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition whitespace-nowrap ${
            !categoryFilter
              ? "bg-brand-500 text-white"
              : "bg-muted text-muted-foreground hover:text-foreground"
          }`}
        >
          Tous ({allArticles.length})
        </Link>
        {categories.map((cat) => {
          const count = allArticles.filter((a) => a.category_id === cat.id).length;
          return (
            <Link
              key={cat.id}
              href={`/admin/articles?category=${cat.id}`}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition whitespace-nowrap ${
                categoryFilter === cat.id
                  ? "bg-brand-500 text-white"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat.title} ({count})
            </Link>
          );
        })}
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Titre
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">
                Catégorie
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Statut
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">
                Modifié le
              </th>
              <th className="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {articles.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-muted-foreground text-sm">
                  Aucun article dans cette catégorie.{" "}
                  <Link href="/admin/articles/new" className="text-brand-500 hover:underline">
                    Créer un article →
                  </Link>
                </td>
              </tr>
            ) : (
              articles.map((article) => (
                <tr key={article.id} className="hover:bg-muted/30 transition">
                  <td className="px-5 py-3.5">
                    <Link
                      href={`/admin/articles/${article.id}/edit`}
                      className="text-sm font-medium text-foreground hover:text-brand-500 transition"
                    >
                      {article.title}
                    </Link>
                  </td>
                  <td className="px-5 py-3.5 hidden md:table-cell">
                    <Link
                      href={`/admin/categories/${article.category_id}`}
                      className="text-sm text-muted-foreground hover:text-brand-500 transition"
                    >
                      {article.category_title}
                    </Link>
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        article.published
                          ? "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {article.published ? "Publié" : "Brouillon"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 hidden lg:table-cell">
                    <span className="text-xs text-muted-foreground">
                      {new Date(article.updated_at).toLocaleDateString("fr-FR")}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/admin/articles/${article.id}/edit`}
                        className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition"
                        title="Modifier"
                      >
                        <Pencil className="w-4 h-4" />
                      </Link>
                      <DeleteArticleButton id={article.id} title={article.title} />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
