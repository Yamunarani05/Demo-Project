import { pool } from './src/config/db';

async function run() {
  const { rows } = await pool.query("SELECT * FROM event_details LIMIT 1;");
  console.log(rows);
  const pps = await pool.query("SELECT * FROM pre_production_shoots LIMIT 1;");
  console.log(pps.rows);
  process.exit();
}
run();
