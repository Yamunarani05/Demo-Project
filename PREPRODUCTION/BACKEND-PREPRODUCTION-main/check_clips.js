const { Client } = require('pg');
const client = new Client('postgresql://postgres:password@localhost:6000/Redangle-Preproduction');
client.connect()
  .then(() => client.query(`SELECT photo_first_clip, video_first_clip FROM event_media_clips WHERE external_lead_id='LD-01'`))
  .then(res => { console.log(res.rows); client.end(); })
  .catch(console.error);
