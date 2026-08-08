import { NextResponse } from "next/server";
import { getSessionFromRequest, changePassword } from "@/lib/auth";
import { isRateLimited, getClientIp } from "@/lib/rate-limit";
import {
  isLockedOut,
  recordFailure,
  recordSuccess,
  remainingAttemptsMessage,
} from "@/lib/brute-force";
import { withCors, rateLimitedResponse, unauthorizedResponse, corsHeaders } from "@/lib/security";
import { logger } from "@/lib/logger";

export async function POST(req: Request): Promise<Response> {
  const ip = getClientIp(req);

  if (isRateLimited(ip)) {
    logger.warn("Rate limit exceeded on change-password", { ip });
    return rateLimitedResponse();
  }

  const user = getSessionFromRequest(req);
  if (!user) {
    return unauthorizedResponse();
  }

  const lockKey = `change-password:${ip}`;
  const { locked, remainingMs } = isLockedOut(lockKey);
  if (locked) {
    const mins = Math.ceil(remainingMs / 60000);
    return withCors(
      NextResponse.json(
        { error: `Too many failed attempts. Try again in ${mins} minute${mins !== 1 ? "s" : ""}.` },
        { status: 429 }
      )
    );
  }

  let body: { currentPassword?: string; newPassword?: string; confirmPassword?: string };
  try {
    body = await req.json();
  } catch {
    return withCors(NextResponse.json({ error: "Invalid JSON" }, { status: 400 }));
  }

  const { currentPassword = "", newPassword = "", confirmPassword = "" } = body;

  if (!currentPassword || !newPassword || !confirmPassword) {
    return withCors(
      NextResponse.json({ error: "All fields are required." }, { status: 400 })
    );
  }

  if (newPassword !== confirmPassword) {
    return withCors(
      NextResponse.json({ error: "New passwords do not match." }, { status: 400 })
    );
  }

  if (newPassword === currentPassword) {
    return withCors(
      NextResponse.json({ error: "New password must differ from current password." }, { status: 400 })
    );
  }

  const result = await changePassword(user, currentPassword, newPassword);

  if (!result.ok) {
    const count = recordFailure(lockKey);
    const hint = remainingAttemptsMessage(count);
    logger.warn("Failed password change attempt", { ip, user, attempts: count });
    return withCors(
      NextResponse.json({ error: `${result.error} ${hint}` }, { status: 400 })
    );
  }

  recordSuccess(lockKey);
  return withCors(NextResponse.json({ ok: true }));
}

export async function OPTIONS(): Promise<Response> {
  return new Response(null, { status: 204, headers: corsHeaders() });
}
