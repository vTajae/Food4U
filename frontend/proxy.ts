import { NextResponse, type NextRequest } from "next/server";

// Edge gate (Next.js 16 proxy, formerly middleware): replaces functions/_middleware.ts.
// It only checks that a session cookie exists, so it needs no KV access; the
// (app) layout verifies the session contents and redirects if it is invalid.
const PUBLIC_PATHS = new Set(["/login"]);

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = request.cookies.has("__session");

  if (!hasSession && !PUBLIC_PATHS.has(pathname)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/login", "/welcome/:path*", "/dashboard/:path*"],
};
