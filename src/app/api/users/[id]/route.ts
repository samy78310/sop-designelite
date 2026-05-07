import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { sql } from "@vercel/postgres";

interface Params {
  params: { id: string };
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Prevent deleting own account
  if (session.user.id === params.id) {
    return NextResponse.json({ error: "Vous ne pouvez pas supprimer votre propre compte." }, { status: 400 });
  }

  await sql`DELETE FROM admin_users WHERE id = ${params.id}`;
  return NextResponse.json({ ok: true });
}
