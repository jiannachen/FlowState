import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

// This file is designed for the Server-Side (Next.js API Routes / Server Actions)
// In a pure client-side environment, we avoid initializing this to prevent errors.

const isServer = typeof process !== 'undefined' && process.env && process.env.DATABASE_URL;

let db: any = null;

if (isServer) {
  const sql = neon(process.env.DATABASE_URL!);
  db = drizzle(sql, { schema });
}

export { db };
