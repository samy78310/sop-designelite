export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { getFirstPublishedArticle } from "@/lib/db";

export default async function DocsIndexPage() {
  const first = await getFirstPublishedArticle();

  if (first) {
    redirect(`/docs/${first.category_slug}/${first.article_slug}`);
  }

  return (
    <div className="text-center py-20">
      <div className="w-12 h-12 bg-brand-100 dark:bg-brand-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
        <span className="text-2xl">📚</span>
      </div>
      <h1 className="text-2xl font-bold text-foreground mb-2">Base de connaissances</h1>
      <p className="text-muted-foreground">
        Aucun article publié pour le moment. Connectez-vous à l&apos;interface admin pour créer du contenu.
      </p>
    </div>
  );
}
