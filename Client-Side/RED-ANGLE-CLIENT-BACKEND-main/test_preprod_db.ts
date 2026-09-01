import { Client } from 'pg';

async function run() {
  const client = new Client({
    connectionString: "postgresql://postgres:password@localhost:6000/Redangle-Preproduction"
  });
  await client.connect();
  try {
    const cd = await client.query("SELECT * FROM client_deliveries;");
    console.log("client_deliveries in Preproduction:", cd.rows);
  } catch (e) {
    console.log("No client_deliveries table in Preproduction.");
  }
  await client.end();
}
run();
