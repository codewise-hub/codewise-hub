import { Client } from "pg";

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function testConnection() {
  try {
    await client.connect();
    const res = await client.query("SELECT NOW()");
    console.log("✅ DB Connected:", res.rows[0]);
  } catch (err) {
    console.error("❌ Connection error:", err);
  } finally {
    await client.end();
  }
}

testConnection();