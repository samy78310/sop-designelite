"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

interface DeleteArticleButtonProps {
  id: string;
  title: string;
}

export function DeleteArticleButton({ id, title }: DeleteArticleButtonProps) {
  const [confirming, setConfirming] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    await fetch(`/api/articles/${id}`, { method: "DELETE" });
    router.refresh();
    setConfirming(false);
  };

  if (confirming) {
    return (
      <div className="flex items-center gap-1">
        <button
          onClick={handleDelete}
          className="px-2 py-1 text-xs bg-red-500 hover:bg-red-600 text-white rounded transition"
        >
          Confirmer
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="px-2 py-1 text-xs border border-border rounded hover:bg-muted transition"
        >
          Annuler
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-950/20 text-muted-foreground hover:text-red-500 transition"
      title={`Supprimer "${title}"`}
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}
