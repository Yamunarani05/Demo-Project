const { Client } = require('pg');
const client = new Client('postgresql://postgres:password@localhost:6000/Redangle-Preproduction');
client.connect()
  .then(() => client.query(`UPDATE event_details SET video_included_file_format = NULL WHERE external_lead_id='LD-01'`))
  .then(res => { console.log('Wiped video_included_file_format', res.rowCount); client.end(); })
  .catch(console.error);
