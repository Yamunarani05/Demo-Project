import { preprodPool } from './src/config/db';

async function testPreprodPool() {
  try {
    const { rows } = await preprodPool.query("SELECT * FROM pre_production_shoots WHERE external_lead_id = 'LD-01' LIMIT 1");
    console.log("Success! Preprod DB accessible from Client Backend:", rows);
  } catch (err) {
    console.error("Failed to access Preprod DB:", err);
  }
  process.exit();
}

testPreprodPool();
