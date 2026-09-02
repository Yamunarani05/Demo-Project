const { Client } = require('pg');

async function test() {
  const client = new Client({connectionString: 'postgres://postgres:password@localhost:6000/postgres'});
  await client.connect();
  const res = await client.query("SELECT datname FROM pg_database WHERE datistemplate = false;");
  console.log(res.rows.map(r => r.datname));
  await client.end();
}

test();
