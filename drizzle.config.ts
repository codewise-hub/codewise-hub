import 'dotenv/config';
import type { Config } from 'drizzle-kit';
import 'dotenv/config'; // Load .env.local for local dev

if (!process.env.DATABASE_URL) {
  throw new Error('❌ DATABASE_URL is not set in environment variables');
}

export default {
  schema: './shared/schema.ts', // Path to your Drizzle schema
  out: './drizzle',             // Folder where migrations will be stored
  driver: 'pg',                 // Postgres driver
  dbCredentials: {
    connectionString: process.env.DATABASE_URL,
    ssl: true, // Drizzle will enable SSL — Neon requires it
  },
  verbose: true,                 // Optional: shows extra logging
  strict: true,                  // Optional: strict type safety
} satisfies Config;
