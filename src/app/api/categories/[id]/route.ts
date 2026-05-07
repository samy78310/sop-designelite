import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { sql } from "@vercel/postgres";
import { slugify } from "@/lib/utils";

interface Params {
  params: { id: string };
}

export async function PUT(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title } = await req.json();
  if (!title) return NextResponse.json({ error: "Titre requis." }, { status: 400 });

  const newSlug = slugify(title);
  await sql`UPDATE categories SET title = ${title}, slug = ${newSlug} WHERE id = ${params.id}`;
  revalidatePath("/admin/categories");
  revalidatePath("/admin/articles");
  return NextResponse.json({ ok: true, slug: newSlug });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await sql`DELETE FROM categories WHERE id = ${params.id}`;
  revalidatePath("/admin/categories");
  revalidatePath("/admin/articles");
  return NextResponse.json({ ok: true });
}
