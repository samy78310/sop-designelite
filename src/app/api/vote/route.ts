import { NextRequest, NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  const { articleId, vote } = await req.json();
  if (!articleId || typeof vote !== "boolean") {
    return NextResponse.json({ error: "Invalid" }, { status: 400 });
  }

  await sql`
    INSERT INTO helpfulness_votes (id, article_id, vote, created_at)
    VALUES (${uuidv4()}, ${articleId}, ${vote}, NOW())
  `;

  return NextResponse.json({ ok: true });
}
