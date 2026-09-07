import { pool } from './src/config/db';

async function run() {
  const pps = await pool.query("SELECT * FROM pre_production_shoots LIMIT 1;");
  console.log("Pre-production Shoots cols:", Object.keys(pps.rows[0] || {}));
  const ed = await pool.query("SELECT * FROM event_details LIMIT 1;");
  console.log("Event Details cols:", Object.keys(ed.rows[0] || {}));
  process.exit();
}
run();
