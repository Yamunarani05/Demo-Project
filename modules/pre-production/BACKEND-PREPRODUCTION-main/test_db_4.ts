import { pool } from './src/config/db';

async function run() {
  const le = await pool.query("SELECT * FROM lead_employee LIMIT 2;");
  console.log("lead_employee cols:", Object.keys(le.rows[0] || {}));
  console.log("lead_employee row:", le.rows[0]);
  process.exit();
}
run();
