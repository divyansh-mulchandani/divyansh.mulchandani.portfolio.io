import fs from "fs";
import path from "path";

type LogLevel = "info" | "warn" | "error" | "debug";

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  [key: string]: unknown;
}

const LOG_FILE = path.join(process.cwd(), "logs", "app.log");

function writeLog(entry: LogEntry): void {
  const line = JSON.stringify(entry) + "\n";
  process.stdout.write(line);
  try {
    fs.appendFileSync(LOG_FILE, line);
  } catch {
    // log dir may not exist in some envs; stdout always works
  }
}

function buildEntry(
  level: LogLevel,
  message: string,
  meta?: Record<string, unknown>
): LogEntry {
  return {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...meta,
  };
}

export const logger = {
  info(message: string, meta?: Record<string, unknown>): void {
    writeLog(buildEntry("info", message, meta));
  },
  warn(message: string, meta?: Record<string, unknown>): void {
    writeLog(buildEntry("warn", message, meta));
  },
  error(message: string, meta?: Record<string, unknown>): void {
    writeLog(buildEntry("error", message, meta));
  },
  debug(message: string, meta?: Record<string, unknown>): void {
    if (process.env.NODE_ENV !== "production") {
      writeLog(buildEntry("debug", message, meta));
    }
  },
};
