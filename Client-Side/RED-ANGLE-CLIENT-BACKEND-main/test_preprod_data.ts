import { Client } from 'pg';

async function run() {
  const client = new Client({
    connectionString: "postgresql://postgres:password@localhost:6000/Redangle-Preproduction"
  });
  await client.connect();
  const res = await client.query("SELECT * FROM pre_production_shoots WHERE external_lead_id = 'LD-02' OR external_lead_id = '2'");
  console.log("pre_production_shoots:", res.rows);
  const ed = await client.query("SELECT * FROM event_details WHERE external_lead_id = 'LD-02' OR external_lead_id = '2'");
  console.log("event_details:", ed.rows);
  await client.end();
}
run();
