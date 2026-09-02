const { Client } = require('pg');

async function test() {
  const client = new Client({connectionString: 'postgres://postgres:password@localhost:6000/Redangle-Preproduction'});
  await client.connect();
  const res = await client.query("SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'leads_detail') AS exists");
  console.log("leads_detail exists in preprod:", res.rows[0].exists);
  await client.end();
}

test();
