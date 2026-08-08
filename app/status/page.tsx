import os from "os";
import { checkMongoHealth } from "@/lib/mongodb";
import StatusClient from "./StatusClient";

export const dynamic = "force-dynamic";

export default async function StatusPage() {
  const mongoUp = await checkMongoHealth();
  const [one, five, fifteen] = os.loadavg();
  const cpus = os.cpus();
  const totalMem = os.totalmem();
  const freeMem = os.freemem();

  const data = {
    status: mongoUp ? "ok" : "degraded",
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    nodeVersion: process.version,
    cpuCount: cpus.length,
    loadAverage: {
      oneMinute: parseFloat(one.toFixed(2)),
      fiveMinutes: parseFloat(five.toFixed(2)),
      fifteenMinutes: parseFloat(fifteen.toFixed(2)),
    },
    memory: {
      totalMB: Math.round(totalMem / (1024 * 1024)),
      freeMB: Math.round(freeMem / (1024 * 1024)),
      usedMB: Math.round((totalMem - freeMem) / (1024 * 1024)),
      usagePercent: parseFloat(((totalMem - freeMem) / totalMem * 100).toFixed(1)),
    },
    mongodb: mongoUp ? "up" : "down",
  };

  return <StatusClient data={data} />;
}
