import { NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { getCollectionStats, rotateMessages } from "@/lib/messages";
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
  if (isRateLimited(ip)) return rateLimitedResponse();

  const user = getSessionFromRequest(req);
  if (!user) return unauthorizedResponse();

  try {
    const stats = await getCollectionStats();
    return withCors(NextResponse.json({ stats }));
  } catch (err) {
    logger.error("Failed to get collection stats", {
      error: err instanceof Error ? err.message : String(err),
    });
    return withCors(
      NextResponse.json({ error: "Failed to retrieve stats" }, { status: 503 })
    );
  }
}

export async function POST(req: Request): Promise<Response> {
  const ip = getClientIp(req);
  if (isRateLimited(ip)) return rateLimitedResponse();

  const user = getSessionFromRequest(req);
  if (!user) return unauthorizedResponse();

  let body: { action?: string } = {};
  try {
    body = await req.json();
  } catch {
    return withCors(NextResponse.json({ error: "Invalid JSON" }, { status: 400 }));
  }

  if (body.action !== "rotate") {
    return withCors(
      NextResponse.json({ error: "Unknown action. Use: rotate" }, { status: 400 })
    );
  }

  try {
    logger.info("Manual rotation triggered", { ip, user });
    const result = await rotateMessages();
    return withCors(NextResponse.json({ result }));
  } catch (err) {
    logger.error("Manual rotation failed", {
      error: err instanceof Error ? err.message : String(err),
    });
    return withCors(
      NextResponse.json({ error: "Rotation failed" }, { status: 503 })
    );
  }
}

export async function OPTIONS(): Promise<Response> {
  return new Response(null, { status: 204, headers: corsHeaders() });
}
