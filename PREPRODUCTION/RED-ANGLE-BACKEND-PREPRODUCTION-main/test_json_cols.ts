import { pool } from './src/config/db';

async function run() {
  try {
    const res = await pool.query(`
      SELECT table_name, column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name IN ('notifications', 'lead_tracking_stages', 'event_details', 'event_runtime_sessions')
      AND data_type IN ('json', 'jsonb')
    `);
    console.log('JSON columns:', res.rows);
  } catch(e) {
    console.error(e);
  }
  process.exit(0);
}
run();
