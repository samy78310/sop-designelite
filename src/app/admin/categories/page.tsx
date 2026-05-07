export const dynamic = "force-dynamic";

import { getAllCategories } from "@/lib/db";
import { CategoryManager } from "@/components/admin/CategoryManager";

export default async function AdminCategoriesPage() {
  const categories = await getAllCategories();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Catégories</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Gérez les sections de navigation de la documentation.
        </p>
      </div>
      <CategoryManager initialCategories={categories} />
    </div>
  );
}
