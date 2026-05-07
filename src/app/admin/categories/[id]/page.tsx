export const dynamic = "force-dynamic";

import { sql } from "@/lib/db";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, PlusCircle, Pencil } from "lucide-react";
import { DeleteArticleButton } from "@/components/admin/DeleteArticleButton";

export default async function CategoryDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { rows: cats } = await sql`SELECT * FROM categories WHERE id = ${params.id} LIMIT 1`;
  if (!cats[0]) notFound();
  const category = cats[0];

  const { rows: articles } = await sql`
    SELECT * FROM articles WHERE category_id = ${params.id} ORDER BY order_index ASC, created_at ASC
  `;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/admin/categories"
          className="flex items-center gap-1.5 px-3 py-2 border border-border rounded-lg text-sm hover:bg-muted transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">{category.title}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            <span className="font-mono">/{category.slug}</span>
            {" · "}
            {articles.length} article{articles.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href={`/admin/articles/new`}
          className="flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-sm font-medium transition"
        >
          <PlusCircle className="w-4 h-4" />
          Nouvel article
        </Link>
      </div>

      {/* Articles list */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Titre
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
                <td colSpan={4} className="px-5 py-10 text-center text-muted-foreground text-sm">
                  Aucun article dans cette catégorie.{" "}
                  <Link href="/admin/articles/new" className="text-brand-500 hover:underline">
                    Créer le premier →
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
