import { getDb } from "./mongodb";
import { logger } from "./logger";
import { randomUUID } from "crypto";

export interface Message {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
}

export interface CollectionStats {
  totalDocs: number;
  sizeBytes: number;
  sizeMB: number;
  storageSizeBytes: number;
  storageSizeMB: number;
  limitMB: number;
  usagePercent: number;
  lastRotation: string | null;
}

export interface RotationResult {
  rotated: boolean;
  deletedCount: number;
  sizeBeforeMB: number;
  sizeAfterMB: number;
}

const COLLECTION = "messages";
const ROTATION_LOG = "rotation_log";
const LIMIT_BYTES = 512 * 1024 * 1024;
const BATCH_SIZE = 100;

async function getCollSize(): Promise<{ size: number; storageSize: number }> {
  const db = await getDb();
  try {
    const stats = await db.command({ collStats: COLLECTION });
    return {
      size: stats.size ?? 0,
      storageSize: stats.storageSize ?? 0,
    };
  } catch {
    return { size: 0, storageSize: 0 };
  }
}

async function getLastRotation(): Promise<string | null> {
  const db = await getDb();
  try {
    const doc = await db
      .collection<{ ts: string }>(ROTATION_LOG)
      .findOne({}, { sort: { ts: -1 }, projection: { _id: 0, ts: 1 } });
    return doc?.ts ?? null;
  } catch {
    return null;
  }
}

async function logRotation(deletedCount: number, sizeBeforeBytes: number): Promise<void> {
  const db = await getDb();
  try {
    await db.collection(ROTATION_LOG).insertOne({
      ts: new Date().toISOString(),
      deletedCount,
      sizeBeforeBytes,
      limitBytes: LIMIT_BYTES,
    });
  } catch {
    // non-critical
  }
}

export async function getCollectionStats(): Promise<CollectionStats> {
  const { size, storageSize } = await getCollSize();
  const db = await getDb();
  const totalDocs = await db.collection(COLLECTION).countDocuments();
  const lastRotation = await getLastRotation();

  const limitMB = LIMIT_BYTES / (1024 * 1024);
  const sizeMB = parseFloat((size / (1024 * 1024)).toFixed(2));
  const storageSizeMB = parseFloat((storageSize / (1024 * 1024)).toFixed(2));

  return {
    totalDocs,
    sizeBytes: size,
    sizeMB,
    storageSizeBytes: storageSize,
    storageSizeMB,
    limitMB,
    usagePercent: parseFloat(Math.min((size / LIMIT_BYTES) * 100, 100).toFixed(1)),
    lastRotation,
  };
}

export async function rotateMessages(): Promise<RotationResult> {
  const { size: sizeBefore } = await getCollSize();

  if (sizeBefore < LIMIT_BYTES) {
    return {
      rotated: false,
      deletedCount: 0,
      sizeBeforeMB: parseFloat((sizeBefore / (1024 * 1024)).toFixed(2)),
      sizeAfterMB: parseFloat((sizeBefore / (1024 * 1024)).toFixed(2)),
    };
  }

  const db = await getDb();
  let totalDeleted = 0;

  logger.info("Data rotation started", {
    sizeBeforeBytes: sizeBefore,
    limitBytes: LIMIT_BYTES,
  });

  while (true) {
    const { size: current } = await getCollSize();
    if (current < LIMIT_BYTES) break;

    const oldest = await db
      .collection<Message>(COLLECTION)
      .find({}, { projection: { id: 1 }, sort: { createdAt: 1 } })
      .limit(BATCH_SIZE)
      .toArray();

    if (oldest.length === 0) break;

    const ids = oldest.map((d) => d.id);
    const result = await db.collection(COLLECTION).deleteMany({ id: { $in: ids } });
    totalDeleted += result.deletedCount;

    logger.info("Rotation batch deleted", { batchCount: result.deletedCount, totalDeleted });
  }

  const { size: sizeAfter } = await getCollSize();
  await logRotation(totalDeleted, sizeBefore);

  logger.info("Data rotation completed", {
    deletedCount: totalDeleted,
    sizeBeforeBytes: sizeBefore,
    sizeAfterBytes: sizeAfter,
  });

  return {
    rotated: true,
    deletedCount: totalDeleted,
    sizeBeforeMB: parseFloat((sizeBefore / (1024 * 1024)).toFixed(2)),
    sizeAfterMB: parseFloat((sizeAfter / (1024 * 1024)).toFixed(2)),
  };
}

export async function listMessages(): Promise<Message[]> {
  const db = await getDb();
  const docs = await db
    .collection<Message>(COLLECTION)
    .find({}, { projection: { _id: 0 } })
    .sort({ createdAt: -1 })
    .toArray();
  logger.info("Messages retrieved", { count: docs.length });
  return docs;
}

export async function createMessage(
  data: Omit<Message, "id" | "createdAt">
): Promise<Message> {
  const db = await getDb();
  const msg: Message = {
    id: randomUUID(),
    name: data.name,
    email: data.email,
    message: data.message,
    createdAt: new Date().toISOString(),
  };
  await db.collection(COLLECTION).insertOne({ ...msg });
  logger.info("Message created", { id: msg.id, email: msg.email });

  rotateMessages().catch((err) =>
    logger.error("Background rotation failed", {
      error: err instanceof Error ? err.message : String(err),
    })
  );

  return msg;
}
