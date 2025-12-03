/**
 * Database Schema Inspector
 * Detailed inspection of all table structures
 */

import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.development' });

const DATABASE_URL = process.env.DATABASE_URL || process.env.VITE_DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not found');
  process.exit(1);
}

const sql = neon(DATABASE_URL);

async function inspectSchema() {
  console.log('🔍 Database Schema Inspector\n');
  console.log('=' .repeat(80));

  try {
    // Get all tables
    const tables = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;

    for (const table of tables) {
      const tableName = table.table_name;
      console.log(`\n📋 Table: ${tableName}`);
      console.log('-'.repeat(80));

      // Get columns info
      const columns = await sql`
        SELECT
          column_name,
          data_type,
          is_nullable,
          column_default,
          character_maximum_length
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = ${tableName}
        ORDER BY ordinal_position
      `;

      console.log('\nColumns:');
      columns.forEach((col: any) => {
        const nullable = col.is_nullable === 'YES' ? '(nullable)' : '(NOT NULL)';
        const defaultVal = col.column_default ? `DEFAULT ${col.column_default}` : '';
        console.log(`  • ${col.column_name.padEnd(20)} ${col.data_type.padEnd(15)} ${nullable} ${defaultVal}`);
      });

      // Get constraints (primary keys, foreign keys, etc.)
      const constraints = await sql`
        SELECT
          tc.constraint_name,
          tc.constraint_type,
          kcu.column_name,
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        LEFT JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
        WHERE tc.table_schema = 'public'
          AND tc.table_name = ${tableName}
      `;

      if (constraints.length > 0) {
        console.log('\nConstraints:');
        constraints.forEach((c: any) => {
          if (c.constraint_type === 'PRIMARY KEY') {
            console.log(`  🔑 PRIMARY KEY: ${c.column_name}`);
          } else if (c.constraint_type === 'FOREIGN KEY') {
            console.log(`  🔗 FOREIGN KEY: ${c.column_name} → ${c.foreign_table_name}.${c.foreign_column_name}`);
          } else {
            console.log(`  ⚙️  ${c.constraint_type}: ${c.column_name}`);
          }
        });
      }

      // Get indexes
      const indexes = await sql`
        SELECT
          indexname,
          indexdef
        FROM pg_indexes
        WHERE schemaname = 'public'
          AND tablename = ${tableName}
      `;

      if (indexes.length > 0) {
        console.log('\nIndexes:');
        indexes.forEach((idx: any) => {
          console.log(`  📇 ${idx.indexname}`);
        });
      }
    }

    // Summary
    console.log('\n' + '='.repeat(80));
    console.log('📊 SCHEMA SUMMARY');
    console.log('='.repeat(80));

    const userCount = await sql`SELECT COUNT(*) as count FROM users`;
    const planCount = await sql`SELECT COUNT(*) as count FROM plans`;
    const docCount = await sql`SELECT COUNT(*) as count FROM documents`;
    const promptCount = await sql`SELECT COUNT(*) as count FROM prompts`;

    console.log(`  ${'users'.padEnd(20)} - ${userCount[0].count} records`);
    console.log(`  ${'plans'.padEnd(20)} - ${planCount[0].count} records`);
    console.log(`  ${'documents'.padEnd(20)} - ${docCount[0].count} records`);
    console.log(`  ${'prompts'.padEnd(20)} - ${promptCount[0].count} records`);

    console.log('\n✅ Schema inspection complete!');

  } catch (error) {
    console.error('\n❌ Inspection failed:', error);
    process.exit(1);
  }
}

inspectSchema();
