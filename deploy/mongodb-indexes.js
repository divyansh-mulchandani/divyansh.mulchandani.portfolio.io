const { MongoClient } = require("mongodb");

const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017";
const dbName = process.env.MONGODB_DB || "portfolio";

async function createIndexes() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);

    const messages = db.collection("messages");
    await messages.createIndex({ createdAt: 1 }, { name: "messages_createdAt_asc" });
    await messages.createIndex({ createdAt: -1 }, { name: "messages_createdAt_desc" });
    await messages.createIndex({ email: 1 }, { name: "messages_email_asc" });
    await messages.createIndex({ id: 1 }, { unique: true, name: "messages_id_unique" });

    const rotLog = db.collection("rotation_log");
    await rotLog.createIndex({ ts: -1 }, { name: "rotation_log_ts_desc" });

    console.log("Indexes created successfully.");
  } finally {
    await client.close();
  }
}

createIndexes().catch((err) => {
  console.error("Failed to create indexes:", err.message);
  process.exit(1);
});
