interface Window {
  count: number;
  resetAt: number;
}

const store = new Map<string, Window>();

const WINDOW_MS = 1000;
const MAX_REQUESTS = 100;

export function isRateLimited(ip: string): boolean {
  const now = Date.now();
  let win = store.get(ip);

  if (!win || now > win.resetAt) {
    store.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }

  win.count++;
  if (win.count > MAX_REQUESTS) {
    return true;
  }
  return false;
}

export function getClientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return "unknown";
}
