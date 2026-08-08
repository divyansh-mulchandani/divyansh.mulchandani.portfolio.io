import { clearSessionCookieHeader, getSessionFromRequest } from "@/lib/auth";
import { corsHeaders } from "@/lib/security";
import { logger } from "@/lib/logger";
import { getClientIp } from "@/lib/rate-limit";

export async function POST(req: Request): Promise<Response> {
  const ip = getClientIp(req);
  const user = getSessionFromRequest(req);
  logger.info("Logout", { ip, user: user ?? "unauthenticated" });

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": clearSessionCookieHeader(),
      ...corsHeaders(),
    },
  });
}

export async function OPTIONS(): Promise<Response> {
  return new Response(null, { status: 204, headers: corsHeaders() });
}
