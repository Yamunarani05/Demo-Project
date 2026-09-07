import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { pool } from '../config/database';

async function runSeeders() {
  console.log('🌱 Starting LUMINA SaaS Database Seeder...');
  const client = await pool.connect();

  try {
    const seedFilePath = path.resolve(__dirname, '../../seeders/001_seed_data.sql');
    if (!fs.existsSync(seedFilePath)) {
      throw new Error(`Seed file not found at: ${seedFilePath}`);
    }

    let sql = fs.readFileSync(seedFilePath, 'utf-8');

    // Replace dummy hash with a fresh live bcrypt hash of '123456789'
    const liveHash = await bcrypt.hash('123456789', 10);
    sql = sql.replace(/\$2a\$10\$eE0m93D6j8aC0x2W9rLg\.u8bJ1vK0rP7wS3jE2vM5nB4vC3xZ1yAa/g, liveHash);

    await client.query('BEGIN');
    await client.query(sql);
    await client.query('COMMIT');

    console.log('✅ Base seed data applied successfully!');

    // Query stats to confirm
    const studios = await client.query('SELECT COUNT(*) FROM studios');
    const users = await client.query('SELECT COUNT(*) FROM users');
    const clients = await client.query('SELECT COUNT(*) FROM clients');
    const projects = await client.query('SELECT COUNT(*) FROM projects');
    const leads = await client.query('SELECT COUNT(*) FROM leads');
    const invoices = await client.query('SELECT COUNT(*) FROM invoices');

    console.log('\n📊 Database Seed Summary:');
    console.log(`   - Studios:  ${studios.rows[0].count}`);
    console.log(`   - Users:    ${users.rows[0].count}`);
    console.log(`   - Clients:  ${clients.rows[0].count}`);
    console.log(`   - Projects: ${projects.rows[0].count}`);
    console.log(`   - Leads:    ${leads.rows[0].count}`);
    console.log(`   - Invoices: ${invoices.rows[0].count}`);
    console.log('\n🔑 Demo User Logins:');
    console.log('   - Great Master: master@greatmaster.io / 123456789');
    console.log('   - Studio Aurora: priya@studioaurora.in / 123456789');
    console.log('   - Sales Rep:     krishna@lumina.io / 123456789');
    console.log('\n🎉 Seeding completed successfully!');
  } catch (err: any) {
    await client.query('ROLLBACK');
    console.error('❌ Seeding failed:', err?.message || err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runSeeders().catch(err => {
  console.error('Fatal seed error:', err);
  process.exit(1);
});
