import { Client } from 'pg';

async function run() {
  const client = new Client({
    connectionString: "postgresql://postgres:password@localhost:6000/Redangle-sales"
  });
  await client.connect();
  const cd = await client.query("SELECT * FROM client_deliveries WHERE lead_id = 1;");
  console.log("client_deliveries for lead 1:", cd.rows);
  await client.end();
}
run();
