const { Client } = require('pg');
const client = new Client('postgresql://postgres:password@localhost:6000/Redangle-Preproduction');
client.connect()
  .then(() => client.query(`UPDATE assign_teams SET accepted_assignments = '[]'::jsonb WHERE external_lead_id='LD-01'`))
  .then(res => { console.log('Wiped', res.rowCount); client.end(); })
  .catch(console.error);
