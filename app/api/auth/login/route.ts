import { NextResponse } from "next/server";
import {
  validateCredentials,
  createSessionToken,
  sessionCookieHeader,
} from "@/lib/auth";
import { isRateLimited, getClientIp } from "@/lib/rate-limit";
import {
  isLockedOut,
  recordFailure,
  recordSuccess,
  remainingAttemptsMessage,
} from "@/lib/brute-force";
import { withCors, rateLimitedResponse, corsHeaders } from "@/lib/security";
import { logger } from "@/lib/logger";

export async function POST(req: Request): Promise<Response> {
  const ip = getClientIp(req);

  if (isRateLimited(ip)) {
    logger.warn("Rate limit exceeded on login", { ip });
    return rateLimitedResponse();
  }

  const lockKey = `login:${ip}`;
  const { locked, remainingMs } = isLockedOut(lockKey);
  if (locked) {
    const mins = Math.ceil(remainingMs / 60000);
    logger.warn("Login attempt on locked account", { ip });
    return withCors(
      NextResponse.json(
        { error: `Too many failed attempts. Try again in ${mins} minute${mins !== 1 ? "s" : ""}.` },
        { status: 429 }
      )
    );
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
      NextResponse.json({ error: "Username and password required" }, { status: 400 })
    );
  }

  const valid = await validateCredentials(username, password);
  if (!valid) {
    const count = recordFailure(lockKey);
    const hint = remainingAttemptsMessage(count);
    logger.warn("Failed login attempt", { ip, username, attempts: count });
    return withCors(
      NextResponse.json({ error: `Invalid credentials. ${hint}` }, { status: 401 })
    );
  }

  recordSuccess(lockKey);
  const token = createSessionToken(username);
  logger.info("Successful login", { ip, username });

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": sessionCookieHeader(token),
      ...corsHeaders(),
    },
  });
}

export async function OPTIONS(): Promise<Response> {
  return new Response(null, { status: 204, headers: corsHeaders() });
}
