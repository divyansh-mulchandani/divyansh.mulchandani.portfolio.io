const { MongoClient } = require("mongodb");

const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017";
const dbName = process.env.MONGODB_DB || "portfolio";

async function createIndexes() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    const col = db.collection("messages");

    await col.createIndex({ createdAt: -1 }, { name: "messages_createdAt_desc" });
    await col.createIndex({ email: 1 }, { name: "messages_email_asc" });
    await col.createIndex({ id: 1 }, { unique: true, name: "messages_id_unique" });

    console.log("Indexes created successfully.");
  } finally {
    await client.close();
  }
}

createIndexes().catch((err) => {
  console.error("Failed to create indexes:", err.message);
  process.exit(1);
});
