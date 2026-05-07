import { NextResponse } from "next/server";
import { getNavigation } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const navigation = await getNavigation();
  return NextResponse.json(navigation);
}
