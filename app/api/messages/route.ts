import { NextResponse } from "next/server";
import { listMessages, createMessage } from "@/lib/messages";
import { getSessionFromRequest } from "@/lib/auth";
import { isRateLimited, getClientIp } from "@/lib/rate-limit";
import {
  withCors,
  rateLimitedResponse,
  unauthorizedResponse,
  corsHeaders,
} from "@/lib/security";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

export async function GET(req: Request): Promise<Response> {
  const ip = getClientIp(req);
  if (isRateLimited(ip)) {
    logger.warn("Rate limit exceeded", { ip, path: "GET /api/messages" });
    return rateLimitedResponse();
  }

  const user = getSessionFromRequest(req);
  if (!user) {
    logger.warn("Unauthenticated GET /api/messages", { ip });
    return unauthorizedResponse();
  }

  try {
    const messages = await listMessages();
    return withCors(NextResponse.json({ messages }));
  } catch (err) {
    logger.error("Failed to retrieve messages", {
      error: err instanceof Error ? err.message : String(err),
    });
    return withCors(
      NextResponse.json({ error: "Service unavailable" }, { status: 503 })
    );
  }
}

export async function POST(req: Request): Promise<Response> {
  const ip = getClientIp(req);
  if (isRateLimited(ip)) {
    logger.warn("Rate limit exceeded", { ip, path: "POST /api/messages" });
    return rateLimitedResponse();
  }

  let body: { name?: string; email?: string; message?: string };
  try {
    body = await req.json();
  } catch {
    return withCors(
      NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
    );
  }

  const { name, email, message } = body;
  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return withCors(
      NextResponse.json({ error: "name, email, and message are required" }, { status: 400 })
    );
  }

  if (name.trim().length > 100) {
    return withCors(
      NextResponse.json({ error: "Name too long (max 100 characters)" }, { status: 400 })
    );
  }

  if (message.trim().length > 2000) {
    return withCors(
      NextResponse.json({ error: "Message too long (max 2000 characters)" }, { status: 400 })
    );
  }

  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRe.test(email.trim())) {
    return withCors(
      NextResponse.json({ error: "Invalid email address" }, { status: 400 })
    );
  }

  try {
    const created = await createMessage({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      message: message.trim(),
    });
    logger.info("Public message submitted", { ip, email: created.email });
    return withCors(NextResponse.json({ ok: true, id: created.id }, { status: 201 }));
  } catch (err) {
    logger.error("Failed to create message", {
      error: err instanceof Error ? err.message : String(err),
    });
    return withCors(
      NextResponse.json({ error: "Service unavailable" }, { status: 503 })
    );
  }
}

export async function OPTIONS(): Promise<Response> {
  return new Response(null, { status: 204, headers: corsHeaders() });
}
