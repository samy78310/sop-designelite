import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { sql } from "@vercel/postgres";
import { v4 as uuidv4 } from "uuid";
import { slugify } from "@/lib/utils";

export async function GET() {
  const { rows } = await sql`
    SELECT c.*, COUNT(a.id)::int as article_count
    FROM categories c
    LEFT JOIN articles a ON a.category_id = c.id
    GROUP BY c.id
    ORDER BY c.order_index ASC
  `;
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { title, slug: rawSlug } = body;
  const slug = rawSlug || slugify(title);

  if (!title) return NextResponse.json({ error: "Titre requis." }, { status: 400 });

  const existing = await sql`SELECT id FROM categories WHERE slug = ${slug}`;
  if (existing.rows.length > 0) {
    return NextResponse.json({ error: "Ce slug est déjà utilisé." }, { status: 400 });
  }

  const maxOrder = await sql`SELECT COALESCE(MAX(order_index), -1) as max FROM categories`;
  const id = uuidv4();
  const orderIndex = (maxOrder.rows[0].max as number) + 1;

  await sql`
    INSERT INTO categories (id, title, slug, order_index, created_at)
    VALUES (${id}, ${title}, ${slug}, ${orderIndex}, NOW())
  `;

  revalidatePath("/admin/categories");
  revalidatePath("/docs", "layout");
  revalidatePath("/admin/articles");
  return NextResponse.json({ id, title, slug, order_index: orderIndex, article_count: 0 }, { status: 201 });
}
