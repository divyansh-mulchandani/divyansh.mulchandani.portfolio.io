import { logger } from "./logger";

interface Attempt {
  count: number;
  lockedUntil: number | null;
  lastAttempt: number;
}

const store = new Map<string, Attempt>();

const MAX_FAILURES = 5;
const LOCKOUT_MS = 15 * 60 * 1000;
const WINDOW_MS = 10 * 60 * 1000;

export function isLockedOut(key: string): { locked: boolean; remainingMs: number } {
  const now = Date.now();
  const entry = store.get(key);
  if (!entry) return { locked: false, remainingMs: 0 };

  if (entry.lockedUntil) {
    if (now < entry.lockedUntil) {
      return { locked: true, remainingMs: entry.lockedUntil - now };
    }
    store.delete(key);
    return { locked: false, remainingMs: 0 };
  }

  return { locked: false, remainingMs: 0 };
}

export function recordFailure(key: string): number {
  const now = Date.now();
  const entry = store.get(key) ?? { count: 0, lockedUntil: null, lastAttempt: now };

  if (now - entry.lastAttempt > WINDOW_MS) {
    entry.count = 0;
    entry.lockedUntil = null;
  }

  entry.count++;
  entry.lastAttempt = now;

  if (entry.count >= MAX_FAILURES) {
    entry.lockedUntil = now + LOCKOUT_MS;
    logger.warn("Brute force lockout triggered", { key, attempts: entry.count });
  }

  store.set(key, entry);
  return entry.count;
}

export function recordSuccess(key: string): void {
  store.delete(key);
}

export function remainingAttemptsMessage(count: number): string {
  const remaining = MAX_FAILURES - count;
  if (remaining <= 0) return `Account locked for 15 minutes.`;
  return `${remaining} attempt${remaining !== 1 ? "s" : ""} remaining before lockout.`;
}
