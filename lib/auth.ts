import { createHmac, timingSafeEqual } from "crypto";
import { getServerEnv } from "./env";
import { logger } from "./logger";

const { authSecret, adminUsername, adminPassword, nodeEnv } = getServerEnv();

const SESSION_MAX_AGE_SECONDS = 300; // 5 minutes
const COOKIE_NAME = "portfolio_session";

function sign(payload: string): string {
  return createHmac("sha256", authSecret).update(payload).digest("hex");
}

export function createSessionToken(username: string): string {
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS;
  const payload = `${username}:${expiresAt}`;
  const sig = sign(payload);
  return Buffer.from(`${payload}.${sig}`).toString("base64url");
}

export function verifySessionToken(token: string): string | null {
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf8");
    const lastDot = decoded.lastIndexOf(".");
    if (lastDot === -1) return null;

    const payload = decoded.slice(0, lastDot);
    const sig = decoded.slice(lastDot + 1);
    const expectedSig = sign(payload);

    const sigBuf = Buffer.from(sig, "hex");
    const expectedBuf = Buffer.from(expectedSig, "hex");
    if (sigBuf.length !== expectedBuf.length) return null;
    if (!timingSafeEqual(sigBuf, expectedBuf)) return null;

    const [username, expiresAtStr] = payload.split(":");
    const expiresAt = parseInt(expiresAtStr, 10);
    if (Math.floor(Date.now() / 1000) > expiresAt) {
      logger.warn("Session token expired", { username });
      return null;
    }
    return username;
  } catch {
    return null;
  }
}

export function validateCredentials(
  username: string,
  password: string
): boolean {
  if (!adminUsername || !adminPassword) return false;
  const uMatch = timingSafeEqual(
    Buffer.from(username),
    Buffer.from(adminUsername)
  );
  const pMatch = timingSafeEqual(
    Buffer.from(password),
    Buffer.from(adminPassword)
  );
  return uMatch && pMatch;
}

export function sessionCookieHeader(token: string): string {
  const isProduction = nodeEnv === "production";
  const parts = [
    `${COOKIE_NAME}=${token}`,
    "HttpOnly",
    "SameSite=Strict",
    "Path=/",
    `Max-Age=${SESSION_MAX_AGE_SECONDS}`,
  ];
  if (isProduction) parts.push("Secure");
  return parts.join("; ");
}

export function clearSessionCookieHeader(): string {
  const parts = [
    `${COOKIE_NAME}=`,
    "HttpOnly",
    "SameSite=Strict",
    "Path=/",
    "Max-Age=0",
  ];
  return parts.join("; ");
}

export function getSessionFromRequest(req: Request): string | null {
  const cookieHeader = req.headers.get("cookie") ?? "";
  const match = cookieHeader
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${COOKIE_NAME}=`));
  if (!match) return null;
  const token = match.slice(COOKIE_NAME.length + 1);
  return verifySessionToken(token);
}

export { COOKIE_NAME };
