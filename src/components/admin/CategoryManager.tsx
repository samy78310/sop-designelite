"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Link from "next/link";
import { GripVertical, Pencil, Trash2, Plus, Check, X } from "lucide-react";
import type { Category } from "@/types";
import { slugify } from "@/lib/utils";

interface SortableItemProps {
  category: Category;
  onRename: (id: string, newTitle: string) => void;
  onDelete: (id: string) => void;
}

function SortableItem({ category, onRename, onDelete }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: category.id,
  });
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(category.title);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleSave = () => {
    if (editValue.trim()) {
      onRename(category.id, editValue.trim());
    }
    setEditing(false);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-3 bg-card border border-border rounded-lg"
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground p-1"
      >
        <GripVertical className="w-4 h-4" />
      </button>

      {editing ? (
        <div className="flex-1 flex items-center gap-2">
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="flex-1 px-2 py-1 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-brand-500"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave();
              if (e.key === "Escape") { setEditing(false); setEditValue(category.title); }
            }}
          />
          <button onClick={handleSave} className="p-1 text-green-500 hover:text-green-600">
            <Check className="w-4 h-4" />
          </button>
          <button onClick={() => { setEditing(false); setEditValue(category.title); }} className="p-1 text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="flex-1">
          <Link
            href={`/admin/categories/${category.id}`}
            className="text-sm font-medium text-foreground hover:text-brand-500 transition"
          >
            {category.title}
          </Link>
          <span className="ml-2 text-xs text-muted-foreground font-mono">/{category.slug}</span>
          <span className="ml-2 text-xs text-muted-foreground">
            {category.article_count ?? 0} article{(category.article_count ?? 0) !== 1 ? "s" : ""}
          </span>
        </div>
      )}

      {!editing && (
        <div className="flex items-center gap-1">
          <button
            onClick={() => setEditing(true)}
            className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(category.id)}
            className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-950/20 text-muted-foreground hover:text-red-500 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

interface CategoryManagerProps {
  initialCategories: Category[];
}

export function CategoryManager({ initialCategories }: CategoryManagerProps) {
  const [categories, setCategories] = useState(initialCategories);
  const [newTitle, setNewTitle] = useState("");
  const [adding, setAdding] = useState(false);
  const router = useRouter();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = categories.findIndex((c) => c.id === active.id);
    const newIndex = categories.findIndex((c) => c.id === over.id);
    const reordered = arrayMove(categories, oldIndex, newIndex).map((c, i) => ({
      ...c,
      order_index: i,
    }));
    setCategories(reordered);

    await fetch("/api/categories/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orders: reordered.map((c) => ({ id: c.id, order_index: c.order_index })) }),
    });
  };

  const handleRename = async (id: string, newTitle: string) => {
    const res = await fetch(`/api/categories/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle }),
    });
    if (res.ok) {
      const data = await res.json();
      setCategories((prev) =>
        prev.map((c) => (c.id === id ? { ...c, title: newTitle, slug: data.slug ?? c.slug } : c))
      );
      router.refresh();
    } else {
      const data = await res.json();
      alert(data.error || "Erreur lors de la mise à jour.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cette catégorie et tous ses articles ?")) return;
    await fetch(`/api/categories/${id}`, { method: "DELETE" });
    setCategories((prev) => prev.filter((c) => c.id !== id));
    router.refresh();
  };

  const handleAdd = async () => {
    if (!newTitle.trim()) return;
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle.trim(), slug: slugify(newTitle) }),
    });
    if (res.ok) {
      const data = await res.json();
      setCategories((prev) => [...prev, data]);
      setNewTitle("");
      setAdding(false);
      router.refresh();
    } else {
      const data = await res.json();
      alert(data.error || "Erreur lors de la création.");
    }
  };

  return (
    <div className="space-y-3">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={categories.map((c) => c.id)} strategy={verticalListSortingStrategy}>
          {categories.map((cat) => (
            <SortableItem
              key={cat.id}
              category={cat}
              onRename={handleRename}
              onDelete={handleDelete}
            />
          ))}
        </SortableContext>
      </DndContext>

      {adding ? (
        <div className="flex items-center gap-2 p-3 bg-card border border-brand-200 dark:border-brand-700 rounded-lg">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="flex-1 px-2 py-1 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-brand-500"
            placeholder="Nom de la catégorie..."
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAdd();
              if (e.key === "Escape") { setAdding(false); setNewTitle(""); }
            }}
          />
          <button
            onClick={handleAdd}
            className="px-3 py-1.5 text-sm bg-brand-500 hover:bg-brand-600 text-white rounded-md transition"
          >
            Ajouter
          </button>
          <button
            onClick={() => { setAdding(false); setNewTitle(""); }}
            className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-2 px-4 py-2.5 w-full border border-dashed border-border rounded-lg text-sm text-muted-foreground hover:text-foreground hover:border-brand-300 hover:bg-brand-50/50 dark:hover:bg-brand-500/5 transition"
        >
          <Plus className="w-4 h-4" />
          Ajouter une catégorie
        </button>
      )}
    </div>
  );
}
