import { createHmac, timingSafeEqual, createHash, randomBytes } from "crypto";
import { getServerEnv } from "./env";
import { logger } from "./logger";
import { getDb } from "./mongodb";

const { authSecret, adminUsername, adminPassword, nodeEnv } = getServerEnv();

const SESSION_MAX_AGE_SECONDS = 300;
const COOKIE_NAME = "portfolio_session";
const ADMIN_COLL = "admin_credentials";

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

function hashPassword(password: string, salt: string): string {
  return createHash("sha256")
    .update(salt + password + authSecret)
    .digest("hex");
}

interface StoredCredential {
  username: string;
  salt: string;
  hash: string;
}

async function getStoredCredential(username: string): Promise<StoredCredential | null> {
  try {
    const db = await getDb();
    const doc = await db
      .collection<StoredCredential>(ADMIN_COLL)
      .findOne({ username }, { projection: { _id: 0 } });
    return doc ?? null;
  } catch {
    return null;
  }
}

export async function validateCredentials(
  username: string,
  password: string
): Promise<boolean> {
  if (!username || !password) return false;

  const stored = await getStoredCredential(username);

  if (stored) {
    const hash = hashPassword(password, stored.salt);
    return timingSafeEqual(Buffer.from(hash), Buffer.from(stored.hash));
  }

  if (!adminUsername || !adminPassword) return false;
  const uMatch = timingSafeEqual(Buffer.from(username), Buffer.from(adminUsername));
  const pMatch = timingSafeEqual(Buffer.from(password), Buffer.from(adminPassword));
  return uMatch && pMatch;
}

export async function changePassword(
  username: string,
  currentPassword: string,
  newPassword: string
): Promise<{ ok: boolean; error?: string }> {
  const valid = await validateCredentials(username, currentPassword);
  if (!valid) {
    return { ok: false, error: "Current password is incorrect." };
  }

  if (newPassword.length < 12) {
    return { ok: false, error: "New password must be at least 12 characters." };
  }

  const salt = randomBytes(16).toString("hex");
  const hash = hashPassword(newPassword, salt);

  try {
    const db = await getDb();
    await db.collection<StoredCredential>(ADMIN_COLL).updateOne(
      { username },
      { $set: { username, salt, hash } },
      { upsert: true }
    );
    logger.info("Password changed", { username });
    return { ok: true };
  } catch (err) {
    logger.error("Failed to change password", {
      error: err instanceof Error ? err.message : String(err),
    });
    return { ok: false, error: "Failed to save new password. Try again." };
  }
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
  return [
    `${COOKIE_NAME}=`,
    "HttpOnly",
    "SameSite=Strict",
    "Path=/",
    "Max-Age=0",
  ].join("; ");
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
