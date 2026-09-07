const { Client } = require('pg');

const client1 = new Client({
  connectionString: "postgresql://postgres:password@localhost:6000/postgres"
});

async function testConn(client, label) {
  try {
    console.log(`Connecting to ${label}...`);
    await client.connect();
    console.log(`Connected successfully to ${label}!`);
    const res = await client.query('SELECT NOW()');
    console.log(`Result from ${label}:`, res.rows[0]);
    await client.end();
  } catch (err) {
    console.error(`Error connecting to ${label}:`, err.message || err);
  }
}

async function run() {
  await testConn(client1, 'password = password');
}

run();
