const { Pool } = require('pg');
require('dotenv').config({ path: 'e:/Redangle/RED-ANGLE-BACKEND-PREPRODUCTION/.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function run() {
  try {
    const res = await pool.query('SELECT * FROM employees_attendance LIMIT 1');
    console.log("Attendance columns:", Object.keys(res.rows[0] || {}));
    
    const leaveRes = await pool.query('SELECT * FROM employee_leave_requests LIMIT 1');
    console.log("Leave columns:", Object.keys(leaveRes.rows[0] || {}));
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}
run();
