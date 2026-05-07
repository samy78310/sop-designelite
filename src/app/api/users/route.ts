import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { sql } from "@vercel/postgres";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { email, name, password } = await req.json();
  if (!email || !name || !password) {
    return NextResponse.json({ error: "Tous les champs sont requis." }, { status: 400 });
  }

  const existing = await sql`SELECT id FROM admin_users WHERE email = ${email}`;
  if (existing.rows.length > 0) {
    return NextResponse.json({ error: "Cet email est déjà utilisé." }, { status: 400 });
  }

  const hash = await bcrypt.hash(password, 12);
  const id = uuidv4();

  await sql`
    INSERT INTO admin_users (id, email, name, password_hash, must_change_password, created_at)
    VALUES (${id}, ${email}, ${name}, ${hash}, true, NOW())
  `;

  return NextResponse.json({ id, email, name, must_change_password: true, created_at: new Date().toISOString() }, { status: 201 });
}
