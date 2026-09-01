import { Client } from 'pg';

async function run() {
  const client = new Client({
    connectionString: "postgresql://postgres:password@localhost:6000/Redangle-sales"
  });
  await client.connect();
  const res = await client.query("SELECT lead_id, lead_serial_number FROM leads_detail;");
  console.log("leads_detail:", res.rows);
  const cd = await client.query("SELECT id, lead_id, delivery_type FROM client_deliveries;");
  console.log("client_deliveries:", cd.rows);
  await client.end();
}
run();
