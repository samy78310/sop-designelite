"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { slugify, formatDate } from "@/lib/utils";
import { Save, Eye, Globe, ArrowLeft } from "lucide-react";
import type { Article, Category } from "@/types";

const TiptapEditor = dynamic(
  () => import("./TiptapEditor").then((m) => m.TiptapEditor),
  { ssr: false, loading: () => <div className="border border-border rounded-xl h-[400px] flex items-center justify-center text-muted-foreground text-sm">Chargement de l&apos;éditeur...</div> }
);

interface ArticleFormProps {
  article?: Partial<Article>;
  categories: Category[];
  mode: "new" | "edit";
}

export function ArticleForm({ article, categories, mode }: ArticleFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(article?.title || "");
  const [slug, setSlug] = useState(article?.slug || "");
  const [description, setDescription] = useState(article?.description || "");
  const [categoryId, setCategoryId] = useState(article?.category_id || categories[0]?.id || "");
  const [content, setContent] = useState(article?.content || "");
  const [published, setPublished] = useState(article?.published ?? false);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!slugManuallyEdited && mode === "new") {
      setSlug(slugify(title));
    }
  }, [title, slugManuallyEdited, mode]);

  const handleSave = async (publish?: boolean) => {
    setSaving(true);
    setError("");

    const body = {
      title,
      slug,
      description,
      category_id: categoryId,
      content,
      published: publish !== undefined ? publish : published,
    };

    const url = mode === "new" ? "/api/articles" : `/api/articles/${article?.id}`;
    const method = mode === "new" ? "POST" : "PUT";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      const data = await res.json();
      setSavedAt(new Date());
      if (publish !== undefined) setPublished(publish);
      if (mode === "new") {
        router.push(`/admin/articles/${data.id}/edit`);
      }
    } else {
      const data = await res.json();
      setError(data.error || "Erreur lors de la sauvegarde.");
    }

    setSaving(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/admin/articles")}
            className="flex items-center gap-1.5 px-3 py-2 border border-border rounded-lg text-sm hover:bg-muted transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </button>
          <h1 className="text-2xl font-bold text-foreground">
            {mode === "new" ? "Nouvel article" : "Modifier l'article"}
          </h1>
          {savedAt && (
            <p className="text-xs text-muted-foreground mt-1">
              Dernière sauvegarde à {savedAt.toLocaleTimeString("fr-FR")}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleSave()}
            disabled={saving}
            className="flex items-center gap-1.5 px-4 py-2 border border-border rounded-lg text-sm hover:bg-muted transition disabled:opacity-60"
          >
            <Save className="w-4 h-4" />
            {saving ? "Sauvegarde..." : "Sauvegarder"}
          </button>
          {!published ? (
            <button
              onClick={() => handleSave(true)}
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-sm font-medium transition disabled:opacity-60"
            >
              <Globe className="w-4 h-4" />
              Publier
            </button>
          ) : (
            <button
              onClick={() => handleSave(false)}
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition disabled:opacity-60"
            >
              <Eye className="w-4 h-4" />
              Dépublier
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* Status badge */}
      <div className="flex items-center gap-2">
        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
          published
            ? "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400"
            : "bg-muted text-muted-foreground"
        }`}>
          {published ? "● Publié" : "○ Brouillon"}
        </span>
      </div>

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Titre <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
          placeholder="Titre de l'article"
        />
      </div>

      {/* Slug + Category row */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Slug (URL)
          </label>
          <input
            type="text"
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value);
              setSlugManuallyEdited(true);
            }}
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
            placeholder="mon-article"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Catégorie
          </label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Description (sous-titre)
        </label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
          placeholder="Brève description de cet article..."
        />
      </div>

      {/* Editor */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Contenu
        </label>
        <TiptapEditor content={content} onChange={setContent} />
      </div>
    </div>
  );
}
