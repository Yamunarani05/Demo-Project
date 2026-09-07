const { Client } = require('pg');
const client = new Client('postgresql://postgres:password@localhost:6000/Redangle-Preproduction');
client.connect()
  .then(() => client.query(`UPDATE event_media_clips SET video_first_clip = NULL, video_last_clip = NULL WHERE external_lead_id='LD-01'`))
  .then(res => { console.log('Wiped video clips', res.rowCount); client.end(); })
  .catch(console.error);
