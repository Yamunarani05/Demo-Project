const { Client } = require("pg");

const client = new Client({
  host: "localhost",
  port: 6000,
  user: "postgres",
  password: "password",
  database: "Redangle-Preproduction"
});

async function run() {
  await client.connect();
  try {
    await client.query("ALTER TABLE creative_confirmations ADD COLUMN IF NOT EXISTS base64_images JSONB DEFAULT '[]'::jsonb;");
    console.log("Column base64_images added successfully");
  } catch(e) {
    console.error(e);
  } finally {
    await client.end();
  }
}

run();
