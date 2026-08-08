import { NextResponse } from "next/server";
import os from "os";
import { checkMongoHealth } from "@/lib/mongodb";
import { isRateLimited, getClientIp } from "@/lib/rate-limit";
import { withCors, rateLimitedResponse } from "@/lib/security";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

export async function GET(req: Request): Promise<Response> {
  const ip = getClientIp(req);
  if (isRateLimited(ip)) {
    logger.warn("Rate limit exceeded", { ip, path: "/api/status" });
    return rateLimitedResponse();
  }

  const mongoUp = await checkMongoHealth();
  const [one, five, fifteen] = os.loadavg();
  const statusOk = mongoUp;

  const body = {
    status: statusOk ? "ok" : "degraded",
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    nodeVersion: process.version,
    cpuCount: os.cpus().length,
    loadAverage: {
      oneMinute: parseFloat(one.toFixed(2)),
      fiveMinutes: parseFloat(five.toFixed(2)),
      fifteenMinutes: parseFloat(fifteen.toFixed(2)),
    },
    mongodb: mongoUp ? "up" : "down",
  };

  logger.info("Status API accessed", { ip, mongoUp });
  return withCors(NextResponse.json(body, { status: statusOk ? 200 : 503 }));
}

export async function OPTIONS(): Promise<Response> {
  const { corsHeaders } = await import("@/lib/security");
  return new Response(null, { status: 204, headers: corsHeaders() });
}
