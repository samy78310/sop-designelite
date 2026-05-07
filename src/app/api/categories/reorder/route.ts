import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { sql } from "@vercel/postgres";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { orders } = await req.json() as { orders: Array<{ id: string; order_index: number }> };

  for (const { id, order_index } of orders) {
    await sql`UPDATE categories SET order_index = ${order_index} WHERE id = ${id}`;
  }

  return NextResponse.json({ ok: true });
}
