export const dynamic = "force-dynamic";

import { getAllCategories } from "@/lib/db";
import { ArticleForm } from "@/components/admin/ArticleForm";

export default async function NewArticlePage() {
  const categories = await getAllCategories();

  return (
    <ArticleForm categories={categories} mode="new" />
  );
}
