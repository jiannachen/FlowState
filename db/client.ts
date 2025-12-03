import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

// Database client for Neon Postgres
// Note: In production, this should be called from a backend API to secure credentials
// For this demo, we're using it directly from the client with environment variables

const DATABASE_URL = import.meta.env.VITE_DATABASE_URL || import.meta.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.warn('⚠️ DATABASE_URL not found. Database features will be disabled.');
}

let db: ReturnType<typeof drizzle> | null = null;

try {
  if (DATABASE_URL) {
    const sql = neon(DATABASE_URL);
    db = drizzle(sql, { schema });
  }
} catch (error) {
  console.error('Failed to initialize database:', error);
}

export { db };
