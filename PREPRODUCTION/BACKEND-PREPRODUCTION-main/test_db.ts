import { salesPool } from './src/config/db';

async function run() {
  try {
    const res = await salesPool.query(`SELECT lead_id, lead_serial_number FROM leads_detail WHERE lead_id IN (3, 4)`);
    console.log('Leads:', res.rows);
    const cd = await salesPool.query(`SELECT id, lead_id, delivery_type, drive_link FROM client_deliveries WHERE lead_id IN (3, 4)`);
    console.log('Deliveries:', cd.rows);
  } catch(e) {
    console.error(e);
  }
  process.exit(0);
}
run();
