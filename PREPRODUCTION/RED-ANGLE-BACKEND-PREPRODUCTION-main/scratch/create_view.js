const { Pool } = require('pg');
require('dotenv').config();
const fs = require('fs');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
});

async function createView() {
    try {
        const sql = fs.readFileSync('scratch/create_lead_employee_view.sql', 'utf8');
        await pool.query(sql);
        console.log("SQL executed successfully");
    } catch (err) {
        console.error(err);
    } finally {
        pool.end();
    }
}
createView();
