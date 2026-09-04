import { NextResponse, type NextRequest } from "next/server";
import { isValidSessionToken, OPS_COOKIE } from "@/lib/ops/auth";

/**
 * Gate for /ops. Login stays public so the lock screen can render; everything
 * else behind it needs the session cookie. Missing password config still shows
 * the lock screen (with a clear message) rather than 404'ing the product.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/ops")) {
    return NextResponse.next();
  }

  if (pathname === "/ops/login" || pathname.startsWith("/ops/login/")) {
    // Already signed in → skip the lock screen.
    if (isValidSessionToken(request.cookies.get(OPS_COOKIE)?.value)) {
      return NextResponse.redirect(new URL("/ops", request.url));
    }
    return NextResponse.next();
  }

  // Login and logout must stay reachable without a session.
  if (
    pathname.startsWith("/api/ops/login") ||
    pathname.startsWith("/api/ops/logout")
  ) {
    return NextResponse.next();
  }

  if (!isValidSessionToken(request.cookies.get(OPS_COOKIE)?.value)) {
    const login = new URL("/ops/login", request.url);
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/ops", "/ops/:path*", "/api/ops/:path*"],
};
