const { Client } = require('pg');
const client = new Client({connectionString: 'postgres://postgres:password@localhost:6000/Redangle-Preproduction'});
client.connect()
  .then(() => client.query("SELECT * FROM client_deliveries ORDER BY created_at DESC LIMIT 5"))
  .then(res => { console.log("Preproduction DB:", JSON.stringify(res.rows, null, 2)); client.end(); })
  .catch(e => console.error(e));
