import { pool } from './src/config/db';

async function run() {
  try {
    const res = await pool.query(`
      SELECT event_object_table AS table_name, trigger_name, action_statement
      FROM information_schema.triggers
      WHERE trigger_schema = 'public'
    `);
    console.log('Triggers:', res.rows);
  } catch(e) {
    console.error(e);
  }
  process.exit(0);
}
run();
