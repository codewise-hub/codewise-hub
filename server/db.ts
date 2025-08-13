import { drizzle } from 'drizzle-orm/node-postgres';
import { Client } from 'pg';

if (!process.env.DATABASE_URL) {
  throw new Error('❌ DATABASE_URL is not set in environment variables');
}

// Cache DB connection for Vercel serverless
const globalForDb = globalThis as unknown as {
  pgClient?: Client;
  db?: ReturnType<typeof drizzle>;
};

let client: Client;
let db: ReturnType<typeof drizzle>;

if (!globalForDb.pgClient) {
  client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }, // ✅ Required for Neon
  });

  client.connect().catch((err) => {
    console.error('❌ Error connecting to database:', err);
  });

  db = drizzle(client);
  globalForDb.pgClient = client;
  globalForDb.db = db;
} else {
  client = globalForDb.pgClient;
  db = globalForDb.db!;
}

export { client, db };
