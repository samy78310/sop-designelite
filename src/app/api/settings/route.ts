import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Note: In a real deployment, changing env vars programmatically requires Vercel API.
  // This endpoint exists as a placeholder — the password is managed via READER_PASSWORD env var.
  const { readerPassword } = await req.json();

  if (!readerPassword || readerPassword.length < 8) {
    return NextResponse.json({ error: "Mot de passe trop court (min 8 caractères)." }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    message: "Mettez à jour la variable READER_PASSWORD dans Vercel pour appliquer le changement.",
  });
}
