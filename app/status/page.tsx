import os from "os";
import { checkMongoHealth } from "@/lib/mongodb";
import StatusClient from "./StatusClient";

export const dynamic = "force-dynamic";

export default async function StatusPage() {
  const mongoUp = await checkMongoHealth();
  const [one, five, fifteen] = os.loadavg();
  const cpus = os.cpus();

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
    mongodb: mongoUp ? "up" : "down",
  };

  return <StatusClient data={data} />;
}
