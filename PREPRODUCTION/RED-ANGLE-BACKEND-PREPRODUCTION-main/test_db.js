const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres:yourpassword@localhost:5432/postgres' });

async function run() {
  const res = await pool.query(`SELECT lead_id, lead_serial_number FROM leads_detail WHERE lead_id IN (3, 4)`);
  console.log(res.rows);
  const cd = await pool.query(`SELECT id, lead_id, delivery_type, drive_link FROM client_deliveries WHERE lead_id IN (3, 4)`);
  console.log(cd.rows);
  process.exit(0);
}
run();
