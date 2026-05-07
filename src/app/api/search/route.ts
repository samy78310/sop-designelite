import { NextRequest, NextResponse } from "next/server";
import { searchArticles } from "@/lib/db";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") || "";
  if (!q.trim()) return NextResponse.json({ results: [] });

  try {
    const results = await searchArticles(q);
    return NextResponse.json({ results });
  } catch {
    return NextResponse.json({ results: [] });
  }
}
