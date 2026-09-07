const { Client } = require('pg');
const client = new Client({connectionString: 'postgres://postgres:password@localhost:6000/Redangle-Preproduction'});
client.connect()
  .then(() => client.query("SELECT * FROM client_deliveries WHERE lead_id IN (SELECT external_id::integer FROM external_leads WHERE lead_serial_number IN ('LD-04', 'LD-05') AND external_id IS NOT NULL AND external_id ~ '^[0-9]+$') ORDER BY created_at DESC"))
  .then(res => { console.log(JSON.stringify(res.rows, null, 2)); client.end(); })
  .catch(e => console.error(e));
