const { Client } = require('pg');

async function test() {
  const client = new Client({connectionString: 'postgres://postgres:password@localhost:6000/Redangle-Preproduction'});
  await client.connect();
  const res = await client.query('SELECT * FROM client_deliveries ORDER BY created_at DESC LIMIT 5');
  console.log(res.rows);
  await client.end();
}

test();
