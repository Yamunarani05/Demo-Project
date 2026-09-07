import fs from 'fs';
import path from 'path';
import { pool } from '../config/database';

async function runMigrations() {
  console.log('🚀 Starting PostgreSQL Database Migrations for LUMINA SaaS...');
  const client = await pool.connect();

  try {
    // 1. Ensure migrations tracking table exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Discover migration files
    const migrationsDir = path.resolve(__dirname, '../../migrations');
    if (!fs.existsSync(migrationsDir)) {
      throw new Error(`Migrations directory not found at: ${migrationsDir}`);
    }

    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    console.log(`📂 Found ${files.length} migration file(s) in ${migrationsDir}`);

    for (const file of files) {
      const alreadyExecuted = await client.query(
        'SELECT id FROM schema_migrations WHERE filename = $1',
        [file]
      );

      if (alreadyExecuted.rows.length > 0) {
        console.log(`⏩ Skipping already applied migration: ${file}`);
        continue;
      }

      console.log(`▶️ Applying migration: ${file}...`);
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf-8');

      await client.query('BEGIN');
      await client.query(sql);
      await client.query('INSERT INTO schema_migrations (filename) VALUES ($1)', [file]);
      await client.query('COMMIT');

      console.log(`✅ Applied migration successfully: ${file}`);
    }

    console.log('🎉 All PostgreSQL migrations completed successfully!');
  } catch (err: any) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', err?.message || err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigrations().catch(err => {
  console.error('Fatal migration error:', err);
  process.exit(1);
});
