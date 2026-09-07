import { pool } from './src/config/db';

async function run() {
  const pps = await pool.query("SELECT * FROM pre_production_shoots WHERE external_lead_id = 'LD-01' OR external_lead_id = '1' LIMIT 1;");
  console.log("pps:", pps.rows[0]);
  process.exit();
}
run();
