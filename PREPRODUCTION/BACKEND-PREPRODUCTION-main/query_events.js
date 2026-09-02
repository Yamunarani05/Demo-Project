const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 6000,
  user: 'postgres',
  password: 'password',
  database: 'Redangle-Preproduction'
});

async function run() {
  await client.connect();
  const res = await client.query("SELECT * FROM event_details WHERE external_lead_id='RAS-01'");
  const fs = require('fs');
  fs.writeFileSync('events_dump.json', JSON.stringify(res.rows, null, 2));
  await client.end();
}

run();
