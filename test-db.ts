/**
 * Database Connection Test Script
 * Run with: npx tsx test-db.ts
 */

import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.development' });

async function testConnection() {
  console.log('🔍 Testing database connection...\n');

  const dbUrl = process.env.DATABASE_URL || process.env.VITE_DATABASE_URL;

  if (!dbUrl) {
    console.error('❌ DATABASE_URL not found in environment');
    process.exit(1);
  }

  console.log('✅ Database URL found');
  console.log('🔗 Connecting to Neon...\n');

  try {
    const sql = neon(dbUrl);

    // Test 1: Basic query
    const result = await sql`SELECT version()`;
    console.log('✅ Connection successful!');
    console.log('📊 PostgreSQL version:', result[0].version);
    console.log('');

    // Test 2: Check tables
    const tables = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;

    console.log('📋 Tables in database:');
    tables.forEach((t: any) => console.log(`   - ${t.table_name}`));
    console.log('');

    // Test 3: Count records
    const userCount = await sql`SELECT COUNT(*) FROM users`;
    const planCount = await sql`SELECT COUNT(*) FROM plans`;
    const docCount = await sql`SELECT COUNT(*) FROM documents`;
    const promptCount = await sql`SELECT COUNT(*) FROM prompts`;

    console.log('📈 Record counts:');
    console.log(`   - Users: ${userCount[0].count}`);
    console.log(`   - Plans: ${planCount[0].count}`);
    console.log(`   - Documents: ${docCount[0].count}`);
    console.log(`   - Prompts: ${promptCount[0].count}`);
    console.log('');

    console.log('✅ All tests passed!');
    console.log('🎉 Database is ready to use');

  } catch (error) {
    console.error('❌ Database test failed:', error);
    process.exit(1);
  }
}

testConnection();
