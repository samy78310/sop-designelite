export const dynamic = "force-dynamic";

import { getArticleById, getAllCategories } from "@/lib/db";
import { ArticleForm } from "@/components/admin/ArticleForm";
import { notFound } from "next/navigation";

interface EditArticlePageProps {
  params: { id: string };
}

export default async function EditArticlePage({ params }: EditArticlePageProps) {
  const [article, categories] = await Promise.all([
    getArticleById(params.id),
    getAllCategories(),
  ]);

  if (!article) notFound();

  return (
    <ArticleForm article={article} categories={categories} mode="edit" />
  );
}
