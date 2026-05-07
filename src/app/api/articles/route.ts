import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { sql } from "@vercel/postgres";
import { v4 as uuidv4 } from "uuid";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { rows } = await sql`
    SELECT a.*, c.title as category_title, c.slug as category_slug
    FROM articles a
    JOIN categories c ON a.category_id = c.id
    ORDER BY c.order_index, a.order_index
  `;
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { title, slug, description, category_id, content, published } = body;

  if (!title || !slug || !category_id) {
    return NextResponse.json({ error: "Champs obligatoires manquants." }, { status: 400 });
  }

  // Check slug uniqueness
  const existing = await sql`SELECT id FROM articles WHERE slug = ${slug}`;
  if (existing.rows.length > 0) {
    return NextResponse.json({ error: "Ce slug est déjà utilisé." }, { status: 400 });
  }

  // Get max order for this category
  const maxOrder = await sql`
    SELECT COALESCE(MAX(order_index), -1) as max FROM articles WHERE category_id = ${category_id}
  `;

  const id = uuidv4();
  const now = new Date().toISOString();
  const orderIndex = (maxOrder.rows[0].max as number) + 1;

  await sql`
    INSERT INTO articles (id, category_id, title, slug, description, content, order_index, published, created_at, updated_at)
    VALUES (${id}, ${category_id}, ${title}, ${slug}, ${description || ""}, ${content || ""}, ${orderIndex}, ${published ?? false}, ${now}, ${now})
  `;

  revalidatePath("/admin/articles");
  revalidatePath("/admin/categories");
  return NextResponse.json({ id, slug }, { status: 201 });
}
