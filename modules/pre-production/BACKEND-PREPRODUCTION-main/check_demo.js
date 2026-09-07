const { Client } = require('pg');
const client = new Client('postgresql://postgres:password@localhost:6000/Redangle-Preproduction');
client.connect()
  .then(() => client.query(`SELECT external_lead_id, drive_link, video_drive_link FROM event_details WHERE client_name='DEMO 1'`))
  .then(res => { console.log(res.rows); client.end(); })
  .catch(console.error);
