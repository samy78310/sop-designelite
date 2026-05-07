import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { sql } from "@vercel/postgres";

interface Params {
  params: { id: string };
}

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { rows } = await sql`SELECT * FROM articles WHERE id = ${params.id}`;
  if (!rows[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(rows[0]);
}

export async function PUT(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { title, slug, description, category_id, content, published } = body;

  if (!title || !slug || !category_id) {
    return NextResponse.json({ error: "Champs obligatoires manquants." }, { status: 400 });
  }

  // Check slug uniqueness (exclude current)
  const existing = await sql`SELECT id FROM articles WHERE slug = ${slug} AND id != ${params.id}`;
  if (existing.rows.length > 0) {
    return NextResponse.json({ error: "Ce slug est déjà utilisé." }, { status: 400 });
  }

  const now = new Date().toISOString();

  await sql`
    UPDATE articles
    SET title = ${title}, slug = ${slug}, description = ${description || ""},
        category_id = ${category_id}, content = ${content || ""},
        published = ${published ?? false}, updated_at = ${now}
    WHERE id = ${params.id}
  `;

  revalidatePath("/admin/articles");
  revalidatePath("/admin/categories");
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await sql`DELETE FROM articles WHERE id = ${params.id}`;
  revalidatePath("/admin/articles");
  revalidatePath("/admin/categories");
  return NextResponse.json({ ok: true });
}
