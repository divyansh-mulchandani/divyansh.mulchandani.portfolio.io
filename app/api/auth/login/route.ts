import { NextResponse } from "next/server";
import {
  validateCredentials,
  createSessionToken,
  sessionCookieHeader,
} from "@/lib/auth";
import { isRateLimited, getClientIp } from "@/lib/rate-limit";
import { withCors, rateLimitedResponse, corsHeaders } from "@/lib/security";
import { logger } from "@/lib/logger";

export async function POST(req: Request): Promise<Response> {
  const ip = getClientIp(req);
  if (isRateLimited(ip)) {
    logger.warn("Rate limit exceeded on login", { ip });
    return rateLimitedResponse();
  }

  let body: { username?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return withCors(
      NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
    );
  }

  const { username = "", password = "" } = body;
  if (!username || !password) {
    return withCors(
      NextResponse.json(
        { error: "Username and password required" },
        { status: 400 }
      )
    );
  }

  if (!validateCredentials(username, password)) {
    logger.warn("Failed login attempt", { ip, username });
    return withCors(
      NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    );
  }

  const token = createSessionToken(username);
  logger.info("Successful login", { ip, username });

  const headers: Record<string, string> = {
    "Set-Cookie": sessionCookieHeader(token),
    ...corsHeaders(),
  };

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "Content-Type": "application/json", ...headers },
  });
}

export async function OPTIONS(): Promise<Response> {
  return new Response(null, { status: 204, headers: corsHeaders() });
}
