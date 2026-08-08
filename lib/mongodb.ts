import { MongoClient, Db } from "mongodb";
import { getServerEnv } from "./env";
import { logger } from "./logger";

const { mongodbUri, mongodbDb } = getServerEnv();

let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient> | null = null;

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

function createClientPromise(): Promise<MongoClient> {
  const mc = new MongoClient(mongodbUri, {
    connectTimeoutMS: 5000,
    serverSelectionTimeoutMS: 5000,
  });
  return mc.connect().then((connected) => {
    client = connected;
    logger.info("MongoDB connected", { db: mongodbDb });
    return connected;
  });
}

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    global._mongoClientPromise = createClientPromise();
  }
  clientPromise = global._mongoClientPromise;
} else {
  clientPromise = createClientPromise();
}

export async function getDb(): Promise<Db> {
  const mc = await clientPromise!;
  return mc.db(mongodbDb);
}

export async function checkMongoHealth(): Promise<boolean> {
  try {
    const db = await getDb();
    await db.command({ ping: 1 });
    return true;
  } catch (err) {
    logger.error("MongoDB health check failed", {
      error: err instanceof Error ? err.message : String(err),
    });
    return false;
  }
}

export { client };
