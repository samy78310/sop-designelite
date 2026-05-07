import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Docs routes — require reader password cookie
  if (pathname.startsWith("/docs")) {
    const readerToken = req.cookies.get("reader_token");
    const readerPassword = process.env.READER_PASSWORD;

    if (!readerPassword || !readerToken || readerToken.value !== readerPassword) {
      const url = new URL("/reader-login", req.url);
      url.searchParams.set("from", pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/docs/:path*"],
};
