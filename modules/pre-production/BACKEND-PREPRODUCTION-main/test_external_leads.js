const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres:password@localhost:6000/Redangle-Preproduction' });

async function test() {
  try {
    const res = await pool.query(`
      SELECT external_id, lead_serial_number 
      FROM external_leads 
      WHERE external_id::text = $1 OR lead_serial_number = $1 
      LIMIT 1
    `, ['RAS-01']);
    console.log(res.rows);
  } catch (e) {
    console.error(e.message);
  } finally {
    pool.end();
  }
}

test();
