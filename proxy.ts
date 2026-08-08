import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySessionTokenEdge, getTokenFromCookies } from "./lib/auth-edge";

const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

function addSecurityHeaders(res: NextResponse): NextResponse {
  res.headers.set("Content-Security-Policy", CSP);
  res.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  res.headers.set("X-DNS-Prefetch-Control", "off");
  return res;
}

export async function proxy(req: NextRequest): Promise<NextResponse> {
  const { pathname } = req.nextUrl;

  if (
    pathname.startsWith("/messages") &&
    !pathname.startsWith("/messages/login")
  ) {
    const secret = process.env.AUTH_SECRET ?? "";
    const token = getTokenFromCookies(req.headers.get("cookie"));
    const user = token ? await verifySessionTokenEdge(token, secret) : null;

    if (!user) {
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = "/messages/login";
      return NextResponse.redirect(loginUrl);
    }
  }

  return addSecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
