const { Pool } = require('pg');
const fs = require('fs');

const poolPreProd = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'Redangle-Preproduction',
  password: 'password',
  port: 6000,
});

async function run() {
  const res = await poolPreProd.query("SELECT * FROM pre_production_shoots WHERE external_lead_id = 'RAS-01'");
  fs.writeFileSync('pps.json', JSON.stringify(res.rows, null, 2));
  process.exit();
}
run();
