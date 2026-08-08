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

const COLLECTION = "messages";

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
  return msg;
}
