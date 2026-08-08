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
    logger.warn("Rate limit exceeded", { ip, path: "/api/messages" });
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

  const user = getSessionFromRequest(req);
  if (!user) {
    logger.warn("Unauthenticated POST /api/messages", { ip });
    return unauthorizedResponse();
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
  if (!name || !email || !message) {
    return withCors(
      NextResponse.json(
        { error: "name, email, and message are required" },
        { status: 400 }
      )
    );
  }

  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRe.test(email)) {
    return withCors(
      NextResponse.json({ error: "Invalid email address" }, { status: 400 })
    );
  }

  try {
    const created = await createMessage({ name, email, message });
    return withCors(NextResponse.json({ message: created }, { status: 201 }));
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
