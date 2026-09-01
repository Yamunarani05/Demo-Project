import { Client } from 'pg';

async function run() {
  const client = new Client({
    connectionString: "postgresql://postgres:password@localhost:6000/Redangle-Preproduction"
  });
  await client.connect();
  const res = await client.query("SELECT drive_link, video_drive_link FROM pre_production_shoots WHERE external_lead_id = 'LD-02' OR external_lead_id = '2'");
  console.log("pre_production_shoots drive links:", res.rows);
  const ed = await client.query("SELECT drive_link, video_drive_link FROM event_details WHERE external_lead_id = 'LD-02' OR external_lead_id = '2'");
  console.log("event_details drive links:", ed.rows);
  await client.end();
}
run();
