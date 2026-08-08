import { NextResponse } from "next/server";
import { isRateLimited, getClientIp } from "@/lib/rate-limit";
import { withCors, rateLimitedResponse } from "@/lib/security";
import { logger } from "@/lib/logger";

export async function GET(req: Request): Promise<Response> {
  const ip = getClientIp(req);
  if (isRateLimited(ip)) {
    logger.warn("Rate limit exceeded", { ip, path: "/api" });
    return rateLimitedResponse();
  }

  logger.info("API root accessed", { ip });
  return withCors(
    NextResponse.json({
      name: "Divyansh Mulchandani Portfolio API",
      version: "1.0.0",
      status: "ok",
      endpoints: {
        api: "GET /api",
        status: "GET /api/status",
        login: "POST /api/auth/login",
        logout: "POST /api/auth/logout",
        messages: "GET|POST /api/messages",
      },
    })
  );
}

export async function OPTIONS(): Promise<Response> {
  const { corsHeaders } = await import("@/lib/security");
  return new Response(null, { status: 204, headers: corsHeaders() });
}
