import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const salesPool = new Pool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '6000'),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.SALES_DB_NAME,
});

async function run() {
  try {
    const lead = await salesPool.query('SELECT * FROM leads_detail WHERE lead_id = 1');
    console.log('Sales Lead ID 1:', lead.rows[0]);

    const del = await salesPool.query('SELECT * FROM client_deliveries WHERE lead_id = 1');
    console.log('Client Deliveries for Lead 1:', del.rows);
  } catch(e) {
    console.error(e);
  }
  process.exit(0);
}
run();
